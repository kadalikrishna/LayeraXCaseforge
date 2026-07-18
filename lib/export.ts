import { serialize } from "@jscad/stl-serializer";
import type { CaseConfiguration, DevicePreset, DesignProject } from "./types";
import { decorateCaseSolid } from "./geometry";
import { loadReleasedBaseCase } from "./released-geometry";
import { getExportIssues } from "./release";

export async function downloadStl(device: DevicePreset, config: CaseConfiguration) {
  const issues = getExportIssues(device, config);
  if (issues.length) throw new Error(issues.join(" "));
  const base = await loadReleasedBaseCase(device);
  const asset = device.geometryAsset!;
  const metrics = { outerWidth: asset.outerSize[0], outerHeight: asset.outerSize[1], outerDepth: asset.outerSize[2], volumeEstimate: 0 };
  const data = serialize({ binary: true }, decorateCaseSolid(base, device, config, metrics));
  const blob = new Blob(data as BlobPart[], { type: "model/stl" });
  download(`${fileBase(device, config)}.stl`, blob);
}

export function downloadProject(project: DesignProject) {
  download(`layera-x-caseforge-${project.deviceId}-project.json`, new Blob([JSON.stringify(project, null, 2)], { type: "application/json" }));
}

function fileBase(device: DevicePreset, config: CaseConfiguration) {
  const revision = device.geometryAsset?.revision ? `-${device.geometryAsset.revision}` : "";
  const clean = `${device.companyId}-${device.name}-${device.modelCodes[0] ?? "unvalidated"}${revision}-${config.style}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `layera-x-caseforge-${clean}`;
}

function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
