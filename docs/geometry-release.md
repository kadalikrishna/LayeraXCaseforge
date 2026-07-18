# Geometry release workflow

Raw licensed CAD and scans stay in a private source vault. Only license-approved derived base-case assets belong in `public/geometry/released/<brand>/`.

## Batch order

Complete the existing catalog one brand at a time:

1. Apple
2. Google
3. Motorola
4. Nothing
5. OnePlus
6. Oppo
7. Realme
8. Samsung
9. Vivo
10. Xiaomi

Do not add newer phones until these batches are complete.

## Preparing a model

1. Identify the exact manufacturer model code and regional variant.
2. Normalize licensed STEP/BREP geometry to millimetres with the phone centered at the origin: +X right, +Y top, +Z toward the screen when viewed from the back.
3. Compare body, camera, buttons, ports, speakers, microphones, and SIM geometry against two physical phones. Resolve any critical discrepancy over 0.20 mm.
4. Calibrate TPU clearance, corner fit, button membranes, camera openings, and charging-port clearance.
5. Generate a one-piece protective base case. Keep decoration out of structural and feature keep-out regions.
6. Print three consecutive cases with the locked manufacturing profile and test every print on both phones.
7. Store the approved derived binary STL, compute its SHA-256 checksum, and add the release metadata to the device preset.

## Release metadata

Add `modelCodes`, `region`, `geometryStatus: "production-validated"`, and a `geometryAsset` containing the released STL path, SHA-256 checksum, revision, manufacturing profile, outer size, validation date, physical sample count, and passing print count.

The application verifies this metadata and the downloaded asset checksum before producing a decorated STL. A status label alone never enables export.
