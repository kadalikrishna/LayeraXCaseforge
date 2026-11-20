import type { CaseConfiguration, DevicePreset } from "./types";
export type GeometryRequest = { id: number; device: DevicePreset; configuration: CaseConfiguration };
export type GeometryResponse = { id: number; positions?: Float32Array; phone?: Float32Array; elapsedMs?: number; error?: string };
export function geometryKey(device: DevicePreset, configuration: CaseConfiguration) {
  const { color: _color, finish: _finish, showPhone: _showPhone, phoneOpacity: _opacity, ...shape } = configuration;
  void _color; void _finish; void _showPhone; void _opacity;
  return JSON.stringify([device.id, device.profile?.revision, device.geometryAsset?.sha256, shape]);
}

// Only one worker request is in flight. Intermediate slider values are replaced,
// and old results never overwrite the latest requested configuration.
export class GeometryQueue {
  private sequence = 0;
  private active: number | null = null;
  private queued: GeometryRequest | null = null;
  private latest = 0;
  constructor(private send: (request: GeometryRequest) => void, private accept: (response: GeometryResponse) => void) {}
  invalidate() { this.latest = ++this.sequence; this.queued = null; }
  request(device: DevicePreset, configuration: CaseConfiguration) {
    const request = { id: ++this.sequence, device, configuration };
    this.latest = request.id;
    if (this.active !== null) this.queued = request;
    else { this.active = request.id; this.send(request); }
    return request.id;
  }
  receive(response: GeometryResponse) {
    if (response.id !== this.active) return;
    this.active = null;
    if (response.id === this.latest) this.accept(response);
    if (this.queued) { const next = this.queued; this.queued = null; this.active = next.id; this.send(next); }
  }
}
