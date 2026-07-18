import { booleans, extrusions, geometries, hulls, primitives, text, transforms } from "@jscad/modeling";
import type { Geom2, Geom3 } from "@jscad/modeling/src/geometries/types";
import type { CaseConfiguration, DevicePreset } from "./types";

const { intersect, subtract, union } = booleans;
const { extrudeLinear } = extrusions;
const { path2 } = geometries;
const { hull } = hulls;
const { circle, rectangle, roundedCuboid, roundedRectangle } = primitives;
const { vectorText } = text;
const { rotateZ, translate } = transforms;

export type CaseMetrics = { outerWidth: number; outerHeight: number; outerDepth: number; volumeEstimate: number };

export function getCaseMetrics(device: DevicePreset, config: CaseConfiguration): CaseMetrics {
  const profile = config.style === "protective" ? { wall: 2.4, back: 1.9, clearance: 0.45 } : { wall: 1.7, back: 1.4, clearance: 0.35 };
  const outerWidth = device.width + profile.clearance * 2 + profile.wall * 2;
  const outerHeight = device.height + profile.clearance * 2 + profile.wall * 2;
  const outerDepth = device.thickness + profile.clearance + profile.back + (config.style === "protective" ? 1 : 0.4);
  const shellVolume = outerWidth * outerHeight * outerDepth - (device.width + profile.clearance * 2) * (device.height + profile.clearance * 2) * (device.thickness + profile.clearance);
  return { outerWidth, outerHeight, outerDepth, volumeEstimate: Math.max(0, shellVolume / 1000) };
}

export function createCaseSolid(device: DevicePreset, config: CaseConfiguration): Geom3 {
  const profile = config.style === "protective" ? { wall: 2.4, back: 1.9, clearance: 0.45, lip: 1.25 } : { wall: 1.7, back: 1.4, clearance: 0.35, lip: 0.65 };
  const metrics = getCaseMetrics(device, config);
  const outer = roundedCuboid({ size: [metrics.outerWidth, metrics.outerHeight, metrics.outerDepth], roundRadius: Math.min(device.cornerRadius + profile.wall, metrics.outerDepth / 2 - 0.05), segments: 24 });
  const cavityWidth = device.width + profile.clearance * 2;
  const cavityHeight = device.height + profile.clearance * 2;
  const cavityDepth = device.thickness + profile.clearance + 3;
  const cavityStart = -metrics.outerDepth / 2 + profile.back;
  const cavity = translate([0, 0, cavityStart + cavityDepth / 2], roundedCuboid({ size: [cavityWidth, cavityHeight, cavityDepth], roundRadius: Math.min(device.cornerRadius, cavityDepth / 2 - 0.05), segments: 24 }));
  const openings = makeEdgeOpenings(device, metrics, profile.wall);
  const solid = union(subtract(outer, cavity, makeCameraOpening(device, metrics), ...openings), makeCameraLip(device, metrics), ...makeButtonCovers(device, metrics, profile.wall));
  return decorateCaseSolid(solid, device, config, metrics);
}

export function decorateCaseSolid(base: Geom3, device: DevicePreset, config: CaseConfiguration, metrics = getCaseMetrics(device, config)): Geom3 {
  let solid = base;
  const decoration = makeDecoration(device, config, metrics);
  if (decoration) solid = config.patternMode === "engrave" ? subtract(solid, decoration) : union(solid, decoration);
  const textSolid = makeText(config, metrics);
  if (textSolid) solid = config.text.mode === "engrave" ? subtract(solid, textSolid) : union(solid, textSolid);
  return solid;
}

function makeCameraOpening(device: DevicePreset, metrics: CaseMetrics): Geom3 {
  const backZ = -metrics.outerDepth / 2;
  return translate([device.camera.x, device.camera.y, backZ], roundedCuboid({ size: [device.camera.width + 2.4, device.camera.height + 2.4, 6], roundRadius: Math.min(device.camera.radius, 2.9), segments: 20 }));
}

function makeCameraLip(device: DevicePreset, metrics: CaseMetrics): Geom3 {
  const depth = 1.2;
  const z = -metrics.outerDepth / 2 - depth / 2 + 0.08;
  const outer = roundedCuboid({ size: [device.camera.width + 7, device.camera.height + 7, depth], roundRadius: 0.5, segments: 20 });
  const inner = roundedCuboid({ size: [device.camera.width + 2.4, device.camera.height + 2.4, depth + 1], roundRadius: 0.5, segments: 20 });
  return translate([device.camera.x, device.camera.y, z], subtract(outer, inner));
}

function makeEdgeOpenings(device: DevicePreset, metrics: CaseMetrics, wall: number): Geom3[] {
  return device.edgeFeatures.filter((feature) => feature.kind !== "button").map((feature) => {
    const openingDepth = feature.kind === "port" ? 4.8 : feature.kind === "speaker" ? 2.8 : 2.2;
    if (feature.edge === "bottom" || feature.edge === "top") {
      const y = feature.edge === "bottom" ? -metrics.outerHeight / 2 : metrics.outerHeight / 2;
      return translate([feature.offset, y, 0.2], roundedCuboid({ size: [feature.length, wall + 5, openingDepth], roundRadius: Math.min(1.4, openingDepth / 2 - 0.05), segments: 12 }));
    }
    const x = feature.edge === "left" ? -metrics.outerWidth / 2 : metrics.outerWidth / 2;
    return translate([x, feature.offset, 0.2], roundedCuboid({ size: [wall + 5, feature.length, openingDepth], roundRadius: Math.min(1.4, openingDepth / 2 - 0.05), segments: 12 }));
  });
}

function makeButtonCovers(device: DevicePreset, metrics: CaseMetrics, wall: number): Geom3[] {
  return device.edgeFeatures.filter((feature) => feature.kind === "button").map((feature) => {
    if (feature.edge === "left" || feature.edge === "right") {
      const direction = feature.edge === "left" ? -1 : 1;
      return translate([direction * (metrics.outerWidth / 2 + 0.2), feature.offset, 0.65], roundedCuboid({ size: [wall + 0.9, feature.length, 3.2], roundRadius: 1.2, segments: 12 }));
    }
    const direction = feature.edge === "bottom" ? -1 : 1;
    return translate([feature.offset, direction * (metrics.outerHeight / 2 + 0.2), 0.65], roundedCuboid({ size: [feature.length, wall + 0.9, 3.2], roundRadius: 1.2, segments: 12 }));
  });
}

function makeDecoration(device: DevicePreset, config: CaseConfiguration, metrics: CaseMetrics): Geom3 | null {
  if (config.pattern === "solid") return null;
  const safeWidth = device.width - 16;
  const safeHeight = device.height - 24;
  const span = Math.hypot(safeWidth, safeHeight) + 60;
  const spacing = config.patternSpacing;
  const stroke = 1.25 * config.patternScale;
  const shapes: Geom2[] = [];
  const line = (a: [number, number], b: [number, number], width = stroke) => hull(translate(a, circle({ radius: width / 2, segments: 12 })), translate(b, circle({ radius: width / 2, segments: 12 })));

  if (config.pattern === "dots") {
    for (let x = -span / 2; x <= span / 2; x += spacing) for (let y = -span / 2; y <= span / 2; y += spacing) shapes.push(translate([x, y], circle({ radius: stroke, segments: 16 })));
  } else if (config.pattern === "waves") {
    const amplitude = 2.8 * config.patternScale;
    for (let y = -span / 2; y <= span / 2; y += spacing) {
      let previous: [number, number] = [-span / 2, y];
      for (let x = -span / 2 + 3; x <= span / 2; x += 3) {
        const point: [number, number] = [x, y + Math.sin((x / spacing) * Math.PI * 2) * amplitude];
        shapes.push(line(previous, point)); previous = point;
      }
    }
  } else {
    for (let p = -span / 2; p <= span / 2; p += spacing) shapes.push(rectangle({ size: [span, stroke], center: [0, p] }));
    if (config.pattern === "grid") for (let p = -span / 2; p <= span / 2; p += spacing) shapes.push(rectangle({ size: [stroke, span], center: [p, 0] }));
  }

  let pattern = union(...shapes) as Geom2;
  pattern = rotateZ((config.patternRotation * Math.PI) / 180, pattern);
  pattern = translate([config.patternOffsetX, config.patternOffsetY], pattern);
  const safeArea = roundedRectangle({ size: [safeWidth, safeHeight], roundRadius: Math.min(device.cornerRadius, 8), segments: 20 });
  const cameraGuard = translate([device.camera.x, device.camera.y], roundedRectangle({ size: [device.camera.width + 7, device.camera.height + 7], roundRadius: Math.min(device.camera.radius + 2, 5), segments: 16 }));
  const clipped = intersect(pattern, subtract(safeArea, cameraGuard)) as Geom2;
  const depth = config.patternDepth + 0.12;
  const z = config.patternMode === "emboss" ? -metrics.outerDepth / 2 - depth + 0.04 : -metrics.outerDepth / 2 - 0.04;
  return translate([0, 0, z], extrudeLinear({ height: depth }, clipped));
}

function makeText(config: CaseConfiguration, metrics: CaseMetrics): Geom3 | null {
  const value = config.text.value.trim();
  if (!value) return null;
  const paths = vectorText({ input: value, height: 10 * config.text.scale, align: "center" });
  const strokes = paths.flatMap((points) => {
    const path = path2.fromPoints({}, points);
    const segments = path2.toPoints(path);
    return segments.slice(1).map((point, index) => {
      const previous = segments[index];
      return hull(translate(previous, circle({ radius: 0.55 * config.text.scale, segments: 12 })), translate(point, circle({ radius: 0.55 * config.text.scale, segments: 12 })));
    });
  });
  if (!strokes.length) return null;
  const shape = union(...strokes);
  const extruded = extrudeLinear({ height: config.text.depth + 0.12 }, shape);
  const z = -metrics.outerDepth / 2 - (config.text.mode === "emboss" ? config.text.depth - 0.04 : -0.04);
  return translate([config.text.x, config.text.y, z], rotateZ((config.text.rotation * Math.PI) / 180, extruded));
}

export function validateCase(device: DevicePreset, config: CaseConfiguration) {
  const warnings: string[] = [];
  if (config.text.value.length > 18) warnings.push("Text must be 18 characters or fewer.");
  if (Math.abs(config.text.x) > device.width / 2 - 8 || Math.abs(config.text.y) > device.height / 2 - 12) warnings.push("Text is outside the printable safe area.");
  if (config.patternDepth > 1.2 || config.text.depth > 1.2) warnings.push("Relief deeper than 1.2 mm may print poorly in TPU.");
  return warnings;
}
