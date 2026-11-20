# Geometry release workflow

Raw licensed CAD and scans stay in a private source vault. Only license-approved derived base-case assets belong in `public/geometry/released/<brand>/`.

## Batch order

Complete the existing catalog one brand at a time:

1. Apple
2. Google
3. Samsung
4. Motorola
5. Nothing
6. OnePlus
7. Oppo
8. Realme
9. Vivo
10. Xiaomi

Do not add newer phones until these batches are complete.

## Preparing a model

1. Identify the exact manufacturer model code and regional variant.
2. Normalize licensed STEP/BREP geometry to millimetres with the phone centered at the origin: +X right when viewing the screen, +Y top, +Z toward the screen.
3. Compare body, camera, buttons, ports, speakers, microphones, and SIM geometry against two physical phones. Resolve any critical discrepancy over 0.20 mm.
4. Calibrate TPU clearance, corner fit, button membranes, camera openings, and charging-port clearance.
5. Generate a one-piece protective base case. Keep decoration out of structural and feature keep-out regions.
6. Print three consecutive cases with the locked manufacturing profile and test every print on both phones.
7. Store the approved derived binary STL, compute its SHA-256 checksum, and add the release metadata to the device preset.

## Release metadata

Add `modelCodes`, `region`, `geometryStatus: "production-validated"`, and a `geometryAsset` containing the released STL path, SHA-256 checksum, revision, manufacturing profile, outer size, validation date, physical sample count, and passing print count.

The application verifies this metadata and the downloaded asset checksum before producing a decorated STL. A status label alone never enables export.

## Current scoped release

The presentation stage adds reference-informed visual profiles for Apple, Google and Samsung. This does not change any model's geometry status. See [model-accuracy.md](model-accuracy.md) for source gaps and the per-model checklist.

A released asset may declare `customization` with `maxEmbossDepth`, `maxEngraveDepth`, `minBackThickness` and `backThickness`. Without these validated limits, export only permits a solid case with no text. Limits must be finite and nonnegative, minimum remaining thickness must be positive, and engraving must preserve that thickness after the geometry overlap allowance.

Runtime coordinates are +X right when viewing the screen, +Y top, +Z toward the screen. The rear camera is therefore positive X for devices whose camera is on the left when viewed from the back. Normalize source geometry to this convention before release; do not mirror a released STL to correct its appearance after validation.
