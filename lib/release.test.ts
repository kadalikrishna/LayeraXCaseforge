import { describe, expect, it } from "vitest";
import { devices } from "./catalog";
import { defaultConfiguration } from "./project";
import { getExportIssues, validateReleasedAsset } from "./release";

describe("production geometry releases", () => {
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
