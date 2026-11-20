import { describe, expect, it, vi } from "vitest";
import { primitives } from "@jscad/modeling";
import { devices } from "./catalog";
import { defaultConfiguration } from "./project";
import { buildGeometry } from "./geometry-engine";
import { meshPositions } from "./mesh-data";
import { decorateCaseSolid } from "./geometry";
import { getCaseMetrics } from "./case-metrics";
import type { DevicePreset } from "./types";

const { load } = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock("./released-geometry", () => ({ loadReleasedBaseCase: load }));

describe("released geometry preview", () => {
  it("uses the approved base and released dimensions used by STL decoration", async () => {
    const base = primitives.cuboid({ size: [80, 160, 12] });
    load.mockResolvedValue(base);
    const device: DevicePreset = { ...devices[0], id: "release-preview-fixture", geometryStatus: "production-validated", modelCodes: ["test-code"], geometryAsset: { baseCaseStl: "/geometry/released/test/case.stl", sha256: "a".repeat(64), revision: "test", manufacturingProfileId: "tpu95a-04-020-v1", outerSize: [80, 160, 12], validatedAt: "2026-09-14", physicalSampleCount: 2, consecutivePassingPrints: 3 } };
    const result = await buildGeometry({ id: 1, device, configuration: defaultConfiguration });
    expect(result.error).toBeUndefined();
    expect(load).toHaveBeenCalledWith(device);
    expect(result.positions).toEqual(meshPositions(decorateCaseSolid(base, device, defaultConfiguration, getCaseMetrics(device, defaultConfiguration))));
    await buildGeometry({ id: 2, device, configuration: defaultConfiguration });
    expect(load).toHaveBeenCalledTimes(1);
  });
  it("reports invalid geometry without rejecting the worker request", async () => {
    const device = { ...devices[0], id: "bad-fixture", width: -5 };
    expect((await buildGeometry({ id: 7, device, configuration: defaultConfiguration })).error).toBeTruthy();
  });
});
