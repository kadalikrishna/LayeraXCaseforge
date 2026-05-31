"use client";

import { useMemo, useState } from "react";
import type { CaseParameterKey, CaseParameters } from "@/lib/case-params";
import { caseParameterFields, defaultCaseParameters, getDerivedCaseDimensions } from "@/lib/case-params";
import { CasePreview } from "./CasePreview";
import styles from "./case-generator.module.css";

export function CaseGeneratorPage() {
  const [params, setParams] = useState<CaseParameters>(defaultCaseParameters);
  const dimensions = useMemo(() => getDerivedCaseDimensions(params), [params]);

  function updateParam(key: CaseParameterKey, value: number) {
    setParams((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className={styles.shell}>
      <section className={styles.controls}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Phase 1</p>
          <h1>Parametric Phone Case Generator</h1>
          <p>
            Generate a simple rounded rectangular case body from dimensions. No cutouts,
            uploads, accounts, or payments in this phase.
          </p>
        </div>

        <div className={styles.formGrid}>
          {caseParameterFields.map((field) => (
            <label className={styles.field} key={field.key}>
              <span>{field.label}</span>
              <div className={styles.inputRow}>
                <input
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  type="number"
                  value={params[field.key]}
                  onChange={(event) => updateParam(field.key, Number(event.target.value))}
                />
                <small>{field.suffix}</small>
              </div>
            </label>
          ))}
        </div>

        <div className={styles.summary}>
          <div>
            <span>Outer body</span>
            <strong>
              {dimensions.outerWidth.toFixed(1)} x {dimensions.outerHeight.toFixed(1)} x{" "}
              {dimensions.outerDepth.toFixed(1)} mm
            </strong>
          </div>
          <div>
            <span>Inner cavity</span>
            <strong>
              {dimensions.innerWidth.toFixed(1)} x {dimensions.innerHeight.toFixed(1)} x{" "}
              {dimensions.innerDepth.toFixed(1)} mm
            </strong>
          </div>
        </div>
      </section>

      <section className={styles.previewPanel}>
        <div className={styles.previewHeader}>
          <div>
            <h2>3D Preview</h2>
            <p>Drag to rotate. Scroll to zoom.</p>
          </div>
          <span>JSCAD + React Three Fiber</span>
        </div>
        <CasePreview params={params} />
      </section>
    </main>
  );
}
