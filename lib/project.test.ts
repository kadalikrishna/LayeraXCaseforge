import { describe, expect, it } from "vitest";
import { createProject, defaultConfiguration, parseProject, restoreProject } from "./project";
import { devices } from "./catalog";

describe("project files", () => {
  it("round trips a versioned project", () => {
    const project = createProject(devices[0], defaultConfiguration);
    expect(parseProject(JSON.parse(JSON.stringify(project)))).toEqual(project);
  });

  it("rejects an unknown schema", () => {
    expect(() => parseProject({ schemaVersion: 99 })).toThrow();
  });

  it("restores the saved phone and settings together", () => {
    const configuration = { ...defaultConfiguration, color: "#f97316" };
    const saved = JSON.stringify(createProject(devices[1], configuration));
    const restored = restoreProject(JSON.parse(saved));
    expect(restored.device.id).toBe(devices[1].id);
    expect(restored.configuration).toEqual(configuration);
  });

  it("rejects unknown phones and malformed colors", () => {
    const project = createProject(devices[0], defaultConfiguration);
    expect(() => restoreProject({ ...project, deviceId: "unknown-phone" })).toThrow();
    expect(() => restoreProject({ ...project, configuration: { ...project.configuration, color: "bad" } })).toThrow();
  });

  it("migrates legacy projects without losing their selected phone", () => {
    const project = createProject(devices[1], defaultConfiguration);
    for (const schemaVersion of [1, 2]) {
      const restored = restoreProject({ ...project, schemaVersion });
      expect(restored.project.schemaVersion).toBe(3);
      expect(restored.device.id).toBe(devices[1].id);
      expect(restored.configuration.patternScale).toBe(1);
    }
  });
});
