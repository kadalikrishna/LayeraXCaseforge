import { deserialize } from "@jscad/stl-deserializer";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";
import type { DevicePreset } from "./types";
import { getReleaseIssues } from "./release";

export async function loadReleasedBaseCase(device: DevicePreset): Promise<Geom3> {
  const issues = getReleaseIssues(device);
  if (issues.length) throw new Error(issues.join(" "));
  const asset = device.geometryAsset!;
  const response = await fetch(asset.baseCaseStl);
  if (!response.ok) throw new Error(`Unable to load released geometry (${response.status}).`);
  const buffer = await response.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const checksum = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  if (checksum !== asset.sha256.toLowerCase()) throw new Error("Released geometry checksum mismatch.");
  const geometries = deserialize({ filename: asset.baseCaseStl, output: "geometry" }, buffer) as Geom3[];
  if (geometries.length !== 1) throw new Error("Released geometry must contain exactly one solid.");
  return geometries[0];
}
