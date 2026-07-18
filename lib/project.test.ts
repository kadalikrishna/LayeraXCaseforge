import { describe, expect, it } from "vitest";
import { createProject, defaultConfiguration, parseProject } from "./project";
import { devices } from "./catalog";

describe("project files", () => {
  it("round trips a versioned project", () => {
    const project = createProject(devices[0], defaultConfiguration);
    expect(parseProject(JSON.parse(JSON.stringify(project)))).toEqual(project);
  });

  it("rejects an unknown schema", () => {
    expect(() => parseProject({ schemaVersion: 99 })).toThrow();
  });
});
