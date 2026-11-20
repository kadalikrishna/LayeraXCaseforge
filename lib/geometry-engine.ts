import type { Geom3 } from "@jscad/modeling/src/geometries/types";
import { createBaseCase, decorateCaseSolid, profileSolid } from "./geometry";
import { loadReleasedBaseCase } from "./released-geometry";
import { getCaseMetrics } from "./case-metrics";
import { meshPositions } from "./mesh-data";
import type { GeometryRequest, GeometryResponse } from "./geometry-protocol";

const bases = new Map<string, Geom3>();
const phones = new Map<string, Float32Array>();
export async function buildGeometry(request: GeometryRequest): Promise<GeometryResponse> {
  const start = performance.now();
  const { device, configuration, id } = request;
  try {
    const key = `${device.id}:${device.profile?.revision}:${configuration.style}:${device.geometryAsset?.sha256 ?? "preview"}`;
    let base = bases.get(key);
    if (!base) {
      base = device.geometryStatus === "production-validated" ? await loadReleasedBaseCase(device) : createBaseCase(device, configuration);
      if (bases.size >= 6) bases.delete(bases.keys().next().value!);
      bases.set(key, base);
    }
    let phone = phones.get(device.id);
    if (!phone) {
      phone = meshPositions(profileSolid(device.width, device.height, device.thickness, device.cornerRadius, device.profile?.edgeRadius ?? 0.5));
      if (phones.size >= 6) phones.delete(phones.keys().next().value!);
      phones.set(device.id, phone);
    }
    const solid = decorateCaseSolid(base, device, configuration, getCaseMetrics(device, configuration));
    return { id, positions: meshPositions(solid), phone: phone.slice(), elapsedMs: performance.now() - start };
  } catch (error) {
    return { id, error: error instanceof Error ? error.message : "Geometry could not be generated." };
  }
}
