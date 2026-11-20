import type { CameraRegion, DevicePreset, EdgeFeature, GeometryProfile } from "./types";

const googleSources = ["https://support.google.com/pixelphone/answer/7157629?hl=en", "https://support.google.com/pixelphone/answer/7158570?hl=en"];
const samsungSources = ["https://www.samsung.com/global/galaxy/", "https://www.samsung.com/global/sustainability/policy-file/AYVhR1k6BicAIx95/LCA_Results_for_Smartphones.pdf"];
const lens = (x: number, y: number, radius: number, role: CameraRegion["role"] = "lens"): CameraRegion => ({ shape: "circle", x, y, width: radius * 2, height: radius * 2, radius, role });
const island = (x: number, y: number, width: number, height: number, radius: number): CameraRegion => ({ shape: "rounded-rect", x, y, width, height, radius, role: "island" });
const button = (edge: EdgeFeature["edge"], offset: number, length: number, label: string): EdgeFeature => ({ edge, offset, length, kind: "button", label, depth: 2.6 });
const opening = (edge: EdgeFeature["edge"], offset: number, length: number, kind: EdgeFeature["kind"], label: string, depth: number): EdgeFeature => ({ edge, offset, length, kind, label, depth });

// These are reference-informed visual profiles, NOT measured CAD. Numeric feature
// positions, corner/edge radii and camera envelopes require measurement before release.
// Coordinate system: +Y top, +Z screen, +X right when looking at the screen.
export function refineDevice(device: DevicePreset): DevicePreset {
  if (!["apple", "google", "samsung"].includes(device.companyId)) return device;
  const { id, width: w, height: h } = device;
  const top = h / 2;
  const features: EdgeFeature[] = [];
  let openings: CameraRegion[] = [];
  let lenses: CameraRegion[] = [];
  let cornerRadius = 11;
  let edgeRadius = 0.65;
  let cameraHeight = 2.4;
  let cameraKind: GeometryProfile["cameraKind"] = "island";
  let sources: string[] = [];
  let note = "Camera envelopes and feature offsets are estimated from reference layouts; exact CAD and physical checks are pending.";

  if (device.companyId === "apple") {
    const pro = id.includes("pro");
    const sixteen = id.startsWith("iphone-16");
    const fifteen = id.startsWith("iphone-15");
    cornerRadius = pro ? 12 : 11.5;
    edgeRadius = fifteen || sixteen ? 0.8 : 0.4;
    cameraHeight = pro ? 3.4 : 2;
    const cw = sixteen && !pro ? 17 : pro ? 38 : 31;
    const ch = sixteen && !pro ? 34 : pro ? 40 : 32;
    const x = w / 2 - cw / 2 - 3.4;
    const y = top - ch / 2 - 3.8;
    openings = [island(x, y, cw, ch, sixteen && !pro ? 8.4 : 8)];
    if (pro) lenses = [lens(x + 8.7, y + 9, 7.1), lens(x + 8.7, y - 9, 7.1), lens(x - 8, y, 7.1), lens(x - 9.3, y + 13, 2.4, "flash"), lens(x - 9.3, y - 13, 2.5, "sensor")];
    else if (sixteen) lenses = [lens(x, y + 8.4, 6.1), lens(x, y - 8.4, 6.1), lens(x - 13, y, 2.2, "flash")];
    else lenses = [lens(x + 6.4, y + 6.3, 6.2), lens(x - 6.4, y - 6.3, 6.2), lens(x - 8, y + 9.5, 2.1, "flash")];
    if (sixteen && !pro) openings.push(lenses[2]);
    features.push(button("right", top - 50, 18, "Side button"));
    features.push(button("left", top - 46, 11, "Volume up"), button("left", top - 62, 11, "Volume down"));
    if (sixteen || (fifteen && pro)) features.push(button("left", top - 30, 7, "Action button"));
    else features.push(opening("left", top - 29, 8, "cutout", "Ring / silent switch", 3.6));
    if (sixteen) features.push(opening("right", -top + 41, 19, "cutout", "Camera Control", 4));
    features.push(opening("bottom", 0, fifteen || sixteen ? 12 : 10, "port", fifteen || sixteen ? "USB-C" : "Lightning", 5));
    for (const side of [-1, 1]) for (let i = 0; i < (side === 1 ? 5 : 3); i++) features.push(opening("bottom", side * (10 + i * 2.7), 1.5, side === 1 ? "speaker" : "microphone", "Acoustic opening", 1.5));
    sources = [`https://developer.apple.com/download/files/accessories/dimensional-drawings/${id}.pdf`];
    note = "Apple dimensional drawing located. Body size is catalog data; camera and control geometry is a visual reconstruction, not a full drawing transcription or approved CAD.";
  } else if (device.companyId === "google") {
    const nine = id.startsWith("pixel-9");
    const pro = id.includes("pro");
    cornerRadius = nine ? 13 : id.includes("8") ? 14 : 10;
    edgeRadius = nine ? 0.65 : 1.2;
    cameraKind = "bar";
    cameraHeight = nine ? 3.2 : 2.2;
    const cw = nine ? w - 10 : w - 2;
    const ch = nine ? 22 : 19;
    const y = top - (nine ? 26 : 24);
    openings = [island(0, y, cw, ch, nine ? ch / 2 - 0.05 : 3)];
    lenses = [lens(cw / 2 - 11, y, 5.4), lens(cw / 2 - 24, y, 5.4)];
    if (pro) lenses.push(lens(cw / 2 - 38, y, 5.4));
    lenses.push(lens(-cw / 2 + 7, y + (pro ? 3.5 : 0), 2.3, "flash"));
    if (pro && !id.includes("7")) lenses.push(lens(-cw / 2 + 7, y - 4, 1.8, "sensor"));
    features.push(button("right", top - 39, 12, "Power"), button("right", top - 67, 24, "Volume"));
    features.push(opening("bottom", 0, 12, "port", "USB-C", 5), opening("bottom", -w * 0.27, 9, "speaker", "Speaker", 2.2), opening("bottom", w * 0.28, 1.5, "microphone", "Microphone", 1.5), opening("top", w * 0.2, 1.4, "microphone", "Top microphone", 1.4));
    sources = googleSources;
  } else {
    const ultra = id.includes("ultra");
    const s22 = id.startsWith("galaxy-s22");
    cornerRadius = ultra ? id.startsWith("galaxy-s25") ? 6 : 2.5 : 10;
    edgeRadius = ultra && !id.startsWith("galaxy-s25") ? 0.75 : 0.65;
    cameraKind = s22 && !ultra ? "island" : "rings";
    cameraHeight = ultra ? 2.4 : 1.8;
    const x = w / 2 - (ultra ? 13 : 12);
    const y = top - 15;
    lenses = [lens(x, y, ultra ? 6.5 : 5.9), lens(x, y - 18, ultra ? 6.5 : 5.9), lens(x, y - 36, ultra ? 6.5 : 5.9)];
    if (ultra) lenses.push(lens(x - 17, y - 2, 4.1), lens(x - 17, y - 31, 4.1));
    lenses.push(lens(x - 16, y - 16, 2, "flash"));
    openings = s22 && !ultra ? [island(x, y - 18, 20, 53, 6), lenses[lenses.length - 1]] : lenses;
    features.push(button("right", top - 41, 25, "Volume"), button("right", top - 68, 14, "Side key"));
    features.push(opening("bottom", 0, 12, "port", "USB-C", 5), opening("bottom", -w * 0.23, 10, "speaker", "Speaker", 2), opening("bottom", w * 0.22, 1.5, "microphone", "Microphone", 1.5), opening("top", 8, 1.5, "microphone", "Top microphone", 1.5));
    if (ultra) features.push(opening("bottom", -w / 2 + 7, 7, "cutout", "S Pen access", 6));
    sources = samsungSources;
  }
  return { ...device, cornerRadius, edgeFeatures: features, profile: { revision: "visual-v2", cameraKind, cornerRadius, edgeRadius, cameraHeight, openings, lenses, sources, evidence: "reference-layout", note, pending: ["Exact model code and regional variant", "Measured feature dimensions and clearances", "Licensed or measured source geometry", "Two-phone comparison", "Three passing TPU prints"] } };
}
