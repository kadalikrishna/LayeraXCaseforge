import { booleans, extrusions, geometries, hulls, primitives, text, transforms, maths } from "@jscad/modeling";
import type { Geom2, Geom3 } from "@jscad/modeling/src/geometries/types";
import type { CameraRegion, CaseConfiguration, DevicePreset } from "./types";

const { intersect, subtract, union } = booleans;
const { extrudeLinear } = extrusions;
const { path2 } = geometries;
const { hull } = hulls;
const { circle, rectangle, roundedCuboid, roundedRectangle } = primitives;
const { vectorText } = text;
const { rotateZ, translate } = transforms;

export { getCaseMetrics, validateCase } from './case-metrics';
import { getCaseMetrics, type CaseMetrics } from './case-metrics';

export function createCaseSolid(device: DevicePreset, config: CaseConfiguration): Geom3 {
  return decorateCaseSolid(createBaseCase(device, config), device, config);
}

export function profileSolid(width: number, height: number, depth: number, radius: number, edge = 0.5): Geom3 {
  const bevel = Math.min(edge, depth / 4, radius / 2);
  const sections = [[-depth / 2, bevel], [-depth / 2 + bevel, 0], [depth / 2 - bevel, 0], [depth / 2, bevel]];
  return extrusions.extrudeFromSlices({ numberOfSlices: 4, ...{ repair: false }, callback: (_progress, index) => {
    const [z, inset] = sections[index];
    const outline = roundedRectangle({ size: [width - inset * 2, height - inset * 2], roundRadius: Math.max(0.1, Math.min(radius - inset, (width - inset * 2) / 2 - 0.01, (height - inset * 2) / 2 - 0.01)), segments: 48 });
    return extrusions.slice.transform(maths.mat4.fromTranslation(maths.mat4.create(), [0, 0, z]), extrusions.slice.fromSides(geometries.geom2.toSides(outline)));
  } }, geometries.geom2.create());
}

export function cameraRegions(device: DevicePreset): CameraRegion[] {
  return device.profile?.openings ?? [{ ...device.camera, shape: "rounded-rect", role: "island" }];
}

export function cameraOutline(region: CameraRegion, padding = 0): Geom2 {
  const shape = region.shape === "circle" ? circle({ radius: region.radius + padding, segments: 40 }) : roundedRectangle({ size: [region.width + padding * 2, region.height + padding * 2], roundRadius: Math.min(region.radius + padding, (region.width + padding * 2) / 2 - 0.01, (region.height + padding * 2) / 2 - 0.01), segments: 40 });
  return translate([region.x, region.y], shape);
}

function cameraKeepOut(device: DevicePreset): Geom2 { return union(...cameraRegions(device).map((region) => cameraOutline(region, 3.8))); }

export function createBaseCase(device: DevicePreset, config: CaseConfiguration): Geom3 {
  const profile = config.style === "protective" ? { wall: 2.4, back: 1.9, clearance: 0.45, lip: 1.25 } : { wall: 1.7, back: 1.4, clearance: 0.35, lip: 0.65 };
  const metrics = getCaseMetrics(device, config);
  const outer = profileSolid(metrics.outerWidth, metrics.outerHeight, metrics.outerDepth, device.cornerRadius + profile.wall, device.profile?.edgeRadius ?? 0.6);
  const cavityWidth = device.width + profile.clearance * 2;
  const cavityHeight = device.height + profile.clearance * 2;
  const cavityDepth = device.thickness + profile.clearance + 3;
  const cavityStart = -metrics.outerDepth / 2 + profile.back;
  const cavity = translate([0, 0, cavityStart + cavityDepth / 2], profileSolid(cavityWidth, cavityHeight, cavityDepth, device.cornerRadius + profile.clearance, 0.35));
  const openings = makeEdgeOpenings(device, metrics, profile.wall);
  const solid = union(subtract(outer, cavity, makeCameraOpening(device, metrics), ...openings), makeCameraLip(device, metrics), ...makeButtonCovers(device, metrics, profile.wall));
  return solid;
}

export function decorateCaseSolid(base: Geom3, device: DevicePreset, config: CaseConfiguration, metrics = getCaseMetrics(device, config)): Geom3 {
  let solid = base;
  const decoration = makeDecoration(device, config, metrics);
  if (decoration) solid = config.patternMode === "engrave" ? subtract(solid, decoration) : union(solid, decoration);
  const textSolid = makeText(config, metrics, device);
  if (textSolid) solid = config.text.mode === "engrave" ? subtract(solid, textSolid) : union(solid, textSolid);
  return solid;
}

function makeCameraOpening(device: DevicePreset, metrics: CaseMetrics): Geom3 {
  const backZ = -metrics.outerDepth / 2;
  return translate([0, 0, backZ - 5], extrudeLinear({ height: 12 }, union(...cameraRegions(device).map((region) => cameraOutline(region, 0.8)))));
}

function makeCameraLip(device: DevicePreset, metrics: CaseMetrics): Geom3 {
  const depth = Math.max(1.2, (device.profile?.cameraHeight ?? 2.4) - 1);
  const outer = union(...cameraRegions(device).map((region) => cameraOutline(region, 2.5)));
  const inner = union(...cameraRegions(device).map((region) => cameraOutline(region, 0.8)));
  return translate([0, 0, -metrics.outerDepth / 2 - depth + 0.06], extrudeLinear({ height: depth }, subtract(outer, inner)));
}

function makeEdgeOpenings(device: DevicePreset, metrics: CaseMetrics, wall: number): Geom3[] {
  return device.edgeFeatures.filter((feature) => feature.kind !== "button").map((feature) => {
    const openingDepth = feature.depth ?? (feature.kind === "port" ? 4.8 : feature.kind === "speaker" ? 2.8 : 2.2);
    if (feature.edge === "bottom" || feature.edge === "top") {
      const y = feature.edge === "bottom" ? -metrics.outerHeight / 2 : metrics.outerHeight / 2;
      return translate([feature.offset, y, 0.2], roundedCuboid({ size: [feature.length, wall + 5, openingDepth], roundRadius: Math.min(1.4, openingDepth / 2 - 0.05, feature.length / 2 - 0.01), segments: 16 }));
    }
    const x = feature.edge === "left" ? -metrics.outerWidth / 2 : metrics.outerWidth / 2;
    return translate([x, feature.offset, 0.2], roundedCuboid({ size: [wall + 5, feature.length, openingDepth], roundRadius: Math.min(1.4, openingDepth / 2 - 0.05, feature.length / 2 - 0.01), segments: 16 }));
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
  const cameraGuard = cameraKeepOut(device);
  const clipped = intersect(pattern, subtract(safeArea, cameraGuard)) as Geom2;
  const depth = config.patternDepth + 0.12;
  const z = config.patternMode === "emboss" ? -metrics.outerDepth / 2 - depth + 0.04 : -metrics.outerDepth / 2 - 0.04;
  return translate([0, 0, z], extrudeLinear({ height: depth }, clipped));
}

function makeText(config: CaseConfiguration, metrics: CaseMetrics, device: DevicePreset): Geom3 | null {
  const value = config.text.value.trim();
  if (!value) return null;
  const paths = vectorText({ input: value, height: 10 * config.text.scale, align: "center" });
  const points = paths.flat();
  if (!points.length) return null;
  const minX = Math.min(...points.map((point) => point[0]));
  const maxX = Math.max(...points.map((point) => point[0]));
  const minY = Math.min(...points.map((point) => point[1]));
  const maxY = Math.max(...points.map((point) => point[1]));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const fit = Math.max(0.01, Math.min(1, (device.width - 18 - 2 * Math.abs(config.text.x)) / (maxX - minX + 1.1 * config.text.scale)));
  const strokes = paths.flatMap((points) => {
    // The case back faces negative Z: mirror X so lettering reads from outside.
    const path = path2.fromPoints({}, points.map((point) => [-(point[0] - centerX) * fit, (point[1] - centerY) * fit]));
    const segments = path2.toPoints(path);
    return segments.slice(1).map((point, index) => {
      const previous = segments[index];
      return hull(translate(previous, circle({ radius: 0.55 * config.text.scale * fit, segments: 12 })), translate(point, circle({ radius: 0.55 * config.text.scale * fit, segments: 12 })));
    });
  });
  if (!strokes.length) return null;
  const placed = translate([config.text.x, config.text.y], rotateZ((config.text.rotation * Math.PI) / 180, union(...strokes)));
  const safeArea = roundedRectangle({ size: [device.width - 12, device.height - 16], roundRadius: 6, segments: 20 });
  const cameraGuard = cameraKeepOut(device);
  const shape = intersect(placed, subtract(safeArea, cameraGuard));
  if (!geometries.geom2.toSides(shape).length) return null;
  const extruded = extrudeLinear({ height: config.text.depth + 0.12 }, shape);
  const z = -metrics.outerDepth / 2 - (config.text.mode === "emboss" ? config.text.depth - 0.04 : -0.04);
  return translate([0, 0, z], extruded);
}




