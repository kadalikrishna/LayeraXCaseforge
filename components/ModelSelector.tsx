"use client";

import { useMemo, useState } from "react";
import type { DeviceCompany, DevicePreset } from "@/lib/types";
import { geometryStatusLabels } from "@/lib/release";
import { PhoneIllustration } from "./PhoneIllustration";
import styles from "./caseforge.module.css";

type ModelSelectorProps = { company: DeviceCompany; devices: DevicePreset[]; onBack: () => void; onSelect: (id: string) => void };

export function ModelSelector({ company, devices, onBack, onSelect }: ModelSelectorProps) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("all");
  const [year, setYear] = useState<number | "all">("all");
  const families = useMemo(() => [...new Set(devices.map((device) => device.family))].sort(), [devices]);
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return devices.filter((device) => (family === "all" || device.family === family) && (year === "all" || device.releaseYear === year) && (!term || [device.name, device.family, ...device.aliases].join(" ").toLocaleLowerCase().includes(term)));
  }, [devices, family, query, year]);

  return <section className={styles.selection}><button className={styles.back} onClick={onBack} type="button">← All companies</button><div className={styles.hero}><span className={styles.kicker}>{company.name} catalog</span><h1>Choose your exact model</h1><p>Choose a phone to start designing. Model-specific previews are available for Apple, Google and Samsung.</p></div><div className={styles.catalogSearch}><label className={styles.searchField}><span>Search {company.name}</span><input onChange={(event) => setQuery(event.target.value)} placeholder="Search model…" type="search" value={query} /></label><label><span>Family</span><select onChange={(event) => setFamily(event.target.value)} value={family}><option value="all">All families</option>{families.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Year</span><select onChange={(event) => setYear(event.target.value === "all" ? "all" : Number(event.target.value))} value={year}><option value="all">All years</option>{[2025, 2024, 2023, 2022].map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div><div className={styles.resultHeading}><strong>{filtered.length} available {filtered.length === 1 ? "model" : "models"}</strong></div>{filtered.length ? <div className={styles.modelGrid}>{filtered.map((device) => <button className={styles.modelCard} key={device.id} onClick={() => onSelect(device.id)} type="button"><PhoneIllustration device={device} /><div><span className={device.geometryStatus === "production-validated" ? styles.ready : styles.approximate}>● {geometryStatusLabels[device.geometryStatus]} · {device.releaseYear}</span><h2>{device.name}</h2><p>{device.height} × {device.width} × {device.thickness} mm</p></div><b>Forge this case →</b></button>)}</div> : <p className={styles.emptyState}>No models match these filters.</p>}</section>;
}

