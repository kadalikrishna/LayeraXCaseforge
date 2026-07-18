"use client";

import { useMemo, useState } from "react";
import { searchDevices } from "@/lib/catalog";
import { geometryStatusLabels } from "@/lib/release";
import type { CompanyId, DeviceCompany, DevicePreset } from "@/lib/types";
import { CompanyLogo } from "./CompanyLogo";
import styles from "./caseforge.module.css";

type CompanySelectorProps = {
  companies: DeviceCompany[];
  devices: DevicePreset[];
  onSelect: (id: CompanyId) => void;
  onSelectDevice: (id: string) => void;
};

export function CompanySelector({ companies, devices, onSelect, onSelectDevice }: CompanySelectorProps) {
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState<CompanyId | "all">("all");
  const [year, setYear] = useState<number | "all">("all");
  const results = useMemo(() => searchDevices(query, company, year), [company, query, year]);
  const filtering = query.trim().length > 0 || company !== "all" || year !== "all";

  return (
    <section className={styles.selection}>
      <div className={styles.hero}><span className={styles.kicker}>Start your build</span><h1>Find your exact phone</h1><p>Search four years of case-ready models, or browse by company.</p></div>
      <div className={styles.catalogSearch}>
        <label className={styles.searchField}><span>Search model</span><input autoComplete="off" onChange={(event) => setQuery(event.target.value)} placeholder="Try iPhone 15 Pro, Pixel 9, Galaxy S24…" type="search" value={query} /></label>
        <label><span>Company</span><select onChange={(event) => setCompany(event.target.value as CompanyId | "all")} value={company}><option value="all">All companies</option>{companies.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label><span>Year</span><select onChange={(event) => setYear(event.target.value === "all" ? "all" : Number(event.target.value))} value={year}><option value="all">All years</option>{[2025, 2024, 2023, 2022].map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      </div>
      {filtering && <div className={styles.searchResults}><div className={styles.resultHeading}><strong>{results.length} compatible {results.length === 1 ? "model" : "models"}</strong><button onClick={() => { setQuery(""); setCompany("all"); setYear("all"); }} type="button">Clear filters</button></div>{results.length ? <div className={styles.compactModelGrid}>{results.map((device) => <button key={device.id} onClick={() => onSelectDevice(device.id)} type="button"><CompanyLogo companyId={device.companyId} /><span><small>{device.releaseYear} · {geometryStatusLabels[device.geometryStatus]}</small><strong>{device.name}</strong></span><b>Forge →</b></button>)}</div> : <p className={styles.emptyState}>No matching case geometry. Try a broader model name or clear a filter.</p>}</div>}
      {!filtering && <div className={styles.companyGrid}>{companies.map((item) => <button className={styles.companyCard} key={item.id} onClick={() => onSelect(item.id)} type="button"><CompanyLogo className={styles.companyLogo} companyId={item.logo} /><strong>{item.name}</strong><small>{devices.filter((device) => device.companyId === item.id).length} models →</small></button>)}</div>}
    </section>
  );
}
