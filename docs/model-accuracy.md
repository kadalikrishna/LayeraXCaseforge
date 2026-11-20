# Layera Caseforge — model accuracy and physical release checklist

The 33 Apple, Google and Samsung entries now use reference-informed visual profiles. They are **not CAD-derived or physically validated**. The other 23 catalog entries retain generic approximate profiles.

## What changed

- Body outline radius is independent of edge rounding and thickness.
- Apple: camera islands, separate volume controls, silent/action controls, Lightning/USB-C distinction and iPhone 16 Camera Control opening.
- Google: camera bars with rounded Pixel 9 islands, power above volume, and distinct lens assemblies.
- Samsung: S22 camera islands, separate camera-ring openings on later S-series and Ultras, right-side controls and Ultra S Pen access.
- All numeric camera envelopes, corner radii, control offsets and openings are visual estimates unless independently measured. Listed body dimensions originate from the existing catalog and still need variant-specific checks.

## Source audit

- [Apple dimensional drawings](https://developer.apple.com/accessories/dimensional-drawings/) lists all twelve iPhones in this catalog. Each Apple profile links to its individual PDF. Drawings have been located, not fully transcribed into certified CAD. No paid license was purchased.
- [Google hardware diagrams](https://support.google.com/pixelphone/answer/7157629?hl=en) describe the model-specific assemblies and controls. [Google specifications](https://support.google.com/pixelphone/answer/7158570?hl=en) provide published body dimensions. These are not complete accessory manufacturing drawings.
- [Samsung S24 specifications](https://news.samsung.com/ca/new-samsung-galaxy-s24-series-now-available-in-canada-promising-a-new-beginning-with-galaxy-ai) and [Samsung product reports](https://www.samsung.com/global/sustainability/policy-file/AYVhR1k6BicAIx95/LCA_Results_for_Smartphones.pdf) provide dimensions and product references. No complete licensed mechanical CAD set for all twelve Samsung variants has been obtained.
- No external mesh has been presented as licensed manufacturing geometry. Acquire a documented source license or use measured source geometry before the physical stage.

## Model-by-model status

Every row below needs: exact model code/region, verified source geometry, two-phone measurement comparison, calibration, and three consecutive passing TPU prints. You coordinate access to phones and report print results. The application retains the production STL gate throughout.

| Model | Visual profile | Source CAD | Physical fit |
| --- | --- | --- | --- |
| iPhone 14 | Reference layout implemented | Pending | Pending |
| iPhone 14 Plus | Reference layout implemented | Pending | Pending |
| iPhone 14 Pro | Reference layout implemented | Pending | Pending |
| iPhone 14 Pro Max | Reference layout implemented | Pending | Pending |
| iPhone 15 | Reference layout implemented | Pending | Pending |
| iPhone 15 Plus | Reference layout implemented | Pending | Pending |
| iPhone 15 Pro | Reference layout implemented | Pending | Pending |
| iPhone 15 Pro Max | Reference layout implemented | Pending | Pending |
| iPhone 16 | Reference layout implemented | Pending | Pending |
| iPhone 16 Plus | Reference layout implemented | Pending | Pending |
| iPhone 16 Pro | Reference layout implemented | Pending | Pending |
| iPhone 16 Pro Max | Reference layout implemented | Pending | Pending |
| Pixel 7 | Reference layout implemented | Pending | Pending |
| Pixel 7 Pro | Reference layout implemented | Pending | Pending |
| Pixel 7a | Reference layout implemented | Pending | Pending |
| Pixel 8 | Reference layout implemented | Pending | Pending |
| Pixel 8 Pro | Reference layout implemented | Pending | Pending |
| Pixel 8a | Reference layout implemented | Pending | Pending |
| Pixel 9 | Reference layout implemented | Pending | Pending |
| Pixel 9 Pro | Reference layout implemented | Pending | Pending |
| Pixel 9 Pro XL | Reference layout implemented | Pending | Pending |
| Galaxy S22 | Reference layout implemented | Pending | Pending |
| Galaxy S22+ | Reference layout implemented | Pending | Pending |
| Galaxy S22 Ultra | Reference layout implemented | Pending | Pending |
| Galaxy S23 | Reference layout implemented | Pending | Pending |
| Galaxy S23+ | Reference layout implemented | Pending | Pending |
| Galaxy S23 Ultra | Reference layout implemented | Pending | Pending |
| Galaxy S24 | Reference layout implemented | Pending | Pending |
| Galaxy S24+ | Reference layout implemented | Pending | Pending |
| Galaxy S24 Ultra | Reference layout implemented | Pending | Pending |
| Galaxy S25 | Reference layout implemented | Pending | Pending |
| Galaxy S25+ | Reference layout implemented | Pending | Pending |
| Galaxy S25 Ultra | Reference layout implemented | Pending | Pending |

## Release handoff

For each model, record the source/license, exact model code and regional variant, critical measured dimensions, printer/slicer/material settings, fit observations on both phones and three print results. Attach the report to the private source vault.

Register only approved derived assets in `public/geometry/released/<brand>/`. Add SHA-256, outer dimensions and manufacturing metadata to the catalog. Decorations require explicitly validated maximum emboss/engrave depths, back thickness and minimum remaining thickness; releases lacking those limits only allow a solid case without text. Preview and export use the same checksum-verified base asset.

Batch order for this delivery: Apple → Google → Samsung. A brand remains partly unvalidated until every individual model and exact variant passes. Never advance status just to enable a download.
