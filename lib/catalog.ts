import type { CompanyId, DeviceCompany, DevicePreset, EdgeFeature } from "./types";
import { refineDevice } from "./device-profiles";

export const catalogVersion = "2026.07-validation-v1";

export const companies: DeviceCompany[] = [
  { id: "apple", name: "Apple", logo: "apple" },
  { id: "samsung", name: "Samsung", logo: "samsung" },
  { id: "google", name: "Google", logo: "google" },
  { id: "oneplus", name: "OnePlus", logo: "oneplus" },
  { id: "xiaomi", name: "Xiaomi", logo: "xiaomi" },
  { id: "motorola", name: "Motorola", logo: "motorola" },
  { id: "nothing", name: "Nothing", logo: "nothing" },
  { id: "oppo", name: "Oppo", logo: "oppo" },
  { id: "vivo", name: "Vivo", logo: "vivo" },
  { id: "realme", name: "Realme", logo: "realme" },
];

type Seed = [string, CompanyId, string, string, number, number, number, number, number, number, number, number, number, string[]?];

const seeds: Seed[] = [
  ["iphone-14", "apple", "iPhone 14", "iPhone 14", 2022, 71.5, 146.7, 7.8, 18, 30, 32, -17, 49],
  ["iphone-14-plus", "apple", "iPhone 14 Plus", "iPhone 14", 2022, 78.1, 160.8, 7.8, 20, 31, 33, -20, 55],
  ["iphone-14-pro", "apple", "iPhone 14 Pro", "iPhone 14", 2022, 71.5, 147.5, 7.85, 18, 38, 40, -15.5, 48],
  ["iphone-14-pro-max", "apple", "iPhone 14 Pro Max", "iPhone 14", 2022, 77.6, 160.7, 7.85, 20, 41, 43, -17, 53],
  ["iphone-15", "apple", "iPhone 15", "iPhone 15", 2023, 71.6, 147.6, 7.8, 18, 31, 33, -17, 49],
  ["iphone-15-plus", "apple", "iPhone 15 Plus", "iPhone 15", 2023, 77.8, 160.9, 7.8, 20, 32, 34, -19, 54],
  ["iphone-15-pro", "apple", "iPhone 15 Pro", "iPhone 15", 2023, 70.6, 146.6, 8.25, 18, 38, 40, -15, 48],
  ["iphone-15-pro-max", "apple", "iPhone 15 Pro Max", "iPhone 15", 2023, 76.7, 159.9, 8.25, 20, 41, 43, -17, 53],
  ["iphone-16", "apple", "iPhone 16", "iPhone 16", 2024, 71.6, 147.6, 7.8, 18, 30, 36, -17, 49],
  ["iphone-16-plus", "apple", "iPhone 16 Plus", "iPhone 16", 2024, 77.8, 160.9, 7.8, 20, 31, 37, -19, 54],
  ["iphone-16-pro", "apple", "iPhone 16 Pro", "iPhone 16", 2024, 71.5, 149.6, 8.25, 18, 38, 40, -15.5, 48],
  ["iphone-16-pro-max", "apple", "iPhone 16 Pro Max", "iPhone 16", 2024, 77.6, 163, 8.25, 20, 41, 43, -17, 53],
  ["galaxy-s22", "samsung", "Galaxy S22", "Galaxy S", 2022, 70.6, 146, 7.6, 15, 28, 46, -18, 42],
  ["galaxy-s22-plus", "samsung", "Galaxy S22+", "Galaxy S", 2022, 75.8, 157.4, 7.6, 16, 29, 48, -20, 46, ["Galaxy S22 Plus"]],
  ["galaxy-s22-ultra", "samsung", "Galaxy S22 Ultra", "Galaxy S", 2022, 77.9, 163.3, 8.9, 10, 31, 58, -20, 47],
  ["galaxy-s23", "samsung", "Galaxy S23", "Galaxy S", 2023, 70.9, 146.3, 7.6, 15, 28, 49, -18, 42],
  ["galaxy-s23-plus", "samsung", "Galaxy S23+", "Galaxy S", 2023, 76.2, 157.8, 7.6, 16, 29, 51, -20, 46, ["Galaxy S23 Plus"]],
  ["galaxy-s23-ultra", "samsung", "Galaxy S23 Ultra", "Galaxy S", 2023, 78.1, 163.4, 8.9, 10, 31, 58, -20, 47],
  ["galaxy-s24", "samsung", "Galaxy S24", "Galaxy S", 2024, 70.6, 147, 7.6, 15, 28, 50, -18, 42],
  ["galaxy-s24-plus", "samsung", "Galaxy S24+", "Galaxy S", 2024, 75.9, 158.5, 7.7, 16, 29, 52, -20, 47, ["Galaxy S24 Plus"]],
  ["galaxy-s24-ultra", "samsung", "Galaxy S24 Ultra", "Galaxy S", 2024, 79, 162.3, 8.6, 9, 32, 59, -21, 46],
  ["galaxy-s25", "samsung", "Galaxy S25", "Galaxy S", 2025, 70.5, 146.9, 7.2, 15, 26, 54, -19, 40],
  ["galaxy-s25-plus", "samsung", "Galaxy S25+", "Galaxy S", 2025, 75.8, 158.4, 7.3, 16, 28, 55, -20, 45, ["Galaxy S25 Plus"]],
  ["galaxy-s25-ultra", "samsung", "Galaxy S25 Ultra", "Galaxy S", 2025, 77.6, 162.8, 8.2, 10, 31, 58, -20, 46],
  ["pixel-7", "google", "Pixel 7", "Pixel", 2022, 73.2, 155.6, 8.7, 18, 64, 18, 0, 52],
  ["pixel-7-pro", "google", "Pixel 7 Pro", "Pixel", 2022, 76.6, 162.9, 8.9, 19, 68, 19, 0, 55],
  ["pixel-7a", "google", "Pixel 7a", "Pixel A", 2023, 72.9, 152, 9, 18, 62, 18, 0, 50],
  ["pixel-8", "google", "Pixel 8", "Pixel", 2023, 70.8, 150.5, 8.9, 18, 61, 19, 0, 50],
  ["pixel-8-pro", "google", "Pixel 8 Pro", "Pixel", 2023, 76.5, 162.6, 8.8, 19, 67, 20, 0, 54],
  ["pixel-8a", "google", "Pixel 8a", "Pixel A", 2024, 72.7, 152.1, 8.9, 18, 62, 19, 0, 50],
  ["pixel-9", "google", "Pixel 9", "Pixel", 2024, 72, 152.8, 8.5, 18, 62, 19, 0, 52],
  ["pixel-9-pro", "google", "Pixel 9 Pro", "Pixel", 2024, 72, 152.8, 8.5, 18, 62, 19, 0, 52],
  ["pixel-9-pro-xl", "google", "Pixel 9 Pro XL", "Pixel", 2024, 76.6, 162.8, 8.5, 19, 67, 20, 0, 55],
  ["oneplus-10-pro", "oneplus", "OnePlus 10 Pro", "OnePlus", 2022, 73.9, 163, 8.6, 18, 43, 49, -14, 48],
  ["oneplus-11", "oneplus", "OnePlus 11", "OnePlus", 2023, 74.1, 163.1, 8.5, 18, 46, 49, -13, 49],
  ["oneplus-12", "oneplus", "OnePlus 12", "OnePlus", 2024, 75.8, 164.3, 9.2, 18, 47, 50, -13, 50],
  ["oneplus-13", "oneplus", "OnePlus 13", "OnePlus", 2025, 76.5, 162.9, 8.5, 18, 46, 46, -13, 50],
  ["xiaomi-13", "xiaomi", "Xiaomi 13", "Xiaomi", 2022, 71.5, 152.8, 8, 17, 40, 42, -14, 49],
  ["xiaomi-14", "xiaomi", "Xiaomi 14", "Xiaomi", 2023, 71.5, 152.8, 8.2, 17, 41, 42, -14, 49],
  ["xiaomi-15", "xiaomi", "Xiaomi 15", "Xiaomi", 2024, 71.2, 152.3, 8.1, 17, 40, 40, -14, 49],
  ["edge-40-pro", "motorola", "Edge 40 Pro", "Edge", 2023, 74, 161.2, 8.6, 18, 34, 43, -15, 49],
  ["edge-50-pro", "motorola", "Edge 50 Pro", "Edge", 2024, 72.4, 161.2, 8.2, 18, 34, 43, -15, 49],
  ["edge-60-pro", "motorola", "Edge 60 Pro", "Edge", 2025, 73.1, 160.7, 8.2, 18, 35, 44, -15, 49],
  ["nothing-phone-1", "nothing", "Phone (1)", "Phone", 2022, 75.8, 159.2, 8.3, 17, 38, 45, -15, 48],
  ["nothing-phone-2", "nothing", "Phone (2)", "Phone", 2023, 76.4, 162.1, 8.6, 17, 38, 45, -15, 49],
  ["nothing-phone-2a", "nothing", "Phone (2a)", "Phone", 2024, 76.3, 161.7, 8.6, 17, 42, 38, 0, 49],
  ["nothing-phone-3", "nothing", "Phone (3)", "Phone", 2025, 75.6, 160.6, 9, 17, 38, 45, -15, 48],
  ["oppo-find-x6", "oppo", "Find X6", "Find X", 2023, 74.1, 162.9, 9, 18, 46, 46, 0, 49],
  ["oppo-find-x7", "oppo", "Find X7", "Find X", 2024, 75.4, 162.7, 8.7, 18, 47, 47, 0, 49],
  ["oppo-find-x8", "oppo", "Find X8", "Find X", 2024, 74.4, 157.4, 7.9, 18, 46, 46, 0, 48],
  ["vivo-x90", "vivo", "X90", "X Series", 2022, 74.4, 164.1, 8.5, 18, 48, 48, 0, 49],
  ["vivo-x100", "vivo", "X100", "X Series", 2023, 75.2, 164.1, 8.8, 18, 48, 48, 0, 49],
  ["vivo-x200", "vivo", "X200", "X Series", 2024, 74.8, 160.3, 8, 18, 48, 48, 0, 48],
  ["realme-gt-5", "realme", "GT 5", "GT", 2023, 75.4, 163.1, 8.9, 18, 37, 44, -15, 49],
  ["realme-gt-6", "realme", "GT 6", "GT", 2024, 75.1, 162, 8.6, 18, 37, 44, -15, 49],
  ["realme-gt-7", "realme", "GT 7", "GT", 2025, 76, 162.4, 8.3, 18, 37, 44, -15, 49],
];

function standardFeatures(width: number, portWidth = 14): EdgeFeature[] {
  return [
    { edge: "right", offset: 20, length: 28, kind: "button" },
    { edge: "left", offset: 21, length: 25, kind: "button" },
    { edge: "bottom", offset: 0, length: portWidth, kind: "port" },
    { edge: "bottom", offset: -width * 0.29, length: 8, kind: "speaker" },
    { edge: "bottom", offset: width * 0.29, length: 4, kind: "microphone" },
  ];
}

function makeDevice(seed: Seed): DevicePreset {
  const [id, companyId, name, family, releaseYear, width, height, thickness, cornerRadius, cameraWidth, cameraHeight, cameraX, cameraY, aliases = []] = seed;
  const portWidth = 14;
  return {
    id, companyId, name, family, releaseYear, aliases, modelCodes: [], region: "global", width, height, thickness, cornerRadius,
    camera: { width: cameraWidth, height: cameraHeight, x: cameraX, y: cameraY, radius: Math.min(8, cameraWidth / 4) },
    portWidth, edgeFeatures: standardFeatures(width, portWidth), geometryStatus: "approximate",
  };
}

export const devices = seeds.map(makeDevice).map(refineDevice).sort((a, b) => b.releaseYear - a.releaseYear || a.name.localeCompare(b.name));

export function getDevice(id: string) {
  return devices.find((item) => item.id === id) ?? devices[0];
}

export function searchDevices(query: string, companyId?: CompanyId | "all", year?: number | "all") {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return devices.filter((device) => {
    if (companyId && companyId !== "all" && device.companyId !== companyId) return false;
    if (year && year !== "all" && device.releaseYear !== year) return false;
    const company = companies.find((item) => item.id === device.companyId)?.name ?? "";
    const haystack = [device.name, device.family, company, device.releaseYear, ...device.aliases].join(" ").toLocaleLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
