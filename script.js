import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

const models = [
  { name: "iPhone 11", height: 151.5, width: 76.3, depth: 8.8, wall: 1.8, camera: 2, radius: 6 },
  { name: "iPhone 12", height: 147.3, width: 72.1, depth: 7.9, wall: 1.8, camera: 2, radius: 5 },
  { name: "iPhone 12 Mini", height: 132.1, width: 64.8, depth: 7.9, wall: 1.8, camera: 2, radius: 5 },
  { name: "iPhone 12 Pro", height: 147.3, width: 72.1, depth: 7.9, wall: 1.8, camera: 2, radius: 5 },
  { name: "iPhone 12 Pro Max", height: 161.4, width: 78.7, depth: 7.9, wall: 1.8, camera: 2, radius: 6 },
  { name: "iPhone 13", height: 147.3, width: 72.1, depth: 8.2, wall: 1.8, camera: 2, radius: 5 },
  { name: "iPhone 13 Mini", height: 132.1, width: 64.8, depth: 8.2, wall: 1.8, camera: 2, radius: 5 },
  { name: "iPhone 13 Pro", height: 147.3, width: 72.1, depth: 8.2, wall: 1.8, camera: 2.5, radius: 5 },
  { name: "iPhone 13 Pro Max", height: 161.4, width: 78.7, depth: 8.2, wall: 1.8, camera: 2.5, radius: 6 },
];

const patterns = [
  { id: "none", name: "Clear selection", type: "none" },
  { id: "pattern_4", name: "pattern_4", type: "waves" },
  { id: "pattern_5", name: "pattern_5", type: "dots" },
  { id: "pattern_6", name: "pattern_6", type: "capsules" },
  { id: "pattern_7", name: "pattern_7", type: "stars" },
  { id: "pattern_8", name: "pattern_8", type: "tiles" },
  { id: "pattern_9", name: "pattern_9", type: "basket" },
  { id: "pattern_10", name: "pattern_10", type: "diamonds" },
  { id: "pattern_11", name: "pattern_11", type: "chevron" },
  { id: "pattern_12", name: "pattern_12", type: "weave" },
  { id: "pattern_13", name: "pattern_13", type: "maze" },
  { id: "pattern_14", name: "pattern_14", type: "grid" },
  { id: "pattern_15", name: "pattern_15", type: "stripes" },
];

const parameterIds = [
  "caseHeight", "caseWidth", "caseDepth", "wallThickness", "lipHeight", "cornerRadius",
  "cameraX", "cameraY", "cameraWidth", "cameraHeight", "portWidth", "buttonHeight",
];

const $ = (id) => document.querySelector(`#${id}`);
const els = {
  modelGrid: $("modelGrid"),
  patternGrid: $("patternGrid"),
  modelModal: $("modelModal"),
  patternModal: $("patternModal"),
  flatCase: $("flatCase"),
  flatPattern: $("flatPattern"),
  activePatternName: $("activePatternName"),
  activeModelName: $("activeModelName"),
  selectedModelName: $("selectedModelName"),
  selectedModelSize: $("selectedModelSize"),
  viewer: $("threeViewer"),
  patternSize: $("patternSize"),
  patternRotation: $("patternRotation"),
  positionX: $("positionX"),
  positionY: $("positionY"),
  imageUpload: $("imageUpload"),
  caseText: $("caseText"),
};

let selectedModel = models[8];
let selectedPattern = null;
let uploadedImage = null;
let texture = null;
let caseGroup = null;
let view = { yaw: -0.35, pitch: 0.1, zoom: 1, dragging: false, x: 0, y: 0 };

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4f5f7);
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 1000);
camera.position.set(0, 0, 280);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
els.viewer.appendChild(renderer.domElement);
scene.add(new THREE.AmbientLight(0xffffff, 1.35));
const key = new THREE.DirectionalLight(0xffffff, 2.1);
key.position.set(80, 120, 180);
scene.add(key);
const fill = new THREE.DirectionalLight(0xbcefff, 0.65);
fill.position.set(-110, -80, 120);
scene.add(fill);

function readParams() {
  return Object.fromEntries(parameterIds.map((id) => [id, Number($(id).value)]));
}

function writeParams(model) {
  const pro = model.name.includes("Pro");
  const max = model.name.includes("Max");
  const data = {
    caseHeight: model.height,
    caseWidth: model.width,
    caseDepth: model.depth,
    wallThickness: model.wall,
    lipHeight: 1.2,
    cornerRadius: model.radius,
    cameraX: max ? -24 : -21,
    cameraY: model.height * 0.32,
    cameraWidth: pro ? 34 : 28,
    cameraHeight: pro ? 42 : 30,
    portWidth: 16,
    buttonHeight: 18,
  };
  parameterIds.forEach((id) => {
    $(id).value = data[id];
  });
}

function roundedRectShape(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function addRoundedHole(shape, cx, cy, w, h, r) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const hole = new THREE.Path();
  hole.moveTo(x + r, y);
  hole.lineTo(x + w - r, y);
  hole.quadraticCurveTo(x + w, y, x + w, y + r);
  hole.lineTo(x + w, y + h - r);
  hole.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  hole.lineTo(x + r, y + h);
  hole.quadraticCurveTo(x, y + h, x, y + h - r);
  hole.lineTo(x, y + r);
  hole.quadraticCurveTo(x, y, x + r, y);
  shape.holes.push(hole);
}

function drawPattern(ctx, pattern, tile, color) {
  if (!pattern) return;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(3, tile * 0.08);
  ctx.lineCap = "square";

  if (pattern.type === "stars") {
    ctx.font = `${tile * 0.28}px Arial`;
    for (let y = -tile; y < tile * 2; y += tile * 0.42) {
      for (let x = -tile; x < tile * 2; x += tile * 0.42) ctx.fillText("*", x, y);
    }
    return;
  }

  if (pattern.type === "waves") {
    for (let y = 0; y < tile; y += tile * 0.25) {
      ctx.beginPath();
      ctx.arc(tile * 0.25, y, tile * 0.22, Math.PI, 0);
      ctx.arc(tile * 0.75, y, tile * 0.22, Math.PI, 0);
      ctx.stroke();
    }
    return;
  }

  if (pattern.type === "dots" || pattern.type === "capsules") {
    for (let y = 0; y < tile * 1.2; y += tile * 0.33) {
      for (let x = 0; x < tile * 1.2; x += tile * 0.33) {
        ctx.beginPath();
        ctx.arc(x, y, tile * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const lineCount = pattern.type === "chevron" ? 9 : 6;
  for (let i = -lineCount; i < lineCount * 2; i++) {
    const p = i * tile * 0.22;
    ctx.beginPath();
    ctx.moveTo(p, -tile);
    ctx.lineTo(p + tile, tile * 2);
    ctx.stroke();
  }
  if (["tiles", "diamonds", "maze", "weave", "basket", "chevron"].includes(pattern.type)) {
    for (let i = -lineCount; i < lineCount * 2; i++) {
      const p = i * tile * 0.24;
      ctx.beginPath();
      ctx.moveTo(p + tile, -tile);
      ctx.lineTo(p, tile * 2);
      ctx.stroke();
    }
  }
  if (pattern.type === "stripes" || pattern.type === "grid") {
    for (let x = 0; x < tile; x += tile * 0.18) ctx.fillRect(x, 0, tile * 0.05, tile);
  }
}

function makeDecorationCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1600;
  const ctx = canvas.getContext("2d");
  const base = $("baseColor").value;
  const color = $("patternColor").value;
  const size = Number(els.patternSize.value);
  const rotation = Number(els.patternRotation.value);
  const x = Number(els.positionX.value) * 24;
  const y = Number(els.positionY.value) * 24;
  const tile = 42 * size;

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (selectedPattern) {
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = tile;
    patternCanvas.height = tile;
    drawPattern(patternCanvas.getContext("2d"), selectedPattern, tile, color);
    const repeat = $("arrayMode").checked ? "repeat" : "no-repeat";
    const pattern = ctx.createPattern(patternCanvas, repeat);
    ctx.save();
    ctx.translate(canvas.width / 2 + x, canvas.height / 2 + y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.fillStyle = pattern;
    ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
    ctx.restore();
  }

  if (uploadedImage) {
    const imageW = canvas.width * 0.62;
    const ratio = uploadedImage.height / uploadedImage.width;
    ctx.drawImage(uploadedImage, (canvas.width - imageW) / 2 + x, canvas.height * 0.38 + y, imageW, imageW * ratio);
  }

  if (els.caseText.value.trim()) {
    ctx.fillStyle = color;
    ctx.font = "bold 96px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(els.caseText.value.trim(), canvas.width / 2 + x, canvas.height * 0.72 + y);
  }

  return canvas;
}

function updateDecorationTexture() {
  const canvas = makeDecorationCanvas();
  const dataUrl = canvas.toDataURL("image/png");
  els.flatPattern.style.backgroundImage = `url(${dataUrl})`;
  els.flatPattern.style.backgroundSize = "cover";
  els.flatCase.classList.toggle("empty", !selectedPattern && !uploadedImage && !els.caseText.value.trim());
  if (!texture) {
    texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
  } else {
    texture.image = canvas;
    texture.needsUpdate = true;
  }
}

function buildCaseMesh() {
  if (caseGroup) scene.remove(caseGroup);
  updateDecorationTexture();
  const p = readParams();
  const scale = 1.45;
  const w = p.caseWidth * scale;
  const h = p.caseHeight * scale;
  const depth = Math.max(9, (p.caseDepth + p.lipHeight) * 1.25);
  const wall = Math.max(5, p.wallThickness * scale * 2);
  const radius = p.cornerRadius * scale + 12;
  const group = new THREE.Group();

  const outer = roundedRectShape(w, h, radius);
  addRoundedHole(outer, p.cameraX * scale, p.cameraY * scale, p.cameraWidth * scale, p.cameraHeight * scale, 16);
  const shell = new THREE.ExtrudeGeometry(outer, { depth, bevelEnabled: true, bevelSize: 2, bevelThickness: 2, bevelSegments: 6 });
  shell.center();
  const shellMesh = new THREE.Mesh(shell, new THREE.MeshStandardMaterial({ color: $("caseColor").value, roughness: 0.52 }));
  shellMesh.position.z = -4;
  group.add(shellMesh);

  const backShape = roundedRectShape(w - wall, h - wall, Math.max(16, radius - wall));
  addRoundedHole(backShape, p.cameraX * scale, p.cameraY * scale, Math.max(10, p.cameraWidth * scale - wall), Math.max(10, p.cameraHeight * scale - wall), 14);
  const back = new THREE.ShapeGeometry(backShape, 64);
  const backMesh = new THREE.Mesh(back, new THREE.MeshStandardMaterial({ map: texture, roughness: 0.78, side: THREE.DoubleSide }));
  backMesh.position.z = 5.4;
  group.add(backMesh);

  const cameraRingShape = roundedRectShape(p.cameraWidth * scale + 10, p.cameraHeight * scale + 10, 18);
  addRoundedHole(cameraRingShape, 0, 0, Math.max(8, p.cameraWidth * scale - 4), Math.max(8, p.cameraHeight * scale - 4), 14);
  const cameraRing = new THREE.ExtrudeGeometry(cameraRingShape, { depth: 5, bevelEnabled: true, bevelSize: 1.3, bevelThickness: 1.3, bevelSegments: 5 });
  cameraRing.center();
  const ringMesh = new THREE.Mesh(cameraRing, new THREE.MeshStandardMaterial({ color: 0x050708, roughness: 0.45 }));
  ringMesh.position.set(p.cameraX * scale, p.cameraY * scale, 8.5);
  group.add(ringMesh);

  const cutoutMaterial = new THREE.MeshStandardMaterial({ color: 0x050708, roughness: 0.6 });
  const port = new THREE.Mesh(new THREE.BoxGeometry(p.portWidth * scale, 4, 4), cutoutMaterial);
  port.position.set(0, -h / 2 + wall * 0.45, 8.8);
  group.add(port);
  [-0.18, 0.02].forEach((offset) => {
    const button = new THREE.Mesh(new THREE.BoxGeometry(4, p.buttonHeight * scale, 5), cutoutMaterial);
    button.position.set(w / 2 + 1.5, h * offset, 2);
    group.add(button);
  });

  group.rotation.x = view.pitch;
  group.rotation.y = view.yaw;
  group.scale.setScalar(view.zoom);
  caseGroup = group;
  scene.add(group);
}

function updateView() {
  if (!caseGroup) return;
  caseGroup.rotation.x = view.pitch;
  caseGroup.rotation.y = view.yaw;
  caseGroup.scale.setScalar(view.zoom);
}

function resizeRenderer() {
  const rect = els.viewer.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

function animate() {
  resizeRenderer();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function updatePatternControls() {
  $("sizeValue").textContent = `${Number(els.patternSize.value).toFixed(2)}x`;
  $("rotationValue").textContent = `${els.patternRotation.value} deg`;
  buildCaseMesh();
}

function applyPattern(pattern) {
  selectedPattern = pattern?.id === "none" ? null : pattern;
  els.activePatternName.textContent = selectedPattern ? selectedPattern.name : "Choose a Pattern...";
  renderPatternGrid();
  buildCaseMesh();
  closeModal("patternModal");
}

function applyModel(model) {
  selectedModel = model;
  writeParams(model);
  els.activeModelName.textContent = model.name;
  els.selectedModelName.textContent = model.name;
  els.selectedModelSize.textContent = `${model.height} x ${model.width} x ${model.depth} mm`;
  renderModelGrid();
  buildCaseMesh();
  closeModal("modelModal");
}

function patternThumbCss(pattern) {
  if (pattern.type === "none") return "linear-gradient(135deg, #fff, #f5f5f5)";
  if (pattern.type === "stars") return "radial-gradient(circle at 14px 14px, #000 0 3px, transparent 4px)";
  if (pattern.type === "waves") return "repeating-radial-gradient(ellipse at center, transparent 0 8px, #000 9px 11px, transparent 12px 18px)";
  if (pattern.type === "dots") return "radial-gradient(circle at 12px 12px, #000 0 5px, transparent 6px)";
  if (pattern.type === "stripes") return "repeating-linear-gradient(90deg, #000 0 4px, transparent 4px 10px)";
  return "repeating-linear-gradient(45deg, #000 0 6px, transparent 6px 14px), repeating-linear-gradient(-45deg, transparent 0 12px, #000 12px 18px, transparent 18px 28px)";
}

function renderModelGrid() {
  els.modelGrid.innerHTML = models.map((model) => `
    <button type="button" class="model-card ${model.name === selectedModel.name ? "active" : ""}" data-model="${model.name}">
      <div class="model-thumb"><div class="model-phone"></div></div>
      <div class="model-info"><strong>${model.name}</strong><span>Preset</span></div>
    </button>
  `).join("");
  els.modelGrid.querySelectorAll(".model-card").forEach((card) => {
    card.addEventListener("click", () => applyModel(models.find((model) => model.name === card.dataset.model)));
  });
}

function renderPatternGrid() {
  els.patternGrid.innerHTML = patterns.map((pattern) => `
    <button type="button" class="pattern-card ${selectedPattern?.id === pattern.id ? "active" : ""}" data-pattern="${pattern.id}">
      <div class="pattern-thumb" style="--thumb-bg: ${patternThumbCss(pattern)}"></div>
      <strong>${pattern.name}</strong><span>${pattern.id === "none" ? "Reset" : "Pattern"}</span>
    </button>
  `).join("");
  els.patternGrid.querySelectorAll(".pattern-card").forEach((card) => {
    card.addEventListener("click", () => applyPattern(patterns.find((pattern) => pattern.id === card.dataset.pattern)));
  });
}

function openModal(id) {
  $(id).classList.remove("hidden");
}

function closeModal(id) {
  $(id).classList.add("hidden");
}

function stlFacet(normal, points) {
  return [`facet normal ${normal.join(" ")}`, "  outer loop", ...points.map((p) => `    vertex ${p.join(" ")}`), "  endloop", "endfacet"].join("\n");
}

function boxFacets(x, y, z, w, h, d) {
  const p = { a: [x, y, z], b: [x + w, y, z], c: [x + w, y + h, z], d: [x, y + h, z], e: [x, y, z + d], f: [x + w, y, z + d], g: [x + w, y + h, z + d], h: [x, y + h, z + d] };
  return [
    stlFacet([0, 0, -1], [p.a, p.c, p.b]), stlFacet([0, 0, -1], [p.a, p.d, p.c]),
    stlFacet([0, 0, 1], [p.e, p.f, p.g]), stlFacet([0, 0, 1], [p.e, p.g, p.h]),
    stlFacet([0, -1, 0], [p.a, p.b, p.f]), stlFacet([0, -1, 0], [p.a, p.f, p.e]),
    stlFacet([1, 0, 0], [p.b, p.c, p.g]), stlFacet([1, 0, 0], [p.b, p.g, p.f]),
    stlFacet([0, 1, 0], [p.c, p.d, p.h]), stlFacet([0, 1, 0], [p.c, p.h, p.g]),
    stlFacet([-1, 0, 0], [p.d, p.a, p.e]), stlFacet([-1, 0, 0], [p.d, p.e, p.h]),
  ];
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function designPayload() {
  return {
    app: "Laryera CaseStudio Module",
    version: 1,
    units: "mm",
    model: selectedModel.name,
    parameters: readParams(),
    colors: { case: $("caseColor").value, base: $("baseColor").value, pattern: $("patternColor").value },
    decoration: {
      pattern: selectedPattern?.id || null,
      patternSize: Number(els.patternSize.value),
      rotation: Number(els.patternRotation.value),
      positionX: Number(els.positionX.value),
      positionY: Number(els.positionY.value),
      arrayMode: $("arrayMode").checked,
      text: els.caseText.value,
      hasUploadedImage: Boolean(uploadedImage),
    },
  };
}

function downloadJson() {
  downloadFile("laryera-case-design.json", JSON.stringify(designPayload(), null, 2), "application/json");
}

function downloadStl() {
  const p = readParams();
  const wall = p.wallThickness;
  const outerW = p.caseWidth + wall * 2;
  const outerH = p.caseHeight + wall * 2;
  const depth = p.caseDepth + p.lipHeight + 1.6;
  const facets = [
    ...boxFacets(0, 0, 0, outerW, outerH, 1.6),
    ...boxFacets(0, 0, 1.6, wall, outerH, depth),
    ...boxFacets(outerW - wall, 0, 1.6, wall, outerH, depth),
    ...boxFacets(0, 0, 1.6, outerW, wall, depth),
    ...boxFacets(0, outerH - wall, 1.6, outerW, wall, depth),
  ];
  downloadFile("laryera-parametric-iphone-case-basic.stl", ["solid laryera_case", ...facets, "endsolid laryera_case"].join("\n"), "model/stl");
}

document.querySelectorAll(".accordion-head").forEach((button) => {
  button.addEventListener("click", () => {
    const body = $(`panel-${button.dataset.panel}`);
    body.classList.toggle("collapsed");
    button.parentElement.classList.toggle("active", !body.classList.contains("collapsed"));
  });
});

$("openPatternModal").addEventListener("click", () => openModal("patternModal"));
$("openModelModal").addEventListener("click", () => openModal("modelModal"));
$("backToConfig").addEventListener("click", () => openModal("modelModal"));
$("downloadStl").addEventListener("click", downloadStl);
$("downloadJson").addEventListener("click", downloadJson);
$("resetView").addEventListener("click", () => {
  view = { ...view, yaw: -0.35, pitch: 0.1, zoom: 1 };
  updateView();
});
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => closeModal(button.dataset.close)));
[els.modelModal, els.patternModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal(modal.id);
  });
});
parameterIds.forEach((id) => $(id).addEventListener("input", buildCaseMesh));
[els.patternSize, els.patternRotation, els.positionX, els.positionY, $("arrayMode")].forEach((input) => {
  input.addEventListener("input", updatePatternControls);
  input.addEventListener("change", updatePatternControls);
});
["caseColor", "patternColor", "baseColor"].forEach((id) => $(id).addEventListener("input", buildCaseMesh));
els.caseText.addEventListener("input", buildCaseMesh);
els.imageUpload.addEventListener("change", () => {
  const file = els.imageUpload.files?.[0];
  if (!file) {
    uploadedImage = null;
    buildCaseMesh();
    return;
  }
  const image = new Image();
  image.onload = () => {
    uploadedImage = image;
    URL.revokeObjectURL(image.src);
    buildCaseMesh();
  };
  image.src = URL.createObjectURL(file);
});

els.viewer.addEventListener("pointerdown", (event) => {
  view.dragging = true;
  view.x = event.clientX;
  view.y = event.clientY;
  els.viewer.classList.add("dragging");
  els.viewer.setPointerCapture(event.pointerId);
});
els.viewer.addEventListener("pointermove", (event) => {
  if (!view.dragging) return;
  view.yaw += (event.clientX - view.x) * 0.01;
  view.pitch += (event.clientY - view.y) * 0.01;
  view.pitch = Math.max(-1.2, Math.min(1.2, view.pitch));
  view.x = event.clientX;
  view.y = event.clientY;
  updateView();
});
els.viewer.addEventListener("pointerup", (event) => {
  view.dragging = false;
  els.viewer.classList.remove("dragging");
  els.viewer.releasePointerCapture(event.pointerId);
});
els.viewer.addEventListener("pointercancel", () => {
  view.dragging = false;
  els.viewer.classList.remove("dragging");
});
els.viewer.addEventListener("wheel", (event) => {
  event.preventDefault();
  view.zoom = Math.max(0.55, Math.min(2.1, view.zoom + (event.deltaY > 0 ? -0.08 : 0.08)));
  updateView();
}, { passive: false });

renderModelGrid();
renderPatternGrid();
applyModel(selectedModel);
updatePatternControls();
animate();
