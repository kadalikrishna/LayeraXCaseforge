"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { downloadProject, downloadStl } from "@/lib/export";
import { getCaseMetrics, validateCase } from "@/lib/geometry";
import { createProject, defaultConfiguration, parseProject } from "@/lib/project";
import { canExportProductionStl, geometryStatusLabels, getExportIssues } from "@/lib/release";
import type { CaseConfiguration, DevicePreset } from "@/lib/types";
import styles from "./caseforge.module.css";

const CasePreview = dynamic(() => import("./CasePreview").then((module) => module.CasePreview), { ssr: false, loading: () => <div className={styles.previewLoading}>Building geometry…</div> });
const swatches = ["#5eead4", "#f97316", "#818cf8", "#f43f5e", "#e8e6df", "#202729"];

type CaseEditorProps = { configuration: CaseConfiguration; device: DevicePreset; onBack: () => void; onChange: (value: CaseConfiguration) => void; storageKey: string };

export function CaseEditor({ configuration, device, onBack, onChange, storageKey }: CaseEditorProps) {
  const [notice, setNotice] = useState("");
  const [autoRotate, setAutoRotate] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const metrics = useMemo(() => getCaseMetrics(device, configuration), [device, configuration]);
  const warnings = useMemo(() => validateCase(device, configuration), [device, configuration]);
  const exportIssues = useMemo(() => getExportIssues(device, configuration), [device, configuration]);
  const exportReady = canExportProductionStl(device, configuration) && warnings.length === 0;
  function update<Key extends keyof CaseConfiguration>(key: Key, value: CaseConfiguration[Key]) { onChange({ ...configuration, [key]: value }); }
  function updateText<Key extends keyof CaseConfiguration["text"]>(key: Key, value: CaseConfiguration["text"][Key]) { onChange({ ...configuration, text: { ...configuration.text, [key]: value } }); }
  function save() { const project = createProject(device, configuration); localStorage.setItem(storageKey, JSON.stringify(project)); setNotice("Project saved locally."); }
  async function exportStl() {
    try {
      setNotice("Verifying released geometry...");
      await downloadStl(device, configuration);
      setNotice("Validated STL downloaded.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "STL export failed.");
    }
  }
  async function importProject(file?: File) { if (!file) return; try { const project = parseProject(JSON.parse(await file.text())); onChange(project.configuration); localStorage.setItem(storageKey, JSON.stringify(project)); setNotice("Project imported."); } catch { setNotice("That project file is invalid or unsupported."); } }

  return <section className={styles.editor}>
    <aside className={styles.sidebar}>
      <div className={styles.editorHeading}><button className={styles.back} onClick={onBack} type="button">← Change model</button><span className={styles.kicker}>Now forging</span><h1>{device.name}</h1><p>{device.family} · {device.height} × {device.width} mm</p><p className={device.geometryStatus === "production-validated" ? styles.valid : styles.warning}>{geometryStatusLabels[device.geometryStatus]}</p></div>
      <details open><summary>Case architecture</summary><div className={styles.controlBody}><div className={styles.segmented}>{(["slim", "protective"] as const).map((style) => <button className={configuration.style === style ? styles.selected : ""} key={style} onClick={() => update("style", style)} type="button">{style}</button>)}</div><p className={styles.hint}>{configuration.style === "protective" ? "Reinforced walls and deeper edge protection." : "Lower bulk with a clean, flexible shell."}</p></div></details>
      <details open><summary>Color & finish</summary><div className={styles.controlBody}><div className={styles.swatches}>{swatches.map((color) => <button aria-label={`Set case color ${color}`} className={configuration.color === color ? styles.swatchActive : ""} key={color} onClick={() => update("color", color)} style={{ background: color }} type="button" />)}<input aria-label="Custom case color" type="color" value={configuration.color} onChange={(event) => update("color", event.target.value)} /></div><label>Surface finish<select value={configuration.finish} onChange={(event) => update("finish", event.target.value as CaseConfiguration["finish"])}><option value="matte">Matte</option><option value="satin">Satin</option><option value="gloss">Gloss</option></select></label></div></details>
      <details open><summary>Printable pattern</summary><div className={styles.controlBody}><label>Pattern<select value={configuration.pattern} onChange={(event) => update("pattern", event.target.value as CaseConfiguration["pattern"])}><option value="solid">None / solid</option><option value="diagonal">Diagonal</option><option value="grid">Grid</option><option value="dots">Dots</option><option value="waves">Waves</option></select></label><div className={styles.segmented}>{(["emboss", "engrave"] as const).map((mode) => <button className={configuration.patternMode === mode ? styles.selected : ""} key={mode} onClick={() => update("patternMode", mode)} type="button">{mode}</button>)}</div><label>Pattern depth <output>{configuration.patternDepth.toFixed(1)} mm</output><input min="0.3" max="1.4" step="0.1" type="range" value={configuration.patternDepth} onChange={(event) => update("patternDepth", Number(event.target.value))} /></label></div></details>
      <details open><summary>Custom text</summary><div className={styles.controlBody}><label>Text<input maxLength={18} placeholder="Your name" type="text" value={configuration.text.value} onChange={(event) => updateText("value", event.target.value)} /></label><div className={styles.segmented}>{(["emboss", "engrave"] as const).map((mode) => <button className={configuration.text.mode === mode ? styles.selected : ""} key={mode} onClick={() => updateText("mode", mode)} type="button">{mode}</button>)}</div><label>Vertical position <output>{configuration.text.y} mm</output><input min={-55} max={45} step={1} type="range" value={configuration.text.y} onChange={(event) => updateText("y", Number(event.target.value))} /></label><label>Scale <output>{configuration.text.scale.toFixed(1)}×</output><input min="0.5" max="2" step="0.1" type="range" value={configuration.text.scale} onChange={(event) => updateText("scale", Number(event.target.value))} /></label></div></details>
      <div className={styles.projectActions}><button onClick={save} type="button">Save locally</button><button onClick={() => downloadProject(createProject(device, configuration))} type="button">Export JSON</button><button onClick={() => importRef.current?.click()} type="button">Import</button><input ref={importRef} hidden accept="application/json" type="file" onChange={(event) => void importProject(event.target.files?.[0])} /><button onClick={() => onChange(defaultConfiguration)} type="button">Reset</button></div>
      {configuration.pattern !== "solid" && <details open><summary>Pattern placement</summary><div className={styles.controlBody}><label>Pattern size <output>{configuration.patternScale.toFixed(1)}×</output><input min="0.6" max="2" step="0.1" type="range" value={configuration.patternScale} onChange={(event) => update("patternScale", Number(event.target.value))} /></label><label>Spacing <output>{configuration.patternSpacing} mm</output><input min="6" max="22" step="1" type="range" value={configuration.patternSpacing} onChange={(event) => update("patternSpacing", Number(event.target.value))} /></label><label>Rotation <output>{configuration.patternRotation}°</output><input min="-180" max="180" step="1" type="range" value={configuration.patternRotation} onChange={(event) => update("patternRotation", Number(event.target.value))} /></label><label>Horizontal position <output>{configuration.patternOffsetX} mm</output><input min="-30" max="30" step="1" type="range" value={configuration.patternOffsetX} onChange={(event) => update("patternOffsetX", Number(event.target.value))} /></label><label>Vertical position <output>{configuration.patternOffsetY} mm</output><input min="-30" max="30" step="1" type="range" value={configuration.patternOffsetY} onChange={(event) => update("patternOffsetY", Number(event.target.value))} /></label></div></details>}
    </aside>
    <div className={styles.workspace}>
      <div className={styles.viewerBar}><div><span className={styles.kicker}>3D Preview</span><strong>{configuration.style} case · {configuration.finish} finish</strong></div><div className={styles.viewerControls}><button aria-pressed={autoRotate} className={autoRotate ? styles.selected : ""} onClick={() => setAutoRotate((value) => !value)} type="button">{autoRotate ? "Pause spin" : "Auto rotate"}</button><label className={styles.toggle}><input checked={configuration.showPhone} type="checkbox" onChange={(event) => update("showPhone", event.target.checked)} /><span /> Show phone</label></div></div>
      <div className={styles.viewer}><CasePreview autoRotate={autoRotate} configuration={configuration} device={device} /></div>
      <footer className={styles.exportBar}><div className={styles.metrics}><span>Outer size<strong>{metrics.outerHeight.toFixed(1)} × {metrics.outerWidth.toFixed(1)} × {metrics.outerDepth.toFixed(1)} mm</strong></span><span>Est. shell volume<strong>{metrics.volumeEstimate.toFixed(1)} cm³</strong></span><span>Geometry<strong className={exportReady ? styles.valid : styles.warning}>{exportReady ? "Production validated" : "Preview only"}</strong></span></div><div className={styles.exportActions}>{notice && <small>{notice}</small>}{!notice && exportIssues[0] && <small>{exportIssues[0]}</small>}<button disabled={!exportReady} onClick={() => void exportStl()} type="button">Download validated STL <b>↓</b></button></div></footer>
    </div>
  </section>;
}
