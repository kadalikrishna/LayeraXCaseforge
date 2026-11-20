import type { CaseConfiguration, DevicePreset } from "./types";

export type CaseMetrics = { outerWidth: number; outerHeight: number; outerDepth: number; volumeEstimate: number };

export function getCaseMetrics(device: DevicePreset, config: CaseConfiguration): CaseMetrics {
  if (device.geometryStatus === "production-validated" && device.geometryAsset) {
    const [outerWidth, outerHeight, outerDepth] = device.geometryAsset.outerSize;
    return { outerWidth, outerHeight, outerDepth, volumeEstimate: 0 };
  }
  const profile = config.style === "protective" ? { wall: 2.4, back: 1.9, clearance: 0.45 } : { wall: 1.7, back: 1.4, clearance: 0.35 };
  const outerWidth = device.width + profile.clearance * 2 + profile.wall * 2;
  const outerHeight = device.height + profile.clearance * 2 + profile.wall * 2;
  const outerDepth = device.thickness + profile.clearance + profile.back + (config.style === "protective" ? 1 : 0.4);
  const shellVolume = outerWidth * outerHeight * outerDepth - (device.width + profile.clearance * 2) * (device.height + profile.clearance * 2) * (device.thickness + profile.clearance);
  return { outerWidth, outerHeight, outerDepth, volumeEstimate: Math.max(0, shellVolume / 1000) };
}


export function validateCase(device: DevicePreset, config: CaseConfiguration) {
  const warnings: string[] = [];
  if (config.text.value.length > 18) warnings.push("Text must be 18 characters or fewer.");
  if (Math.abs(config.text.x) > device.width / 2 - 8 || Math.abs(config.text.y) > device.height / 2 - 12) warnings.push("Text is outside the printable safe area.");
  if (config.patternDepth > 1.2 || config.text.depth > 1.2) warnings.push("Relief deeper than 1.2 mm may print poorly in TPU.");
  return warnings;
}

