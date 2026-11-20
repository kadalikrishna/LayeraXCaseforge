"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCaseMetrics, validateCase } from "@/lib/case-metrics";
import { defaultConfiguration } from "@/lib/project";
import { geometryStatusLabels } from "@/lib/release";
import type { CaseConfiguration, DevicePreset } from "@/lib/types";
import type { CameraView } from "./CasePreview";
import styles from "./caseforge.module.css";

const CasePreview = dynamic(() => import("./CasePreview").then((module) => module.CasePreview), { ssr: false, loading: () => <div className={styles.previewLoading}>Opening your studio…</div> });
const swatches = ["#e63329", "#e6ded0", "#b3b7ce", "#303237", "#83a39a", "#e5b16d"];
type Props = { configuration: CaseConfiguration; device: DevicePreset; onBack: () => void; onChange: (value: CaseConfiguration) => void };

export function CaseEditor({ configuration, device, onBack, onChange }: Props) {
  const [autoRotate, setAutoRotate] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [view, setView] = useState<CameraView>("perspective");
  const [viewRevision, setViewRevision] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState("");
  const metrics = useMemo(() => getCaseMetrics(device, configuration), [device, configuration]);
  const warnings = useMemo(() => validateCase(device, configuration), [device, configuration]);
  const editorRef = useRef<HTMLElement>(null);
  const inputStart = useRef<number | null>(null);
  useEffect(() => {
    if (inputStart.current === null) return;
    const start = inputStart.current;
    inputStart.current = null;
    const frame = requestAnimationFrame(() => { if (editorRef.current) editorRef.current.dataset.inputLatencyMs = (performance.now() - start).toFixed(1); });
    return () => cancelAnimationFrame(frame);
  }, [configuration]);
  useEffect(() => { const sync = () => setFullscreen(!!document.fullscreenElement); document.addEventListener("fullscreenchange", sync); return () => document.removeEventListener("fullscreenchange", sync); }, []);
  function update<Key extends keyof CaseConfiguration>(key: Key, value: CaseConfiguration[Key]) { inputStart.current = performance.now(); onChange({ ...configuration, [key]: value }); }
  function updateText<Key extends keyof CaseConfiguration["text"]>(key: Key, value: CaseConfiguration["text"][Key]) { inputStart.current = performance.now(); onChange({ ...configuration, text: { ...configuration.text, [key]: value } }); }
  function cameraView(next: CameraView) { setView(next); setViewRevision((value) => value + 1); }
  async function toggleFullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { setNotice("Full screen is unavailable in this browser. The studio still fills the page; try F11 in Chrome or Edge."); }
  }
  return <section ref={editorRef} className={`${styles.editor} ${panelOpen ? styles.panelOpen : styles.panelClosed}`} aria-label="Case design studio">
    <div className={styles.studioHeading}><span className={styles.kicker}>Layera X Caseforge</span><h1>{device.name}</h1><p>Make it unmistakably yours.</p></div>
    <div className={styles.viewer}><CasePreview autoRotate={autoRotate} configuration={configuration} device={device} view={view} viewRevision={viewRevision} /></div>
    <div className={styles.studioActions}>
      <label className={styles.toggle}><input checked={configuration.showPhone} type="checkbox" onChange={(event) => update("showPhone", event.target.checked)} /><span />Show phone</label>
      <button aria-pressed={autoRotate} onClick={() => setAutoRotate((value) => !value)} type="button">{autoRotate ? "Pause spin" : "Auto rotate"}</button>
      <button onClick={() => void toggleFullscreen()} type="button" aria-label={fullscreen ? "Exit full screen" : "Enter full screen"}>{fullscreen ? "↙" : "↗"}<span className={styles.fullscreenLabel}> Full screen</span></button>
    </div>
    <button className={styles.panelToggle} aria-expanded={panelOpen} aria-controls="case-controls" onClick={() => setPanelOpen((value) => !value)} type="button">{panelOpen ? "− Hide controls" : "+ Customize case"}</button>
    <aside id="case-controls" className={styles.sidebar} hidden={!panelOpen} aria-label="Customization controls">
      <div className={styles.editorHeading}><span className={styles.kicker}>01 / Customize</span><button className={styles.back} onClick={onBack} type="button">Change phone ↗</button></div>
      <details open><summary>Case architecture</summary><div className={styles.controlBody}><div className={styles.segmented}>{(["slim", "protective"] as const).map((style) => <button aria-pressed={configuration.style === style} className={configuration.style === style ? styles.selected : ""} key={style} onClick={() => update("style", style)} type="button">{style}</button>)}</div><p className={styles.hint}>{configuration.style === "protective" ? "Reinforced walls and deeper edge protection." : "Lower bulk with a clean, flexible shell."}</p></div></details>
      <details open><summary>Color & finish</summary><div className={styles.controlBody}><div className={styles.swatches}>{swatches.map((color) => <button aria-label={`Set case color ${color}`} className={configuration.color === color ? styles.swatchActive : ""} key={color} onClick={() => update("color", color)} style={{ background: color }} type="button" />)}<input aria-label="Custom case color" type="color" value={configuration.color} onChange={(event) => update("color", event.target.value)} /></div><label>Surface finish<select value={configuration.finish} onChange={(event) => update("finish", event.target.value as CaseConfiguration["finish"])}><option value="matte">Matte</option><option value="satin">Satin</option><option value="gloss">Gloss</option></select></label></div></details>
      <details open><summary>Pattern & texture</summary><div className={styles.controlBody}><label>Pattern<select value={configuration.pattern} onChange={(event) => update("pattern", event.target.value as CaseConfiguration["pattern"])}><option value="solid">None / solid</option><option value="diagonal">Diagonal</option><option value="grid">Grid</option><option value="dots">Dots</option><option value="waves">Waves</option></select></label><div className={styles.segmented}>{(["emboss", "engrave"] as const).map((mode) => <button aria-pressed={configuration.patternMode === mode} className={configuration.patternMode === mode ? styles.selected : ""} key={mode} onClick={() => update("patternMode", mode)} type="button">{mode}</button>)}</div><label>Pattern depth <output>{configuration.patternDepth.toFixed(1)} mm</output><input aria-label="Pattern depth" min="0.3" max="1.4" step="0.1" type="range" value={configuration.patternDepth} onChange={(event) => update("patternDepth", Number(event.target.value))} /></label></div></details>
      <details open><summary>Custom text</summary><div className={styles.controlBody}><label>Text<input maxLength={18} placeholder="Your name" type="text" value={configuration.text.value} onChange={(event) => updateText("value", event.target.value)} /></label><div className={styles.segmented}>{(["emboss", "engrave"] as const).map((mode) => <button aria-pressed={configuration.text.mode === mode} className={configuration.text.mode === mode ? styles.selected : ""} key={mode} onClick={() => updateText("mode", mode)} type="button">{mode}</button>)}</div><label>Vertical position <output>{configuration.text.y} mm</output><input aria-label="Text vertical position" min={-55} max={45} step={1} type="range" value={configuration.text.y} onChange={(event) => updateText("y", Number(event.target.value))} /></label><label>Scale <output>{configuration.text.scale.toFixed(1)}×</output><input aria-label="Text scale" min="0.5" max="2" step="0.1" type="range" value={configuration.text.scale} onChange={(event) => updateText("scale", Number(event.target.value))} /></label></div></details>
      <div className={styles.controlBody}>{warnings.map((warning) => <p className={styles.warning} role="status" key={warning}>{warning}</p>)}</div><div className={styles.projectActions}><button onClick={() => onChange(defaultConfiguration)} type="button">Reset design</button></div>
      {configuration.pattern !== "solid" && <details open><summary>Pattern placement</summary><div className={styles.controlBody}><label>Pattern size <output>{configuration.patternScale.toFixed(1)}×</output><input aria-label="Pattern size" min="0.6" max="2" step="0.1" type="range" value={configuration.patternScale} onChange={(event) => update("patternScale", Number(event.target.value))} /></label><label>Spacing <output>{configuration.patternSpacing} mm</output><input aria-label="Pattern spacing" min="6" max="22" step="1" type="range" value={configuration.patternSpacing} onChange={(event) => update("patternSpacing", Number(event.target.value))} /></label><label>Rotation <output>{configuration.patternRotation}°</output><input aria-label="Pattern rotation" min="-180" max="180" step="1" type="range" value={configuration.patternRotation} onChange={(event) => update("patternRotation", Number(event.target.value))} /></label><label>Horizontal position <output>{configuration.patternOffsetX} mm</output><input aria-label="Pattern horizontal position" min="-30" max="30" step="1" type="range" value={configuration.patternOffsetX} onChange={(event) => update("patternOffsetX", Number(event.target.value))} /></label><label>Vertical position <output>{configuration.patternOffsetY} mm</output><input aria-label="Pattern vertical position" min="-30" max="30" step="1" type="range" value={configuration.patternOffsetY} onChange={(event) => update("patternOffsetY", Number(event.target.value))} /></label></div></details>}

    </aside>
    <div className={styles.cameraToolbar} aria-label="Camera views">
      {(["perspective", "back", "front", "side"] as CameraView[]).map((name) => <button aria-pressed={view === name} key={name} onClick={() => cameraView(name)} type="button">{name === "perspective" ? "3D" : name}</button>)}
      <span /><button onClick={() => cameraView("perspective")} type="button">Reset view ↺</button>
    </div>
    <span className={styles.viewerHint}>Drag to rotate · Scroll to zoom</span>
    <details className={styles.modelInfo}><summary>Model details <span>{device.geometryStatus === "production-validated" ? "Validated" : "Preview"}</span></summary><div>
      <dl><dt>Outer dimensions</dt><dd>{metrics.outerHeight.toFixed(1)} × {metrics.outerWidth.toFixed(1)} × {metrics.outerDepth.toFixed(1)} mm</dd><dt>Geometry</dt><dd>{geometryStatusLabels[device.geometryStatus]}</dd><dt>Profile</dt><dd>{device.profile ? "Model-specific visual reconstruction" : "Generic approximate preview"}</dd></dl>
      <p>{device.profile?.note ?? "This model has not yet received a detailed profile. Dimensions and openings are approximate."}</p>
      {device.profile?.sources.map((url, index) => <a href={url} target="_blank" rel="noreferrer" key={url}>Reference {index + 1} ↗</a>)}
      <p>Physical fit and printing are not validated. Production STL unlocks after model-specific testing.</p>
    </div></details>
    {notice && <div className={styles.notice} role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss studio notification" type="button">×</button></div>}
  </section>;
}
