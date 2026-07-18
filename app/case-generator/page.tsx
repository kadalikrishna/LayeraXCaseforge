import dynamic from "next/dynamic";

const CaseForgeApp = dynamic(() => import("@/components/CaseForgeApp").then((module) => module.CaseForgeApp), { loading: () => <div className="boot">Forging your workspace…</div> });

export default async function CaseGeneratorPage({ searchParams }: { searchParams: Promise<{ company?: string; model?: string }> }) {
  const query = await searchParams;
  return <CaseForgeApp initialCompany={query.company} initialModel={query.model} />;
}
