import { z } from "zod";
import { catalogVersion, devices } from "./catalog";
import type { CaseConfiguration, DesignProject, DevicePreset } from "./types";

export const defaultConfiguration: CaseConfiguration = {
  style: "protective",
  color: "#e63329",
  finish: "satin",
  pattern: "solid",
  patternMode: "emboss",
  patternDepth: 0.6,
  patternScale: 1,
  patternSpacing: 10,
  patternRotation: 45,
  patternOffsetX: 0,
  patternOffsetY: 0,
  showPhone: false,
  phoneOpacity: 0.42,
  text: { id: "primary-text", kind: "text", value: "", mode: "emboss", x: 0, y: -18, scale: 1, rotation: 0, depth: 0.8 },
};

const configurationSchema = z.object({
    style: z.enum(["slim", "protective"]), color: z.string().regex(/^#[a-f0-9]{6}$/i), finish: z.enum(["matte", "satin", "gloss"]),
    pattern: z.enum(["solid", "diagonal", "grid", "dots", "waves"]), patternMode: z.enum(["emboss", "engrave"]),
    patternDepth: z.number().min(0.3).max(1.4),
    patternScale: z.number().min(0.6).max(2), patternSpacing: z.number().min(6).max(22),
    patternRotation: z.number().min(-180).max(180), patternOffsetX: z.number().min(-30).max(30), patternOffsetY: z.number().min(-30).max(30),
    showPhone: z.boolean(), phoneOpacity: z.number().min(0.1).max(1),
    text: z.object({ id: z.string(), kind: z.literal("text"), value: z.string().max(18), mode: z.enum(["emboss", "engrave"]), x: z.number(), y: z.number(), scale: z.number().min(0.5).max(2), rotation: z.number(), depth: z.number().min(0.3).max(1.4) }),
});

const projectBaseSchema = z.object({
  catalogVersion: z.string(),
  deviceId: z.string().refine((id) => devices.some((device) => device.id === id), "Unknown phone model"),
});

const projectSchema = projectBaseSchema.extend({
  schemaVersion: z.literal(3),
  modelCode: z.string().nullable(),
  geometryRevision: z.string().nullable(),
  configuration: configurationSchema,
});
const versionTwoProjectSchema = projectBaseSchema.extend({ schemaVersion: z.literal(2), configuration: configurationSchema });
const legacyProjectSchema = projectBaseSchema.extend({
  schemaVersion: z.literal(1),
  configuration: configurationSchema.omit({ patternScale: true, patternSpacing: true, patternRotation: true, patternOffsetX: true, patternOffsetY: true }),
});

export function createProject(device: DevicePreset, configuration: CaseConfiguration): DesignProject {
  return {
    schemaVersion: 3,
    catalogVersion,
    deviceId: device.id,
    modelCode: device.modelCodes[0] ?? null,
    geometryRevision: device.geometryAsset?.revision ?? null,
    configuration,
  };
}

export function parseProject(value: unknown): DesignProject {
  const current = projectSchema.safeParse(value);
  if (current.success) return current.data;
  const versionTwo = versionTwoProjectSchema.safeParse(value);
  if (versionTwo.success) return projectSchema.parse({ ...versionTwo.data, schemaVersion: 3, modelCode: null, geometryRevision: null });
  const legacy = legacyProjectSchema.parse(value);
  return projectSchema.parse({ ...legacy, schemaVersion: 3, modelCode: null, geometryRevision: null, configuration: { ...defaultConfiguration, ...legacy.configuration } });
}

export function restoreProject(value: unknown) {
  const project = parseProject(value);
  const device = devices.find((item) => item.id === project.deviceId)!;
  return { project, device, configuration: project.configuration };
}

