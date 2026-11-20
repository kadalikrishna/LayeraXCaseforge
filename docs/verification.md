# Presentation verification — 14 September 2026

## Automated checks

- 88 tests pass across six files: project parsing/restoration, all catalog base geometries, pattern modes, geometry profiles, worker request ordering, released-base consistency, and production-export restrictions.
- ESLint and TypeScript checks pass.
- Production build passes with `node node_modules/next/dist/bin/next build --webpack`.
- Run the geometry suite with `node node_modules/vitest/vitest.mjs run --maxWorkers=1` to avoid competing geometry jobs on this laptop.

## Browser checks

Checked the local production app at 1280 × 720 and 390 × 844. The catalog search, company selection, editor panels, light/dark theme, camera presets/reset, full-screen entry/exit, phone visibility, finishes, colors, patterns and text controls were exercised. Mobile has no horizontal overflow; the collapsed bottom sheet leaves the case visible.

Saved a Samsung Galaxy S24 Ultra design with ivory color, dots and LAYERA text; reloaded and restored it through Resume saved project. JSON export created a downloaded project file. Importing the bundled iPhone 15 Pro project changed the phone, configuration and URL together. Importing an unrelated package.json displayed an invalid-project message and preserved the iPhone design. Unvalidated STL export remained disabled with an explanation.

Representative iPhone and Samsung rotation samples reported approximately 60 FPS. Sample configuration-handler-to-next-frame measurements were 13–14 ms. Geometry regeneration took approximately 1.5–3.7 seconds in sampled designs and ran in the worker while the previous mesh remained visible. These are local samples, not a guarantee for every model or device; the input measurement excludes browser event dispatch latency.

## Remaining physical work

All models are preview-only. The 33 Apple, Google and Samsung profiles contain reference-informed visual corrections, not verified manufacturing dimensions. Exact regional model codes, licensed CAD or measurements, calibrated printed candidates, phone-fit trials and release registration remain pending. See model-accuracy.md and geometry-release.md. No purchased assets or physical validation are implied by this prototype.
