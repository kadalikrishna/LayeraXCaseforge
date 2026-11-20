import { describe, expect, it } from "vitest";
import { devices, getDevice } from "./catalog";

describe("reference-informed model profiles", () => {
  it("covers exactly the 33 selected models without asserting fit", () => {
    const profiled = devices.filter((device) => device.profile);
    expect(profiled).toHaveLength(33);
    expect(profiled.every((device) => device.geometryStatus === "approximate" && device.profile!.sources.length > 0 && device.profile!.pending.length > 0)).toBe(true);
    expect(devices.filter((device) => !device.profile)).toHaveLength(23);
  });
  it("distinguishes camera rings, islands and bars", () => {
    expect(getDevice("galaxy-s24-ultra").profile!.openings.every((region) => region.shape === "circle")).toBe(true);
    expect(getDevice("iphone-15-pro").profile!.cameraKind).toBe("island");
    expect(getDevice("pixel-9").profile!.cameraKind).toBe("bar");
    expect(getDevice("galaxy-s22").profile!.cameraKind).toBe("island");
  });
  it("keeps Apple controls distinct and Samsung/Google volume on the right", () => {
    const apple = getDevice("iphone-16-pro").edgeFeatures;
    expect(apple.some((feature) => feature.label === "Camera Control" && feature.kind === "cutout")).toBe(true);
    expect(apple.some((feature) => feature.label === "Action button")).toBe(true);
    expect(getDevice("iphone-14").edgeFeatures.some((feature) => feature.label === "Ring / silent switch")).toBe(true);
    for (const id of ["galaxy-s24-ultra", "pixel-9"]) expect(getDevice(id).edgeFeatures.filter((feature) => feature.kind === "button").every((feature) => feature.edge === "right")).toBe(true);
    expect(getDevice("galaxy-s24-ultra").edgeFeatures.some((feature) => feature.label === "S Pen access")).toBe(true);
  });
  it("uses squarer Ultra corners independently of body depth", () => {
    expect(getDevice("galaxy-s24-ultra").cornerRadius).toBeLessThan(getDevice("pixel-9").cornerRadius);
    expect(getDevice("iphone-15-pro").cornerRadius).toBeGreaterThan(getDevice("iphone-15-pro").thickness);
  });
});
