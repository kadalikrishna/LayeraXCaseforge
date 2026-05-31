import { booleans, primitives, transforms } from "@jscad/modeling";
import type { CaseParameters } from "./case-params";
import { getDerivedCaseDimensions } from "./case-params";

const { subtract } = booleans;
const { roundedCuboid } = primitives;
const { translate } = transforms;

export function createPhoneCaseGeometry(params: CaseParameters) {
  const dimensions = getDerivedCaseDimensions(params);
  const outerRadius = clampRadius(
    params.cornerRadius + params.wallThickness,
    dimensions.outerWidth,
    dimensions.outerHeight,
    dimensions.outerDepth,
  );
  const innerRadius = clampRadius(
    params.cornerRadius,
    dimensions.innerWidth,
    dimensions.innerHeight,
    dimensions.innerDepth,
  );

  const outer = roundedCuboid({
    size: [dimensions.outerWidth, dimensions.outerHeight, dimensions.outerDepth],
    roundRadius: outerRadius,
    segments: 28,
  });

  // Shift the phone cavity toward the open/front face so the back remains solid.
  const cavityDepth = dimensions.innerDepth + params.backThickness + 2;
  const cavityCenterZ = -dimensions.outerDepth / 2 + params.backThickness + cavityDepth / 2;
  const cavity = translate(
    [0, 0, cavityCenterZ],
    roundedCuboid({
      size: [dimensions.innerWidth, dimensions.innerHeight, cavityDepth],
      roundRadius: innerRadius,
      segments: 28,
    }),
  );

  return subtract(outer, cavity);
}

function clampRadius(radius: number, width: number, height: number, depth: number) {
  const maxRadius = Math.min(width, height, depth) / 2 - 0.1;
  return Math.max(0.1, Math.min(radius, maxRadius));
}
