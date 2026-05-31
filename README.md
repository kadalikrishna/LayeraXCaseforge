# Laryera Phase 1 Case Generator

Standalone Phase 1 website module for a parametric phone case generator.

## Current Features

- Next.js, TypeScript, React Three Fiber, and JSCAD.
- `/case-generator` page.
- Simple rounded rectangular case body.
- Controls for phone width, phone height, phone thickness, wall thickness, back thickness, corner radius, and tolerance.
- Browser 3D preview with orbit controls.

## Explicitly Not Included Yet

- Camera cutouts.
- Buttons.
- Logo/image upload.
- Database.
- Authentication.
- Payments.
- STL/3MF export.

## Preview

Serve the folder:

```powershell
npm install
npm run dev
```

Open:

```text
http://localhost:3000/case-generator
```

## Integration Plan

This is intentionally built as a separate module first. Later it can be merged into your website.
