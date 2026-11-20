import { describe, expect, it, vi } from "vitest";
import { devices } from "./catalog";
import { defaultConfiguration } from "./project";
import { geometryKey, GeometryQueue } from "./geometry-protocol";

describe("background geometry", () => {
  it("does not rebuild for appearance-only changes", () => {
    const key = geometryKey(devices[0], defaultConfiguration);
    expect(geometryKey(devices[0], { ...defaultConfiguration, color: "#ffffff", finish: "matte", showPhone: true })).toBe(key);
    expect(geometryKey(devices[0], { ...defaultConfiguration, pattern: "dots" })).not.toBe(key);
  });
  it("drops obsolete work and sends only the latest pending edit", () => {
    const send = vi.fn(), accept = vi.fn();
    const queue = new GeometryQueue(send, accept);
    const first = queue.request(devices[0], defaultConfiguration);
    queue.request(devices[0], { ...defaultConfiguration, pattern: "dots" });
    const last = queue.request(devices[0], { ...defaultConfiguration, pattern: "waves" });
    expect(send).toHaveBeenCalledTimes(1);
    queue.receive({ id: first });
    expect(accept).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[1][0].id).toBe(last);
    queue.receive({ id: first });
    expect(accept).not.toHaveBeenCalled();
    queue.receive({ id: last, error: "failed" });
    expect(accept).toHaveBeenCalledWith({ id: last, error: "failed" });
    queue.request(devices[0], defaultConfiguration);
    expect(send).toHaveBeenCalledTimes(3);
  });
  it("invalidates an in-flight result while the next input is debounced", () => {
    const accept = vi.fn(); const queue = new GeometryQueue(vi.fn(), accept);
    const first = queue.request(devices[0], defaultConfiguration);
    queue.invalidate(); queue.receive({ id: first });
    expect(accept).not.toHaveBeenCalled();
  });
});
