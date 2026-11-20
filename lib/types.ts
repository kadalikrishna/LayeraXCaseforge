export type CompanyId = "apple" | "samsung" | "google" | "oneplus" | "xiaomi" | "motorola" | "nothing" | "oppo" | "vivo" | "realme";
export type CaseStyle = "slim" | "protective";
export type Finish = "matte" | "satin" | "gloss";
export type Pattern = "solid" | "diagonal" | "grid" | "dots" | "waves";
export type ReliefMode = "emboss" | "engrave";
export type DeviceEdge = "left" | "right" | "top" | "bottom";
export type EdgeFeature = { edge: DeviceEdge; offset: number; length: number; kind: "button" | "port" | "speaker" | "microphone" | "cutout"; label?: string; depth?: number };
export type CameraRegion = { shape: "circle" | "rounded-rect"; x: number; y: number; width: number; height: number; radius: number; role: "lens" | "flash" | "sensor" | "island" };
export type GeometryProfile = { revision: string; cameraKind: "island" | "bar" | "rings"; cornerRadius: number; edgeRadius: number; cameraHeight: number; openings: CameraRegion[]; lenses: CameraRegion[]; sources: string[]; evidence: "reference-layout"; note: string; pending: string[] };
export type GeometryStatus = "approximate" | "cad-prepared" | "sample-verified" | "production-validated" | "retired";

export type ReleasedGeometryAsset = {
  baseCaseStl: string;
  sha256: string;
  revision: string;
  manufacturingProfileId: string;
  outerSize: [number, number, number];
  validatedAt: string;
  physicalSampleCount: number;
  consecutivePassingPrints: number;
  customization?: { maxEmbossDepth: number; maxEngraveDepth: number; minBackThickness: number; backThickness: number };
};

export type DeviceCompany = { id: CompanyId; name: string; logo: CompanyId };

export type DevicePreset = {
  id: string;
  companyId: CompanyId;
  name: string;
  family: string;
  releaseYear: number;
  aliases: string[];
  modelCodes: string[];
  region: string;
  width: number;
  height: number;
  thickness: number;
  cornerRadius: number;
  camera: { width: number; height: number; x: number; y: number; radius: number };
  portWidth: number;
  edgeFeatures: EdgeFeature[];
  geometryStatus: GeometryStatus;
  geometryAsset?: ReleasedGeometryAsset;
  profile?: GeometryProfile;
};

export type DesignElement = {
  id: string;
  kind: "text";
  value: string;
  mode: ReliefMode;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  depth: number;
};

export type CaseConfiguration = {
  style: CaseStyle;
  color: string;
  finish: Finish;
  pattern: Pattern;
  patternMode: ReliefMode;
  patternDepth: number;
  patternScale: number;
  patternSpacing: number;
  patternRotation: number;
  patternOffsetX: number;
  patternOffsetY: number;
  showPhone: boolean;
  phoneOpacity: number;
  text: DesignElement;
};

export type DesignProject = {
  schemaVersion: 3;
  catalogVersion: string;
  deviceId: string;
  modelCode: string | null;
  geometryRevision: string | null;
  configuration: CaseConfiguration;
};
