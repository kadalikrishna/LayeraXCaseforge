import type { CaseConfiguration, DevicePreset, GeometryStatus, ReleasedGeometryAsset } from "./types";

export const manufacturingProfiles = {
  "tpu95a-04-020-v1": {
    material: "TPU 95A",
    nozzleDiameter: 0.4,
    layerHeight: 0.2,
    note: "Printer, slicer, filament, temperature, flow, and shrink settings must be recorded in the private validation report.",
  },
} as const;

export const geometryStatusLabels: Record<GeometryStatus, string> = {
  approximate: "Approximate preview",
  "cad-prepared": "CAD prepared",
  "sample-verified": "Sample verified",
  "production-validated": "Production validated",
  retired: "Retired",
};

export function validateReleasedAsset(asset?: ReleasedGeometryAsset): string[] {
  if (!asset) return ["No released base-case asset is registered."];
  const issues: string[] = [];
  if (!/^\/geometry\/released\/[a-z0-9/_-]+\.stl$/i.test(asset.baseCaseStl)) issues.push("Released STL path is invalid.");
  if (!/^[a-f0-9]{64}$/i.test(asset.sha256)) issues.push("Released STL checksum must be SHA-256.");
  if (!(asset.manufacturingProfileId in manufacturingProfiles)) issues.push("Manufacturing profile is unknown.");
  if (asset.physicalSampleCount < 2) issues.push("At least two physical phones are required.");
  if (asset.consecutivePassingPrints < 3) issues.push("Three consecutive passing prints are required.");
  if (asset.outerSize.some((value) => !Number.isFinite(value) || value <= 0)) issues.push("Released outer dimensions are invalid.");
  if (Number.isNaN(Date.parse(asset.validatedAt))) issues.push("Validation date is invalid.");
  return issues;
}

export function getReleaseIssues(device: DevicePreset): string[] {
  if (device.geometryStatus !== "production-validated") return [`${geometryStatusLabels[device.geometryStatus]} geometry cannot be exported for production.`];
  if (!device.modelCodes.length) return ["An exact manufacturer model code is required."];
  return validateReleasedAsset(device.geometryAsset);
}

export function getExportIssues(device: DevicePreset, configuration: CaseConfiguration): string[] {
  const issues = getReleaseIssues(device);
  if (configuration.style !== "protective") issues.push("Only the validated protective TPU architecture can be exported.");
  const decorated = configuration.pattern !== "solid" || configuration.text.value.trim().length > 0;
  const limits = device.geometryAsset?.customization;
  if (decorated && !limits) issues.push("This release has no validated decoration limits; use a solid case without text.");
  if (decorated && limits) {
    const values = [limits.maxEmbossDepth, limits.maxEngraveDepth, limits.minBackThickness, limits.backThickness];
    if (values.some((value) => !Number.isFinite(value) || value < 0) || limits.minBackThickness <= 0 || limits.backThickness < limits.minBackThickness) issues.push("Decoration validation metadata is invalid.");
    const features = [...(configuration.pattern !== "solid" ? [{ mode: configuration.patternMode, depth: configuration.patternDepth }] : []), ...(configuration.text.value.trim() ? [configuration.text] : [])];
    for (const feature of features) {
      if (feature.depth > (feature.mode === "emboss" ? limits.maxEmbossDepth : limits.maxEngraveDepth)) issues.push("Decoration depth exceeds this release's validated limit.");
      if (feature.mode === "engrave" && limits.backThickness - feature.depth - 0.12 < limits.minBackThickness) issues.push("Engraving would leave insufficient back thickness.");
    }
  }
  return issues;
}

export function canExportProductionStl(device: DevicePreset, configuration: CaseConfiguration) {
  return getExportIssues(device, configuration).length === 0;
}
