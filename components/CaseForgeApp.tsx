"use client";

import { useEffect, useRef, useState } from "react";
import { companies, devices } from "@/lib/catalog";
import { createProject, defaultConfiguration, restoreProject } from "@/lib/project";
import Image from "next/image";
import { getExportIssues } from "@/lib/release";
import { downloadStl, downloadProject } from "@/lib/export";
import type { CaseConfiguration, CompanyId } from "@/lib/types";
import { CompanySelector } from "./CompanySelector";
import { ModelSelector } from "./ModelSelector";
import { CaseEditor } from "./CaseEditor";
import styles from "./caseforge.module.css";

const storageKey = "layera-x-caseforge-project";
type CaseForgeAppProps = { initialCompany?: string; initialModel?: string };

export function CaseForgeApp({ initialCompany, initialModel }: CaseForgeAppProps) {
  const initialDevice = devices.find((item) => item.id === initialModel);
  const initialCompanyId = companies.find((item) => item.id === initialCompany)?.id;
  const [companyId, setCompanyId] = useState<CompanyId | null>(initialDevice?.companyId ?? initialCompanyId ?? null);
  const [deviceId, setDeviceId] = useState<string | null>(initialDevice?.id ?? null);
  const [configuration, setConfiguration] = useState<CaseConfiguration>(defaultConfiguration);
  const [notice, setNotice] = useState("");
  const [exporting, setExporting] = useState(false);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const selectedDevice = devices.find((item) => item.id === deviceId);

  useEffect(() => {
    const params = new URLSearchParams();
    if (companyId) params.set("company", companyId);
    if (deviceId) params.set("model", deviceId);
    window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
  }, [companyId, deviceId]);

  function selectDevice(id: string) {
    const device = devices.find((item) => item.id === id);
    if (!device) return;
    setCompanyId(device.companyId);
    setDeviceId(id);
    setConfiguration(defaultConfiguration);
    setNotice("");
  }
  function restore(value: unknown) {
    const restored = restoreProject(value);
    setCompanyId(restored.device.companyId);
    setDeviceId(restored.device.id);
    setConfiguration(restored.configuration);
  }
  function resume() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) { setNotice("No saved project yet. Choose a phone to start your first design."); return; }
      restore(JSON.parse(saved));
      setNotice("Saved project restored.");
    } catch { setNotice("Could not restore the saved project. Import a valid JSON project or start a new design."); }
  }
  function save() {
    if (!selectedDevice) return;
    try { localStorage.setItem(storageKey, JSON.stringify(createProject(selectedDevice, configuration))); setNotice("Project saved on this device. Use Resume saved project after reopening."); }
    catch { setNotice("Local storage is unavailable. Export JSON to keep your design."); }
  }
  function exportJson() {
    if (!selectedDevice) return;
    try { downloadProject(createProject(selectedDevice, configuration)); setNotice("Project JSON downloaded."); }
    catch { setNotice("Download failed. Please try again."); }
  }
  async function importFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw new Error("Too large");
      restore(JSON.parse(await file.text()));
      setNotice("Project imported with its phone model. Save locally to keep it on this device.");
    } catch { setNotice("Invalid project: use a supported Caseforge JSON file with a known phone model and valid settings."); }
  }
  async function exportStl() {
    if (!selectedDevice || exporting) return;
    setExporting(true);
    try { await downloadStl(selectedDevice, configuration); setNotice("Validated STL downloaded."); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Export failed."); }
    finally { setExporting(false); }
  }
  function closeMenu() { if (menuRef.current) menuRef.current.open = false; }
  function toggleTheme() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("layera-x-caseforge-theme", next); } catch { setNotice("Theme changed for this session. Local storage is unavailable."); }
  }
  return (
    <main className={styles.app}>
      <header className={styles.topbar}>
        <button className={styles.brand} onClick={() => { setCompanyId(null); setDeviceId(null); }} type="button" aria-label="Layera Caseforge home"><Image src="/brand/layera.svg" alt="Layera" width={92} height={36} priority /><span>CASEFORGE</span></button>
        <nav className={styles.steps} aria-label="Design progress"><span className={!companyId ? styles.active : ""}>01 Discover</span><span className={companyId && !deviceId ? styles.active : ""}>02 Select</span><span className={deviceId ? styles.active : ""}>03 Create</span></nav>
        <div className={styles.topActions}>
          <details ref={menuRef} className={styles.projectMenu}><summary>Project <span>⌄</span></summary><div>
            <button onClick={() => { resume(); closeMenu(); }} type="button">Resume saved project</button>
            <button onClick={() => { importRef.current?.click(); closeMenu(); }} type="button">Import JSON</button>
            {selectedDevice && <><button onClick={() => { exportJson(); closeMenu(); }} type="button">Export JSON</button><button disabled={exporting || getExportIssues(selectedDevice, configuration).length > 0} onClick={() => { void exportStl(); closeMenu(); }} type="button">{exporting ? "Preparing STL…" : "Download validated STL"}</button><p>{getExportIssues(selectedDevice, configuration)[0] ?? "This model is released for production."}</p></>}
          </div></details>
          {selectedDevice && <><button className={styles.saveButton} onClick={save} type="button">Save</button><button className={styles.primaryButton} onClick={exportJson} type="button">Export <span>↗</span></button></>}
          <button aria-label="Toggle color theme" className={styles.themeToggle} onClick={toggleTheme} type="button">◐</button>
        </div>
      </header>
      <input ref={importRef} hidden accept=".json,application/json" type="file" aria-label="Import project file" onChange={(event) => { void importFile(event.target.files?.[0]); event.target.value = ""; }} />
      {notice && <div className={styles.notice} role="status">{notice}<button aria-label="Dismiss notification" onClick={() => setNotice("")} type="button">×</button></div>}
      {!companyId && <CompanySelector companies={companies} devices={devices} onSelect={(id) => { setCompanyId(id); setDeviceId(null); }} onSelectDevice={selectDevice} />}
      {companyId && !selectedDevice && <ModelSelector company={companies.find((item) => item.id === companyId)!} devices={devices.filter((item) => item.companyId === companyId)} onBack={() => setCompanyId(null)} onSelect={selectDevice} />}
      {selectedDevice && <CaseEditor key={selectedDevice.id} configuration={configuration} device={selectedDevice} onBack={() => setDeviceId(null)} onChange={setConfiguration} />}
    </main>
  );
}

