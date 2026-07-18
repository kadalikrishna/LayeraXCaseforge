"use client";

import { useEffect, useMemo, useState } from "react";
import { companies, devices, getDevice } from "@/lib/catalog";
import { defaultConfiguration } from "@/lib/project";
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

  useEffect(() => {
    const params = new URLSearchParams();
    if (companyId) params.set("company", companyId);
    if (deviceId) params.set("model", deviceId);
    window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`);
  }, [companyId, deviceId]);

  const selectedDevice = useMemo(() => deviceId ? getDevice(deviceId) : null, [deviceId]);

  function selectCompany(id: CompanyId) { setCompanyId(id); setDeviceId(null); }
  function selectDevice(id: string) {
    const device = devices.find((item) => item.id === id);
    if (!device) return;
    setCompanyId(device.companyId);
    setDeviceId(id);
    setConfiguration(defaultConfiguration);
  }
  function toggleTheme() { const root = document.documentElement; const next = root.dataset.theme === "dark" ? "light" : "dark"; root.dataset.theme = next; localStorage.setItem("layera-x-caseforge-theme", next); }

  return (
    <main className={styles.app}>
      <header className={styles.topbar}>
        <button className={styles.brand} onClick={() => { setCompanyId(null); setDeviceId(null); }} type="button"><span>LX</span><strong>Layera X Caseforge</strong></button>
        <div className={styles.steps} aria-label="Design progress"><span className={!companyId ? styles.active : ""}>01 Company</span><span className={companyId && !deviceId ? styles.active : ""}>02 Model</span><span className={deviceId ? styles.active : ""}>03 Forge</span></div>
        <div className={styles.topActions}><button aria-label="Toggle color theme" className={styles.themeToggle} onClick={toggleTheme} title="Toggle color theme" type="button"><span className={styles.sun}>☀</span><span className={styles.moon}>☾</span></button><span className={styles.status}><i /> Local workspace</span></div>
      </header>
      {!companyId && <CompanySelector companies={companies} devices={devices} onSelect={selectCompany} onSelectDevice={selectDevice} />}
      {companyId && !selectedDevice && <ModelSelector company={companies.find((item) => item.id === companyId)!} devices={devices.filter((item) => item.companyId === companyId)} onBack={() => setCompanyId(null)} onSelect={selectDevice} />}
      {selectedDevice && <CaseEditor configuration={configuration} device={selectedDevice} onBack={() => setDeviceId(null)} onChange={setConfiguration} storageKey={storageKey} />}
    </main>
  );
}
