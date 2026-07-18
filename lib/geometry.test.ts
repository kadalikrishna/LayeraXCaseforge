import { geometries, measurements } from "@jscad/modeling";
import { describe, expect, it } from "vitest";
import { devices } from "./catalog";
import { searchDevices } from "./catalog";
import { createCaseSolid, getCaseMetrics, validateCase } from "./geometry";
import { defaultConfiguration } from "./project";

describe("case geometry", () => {
  it("creates finite polygons for every catalog device", () => {
    for (const device of devices) {
      const solid = createCaseSolid(device, { ...defaultConfiguration, pattern: "solid" });
      expect(geometries.geom3.toPolygons(solid).length).toBeGreaterThan(100);
      expect(measurements.measureVolume(solid)).toBeGreaterThan(0);
    }
  }, 60000);

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
