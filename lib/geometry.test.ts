import { geometries, measurements } from "@jscad/modeling";
import { describe, expect, it } from "vitest";
import { devices } from "./catalog";
import { searchDevices } from "./catalog";
import { createCaseSolid, getCaseMetrics, validateCase } from "./geometry";
import { defaultConfiguration } from "./project";

describe("case geometry", () => {
  it("keeps long rear lettering within the case footprint", () => {
    const plain = createCaseSolid(devices[0], { ...defaultConfiguration, pattern: "solid" });
    const decorated = createCaseSolid(devices[0], { ...defaultConfiguration, pattern: "solid", text: { ...defaultConfiguration.text, value: "PRESENTATION READY", scale: 2 } });
    const plainBounds = measurements.measureBoundingBox(plain);
    const textBounds = measurements.measureBoundingBox(decorated);
    for (const axis of [0, 1]) {
      expect(textBounds[0][axis]).toBeCloseTo(plainBounds[0][axis], 4);
      expect(textBounds[1][axis]).toBeCloseTo(plainBounds[1][axis], 4);
    }
    expect(textBounds[0][2]).toBeLessThan(plainBounds[0][2] + 0.01);
  }, 60000);

  const patternScenarios = (["solid", "diagonal", "grid", "dots", "waves"] as const).flatMap((pattern) => (["emboss", "engrave"] as const).map((mode) => ({ pattern, mode })));
  it.each(patternScenarios)("renders $pattern / $mode with custom text", ({ pattern, mode }) => {
    const solid = createCaseSolid(devices[0], { ...defaultConfiguration, pattern, patternMode: mode, text: { ...defaultConfiguration.text, value: "LX", mode } });
    expect(measurements.measureVolume(solid)).toBeGreaterThan(0);
    expect(geometries.geom3.toPolygons(solid).every((polygon) => polygon.vertices.every((vertex) => vertex.every(Number.isFinite)))).toBe(true);
  }, 60000);

  it.each(devices)("creates finite polygons for $name", (device) => {
    const solid = createCaseSolid(device, { ...defaultConfiguration, pattern: "solid" });
    expect(geometries.geom3.toPolygons(solid).length).toBeGreaterThan(100);
    expect(measurements.measureVolume(solid)).toBeGreaterThan(0);
  }, 30000);
  it("makes the protective case larger than the slim case", () => {
    const device = devices[0];
    const slim = getCaseMetrics(device, { ...defaultConfiguration, style: "slim" });
    const protective = getCaseMetrics(device, { ...defaultConfiguration, style: "protective" });
    expect(protective.outerWidth).toBeGreaterThan(slim.outerWidth);
    expect(protective.outerDepth).toBeGreaterThan(slim.outerDepth);
  });

  it("blocks unsafe text placement", () => {
    const warnings = validateCase(devices[0], { ...defaultConfiguration, text: { ...defaultConfiguration.text, value: "Layera", y: 100 } });
    expect(warnings).toContain("Text is outside the printable safe area.");
  });

  it("keeps the catalog inside the four-year slab-phone window", () => {
    expect(devices.length).toBeGreaterThan(40);
    expect(devices.every((device) => device.releaseYear >= 2022 && device.releaseYear <= 2025)).toBe(true);
    expect(devices.every((device) => device.edgeFeatures.some((feature) => feature.kind === "button"))).toBe(true);
  });

  it("finds models by brand, alias, and year", () => {
    expect(searchDevices("Galaxy S24 Plus").map((device) => device.id)).toContain("galaxy-s24-plus");
    expect(searchDevices("pixel", "google", 2024).every((device) => device.companyId === "google" && device.releaseYear === 2024)).toBe(true);
  });
});

