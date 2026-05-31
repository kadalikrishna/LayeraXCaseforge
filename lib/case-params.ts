export type CaseParameters = {
  phoneWidth: number;
  phoneHeight: number;
  phoneThickness: number;
  wallThickness: number;
  backThickness: number;
  cornerRadius: number;
  tolerance: number;
};

export const defaultCaseParameters: CaseParameters = {
  phoneWidth: 71.6,
  phoneHeight: 147.6,
  phoneThickness: 7.8,
  wallThickness: 1.8,
  backThickness: 1.4,
  cornerRadius: 10,
  tolerance: 0.35,
};

export type CaseParameterKey = keyof CaseParameters;

export const caseParameterFields: Array<{
  key: CaseParameterKey;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
}> = [
  { key: "phoneWidth", label: "Phone width", min: 55, max: 95, step: 0.1, suffix: "mm" },
  { key: "phoneHeight", label: "Phone height", min: 120, max: 180, step: 0.1, suffix: "mm" },
  { key: "phoneThickness", label: "Phone thickness", min: 5, max: 14, step: 0.1, suffix: "mm" },
  { key: "wallThickness", label: "Wall thickness", min: 1, max: 4, step: 0.1, suffix: "mm" },
  { key: "backThickness", label: "Back thickness", min: 0.8, max: 3.5, step: 0.1, suffix: "mm" },
  { key: "cornerRadius", label: "Corner radius", min: 3, max: 24, step: 0.1, suffix: "mm" },
  { key: "tolerance", label: "Tolerance", min: 0, max: 1.2, step: 0.05, suffix: "mm" },
];

export function getDerivedCaseDimensions(params: CaseParameters) {
  return {
    outerWidth: params.phoneWidth + params.wallThickness * 2,
    outerHeight: params.phoneHeight + params.wallThickness * 2,
    outerDepth: params.phoneThickness + params.backThickness,
    innerWidth: params.phoneWidth + params.tolerance * 2,
    innerHeight: params.phoneHeight + params.tolerance * 2,
    innerDepth: params.phoneThickness + params.tolerance,
  };
}
