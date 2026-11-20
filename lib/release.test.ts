import { describe, expect, it } from "vitest";
import { devices } from "./catalog";
import { defaultConfiguration } from "./project";
import { getExportIssues, validateReleasedAsset } from "./release";

describe("production geometry releases", () => {
  it("requires approved decoration limits and enough remaining back thickness", () => {
    const device = { ...devices[0], geometryAsset: { baseCaseStl: "/geometry/released/test/case.stl", sha256: "a".repeat(64), revision: "test", manufacturingProfileId: "tpu95a-04-020-v1", outerSize: [80, 160, 12] as [number, number, number], validatedAt: "2026-09-14", physicalSampleCount: 2, consecutivePassingPrints: 3 } };
    const config = { ...defaultConfiguration, pattern: "dots" as const, patternMode: "engrave" as const, patternDepth: 1.2 };
    expect(getExportIssues(device, config).some((issue) => issue.includes("no validated decoration limits"))).toBe(true);
    const limited = { ...device, geometryAsset: { ...device.geometryAsset, customization: { maxEmbossDepth: 1, maxEngraveDepth: 0.6, minBackThickness: 1.2, backThickness: 1.9 } } };
    expect(getExportIssues(limited, config)).toContain("Decoration depth exceeds this release's validated limit.");
    expect(getExportIssues(limited, config)).toContain("Engraving would leave insufficient back thickness.");
  });

  it("blocks every approximate catalog model from STL export", () => {
    expect(devices.every((device) => getExportIssues(device, defaultConfiguration).length > 0)).toBe(true);
  });

  it("requires two phones, three prints, a known profile, and a checksum", () => {
    expect(validateReleasedAsset({
      baseCaseStl: "/geometry/released/apple/example.stl",
      sha256: "a".repeat(64),
      revision: "r1",
      manufacturingProfileId: "tpu95a-04-020-v1",
      outerSize: [80, 165, 12],
      validatedAt: "2026-07-18",
      physicalSampleCount: 2,
      consecutivePassingPrints: 3,
    })).toEqual([]);
  });
});
