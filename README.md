# Layera X Caseforge

A browser-based parametric phone-case designer with a real-time 3D preview and print-ready STL export.

## Commands

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

Open `http://localhost:3000/case-generator`.

## Geometry release policy

Catalog entries are preview-only until a licensed-CAD-derived base case passes the production release gate. Approximate models cannot export STL files.

Validated releases use TPU 95A, a 0.4 mm nozzle, and 0.20 mm layers as the baseline. A release requires an exact manufacturer model code, an approved derived STL with a SHA-256 checksum, two physical phones, and three consecutive passing prints.

See [docs/geometry-release.md](docs/geometry-release.md) for the private-source workflow and brand rollout order.
