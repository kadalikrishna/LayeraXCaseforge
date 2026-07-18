import { siApple, siGoogle, siMotorola, siOneplus, siOppo, siSamsung, siVivo, siXiaomi } from "simple-icons";
import type { CompanyId } from "@/lib/types";

const logos: Partial<Record<CompanyId, { path: string; title: string }>> = {
  apple: siApple, samsung: siSamsung, google: siGoogle, oneplus: siOneplus, xiaomi: siXiaomi,
  motorola: siMotorola, oppo: siOppo, vivo: siVivo,
};

type CompanyLogoProps = { companyId: CompanyId; className?: string };

export function CompanyLogo({ companyId, className }: CompanyLogoProps) {
  const logo = logos[companyId];
  if (logo) return <svg aria-hidden="true" className={className} viewBox="0 0 24 24"><path d={logo.path} fill="currentColor" /></svg>;
  return <svg aria-hidden="true" className={className} viewBox="0 0 120 30"><text fill="currentColor" fontFamily="Arial, sans-serif" fontSize={companyId === "nothing" ? 18 : 24} fontWeight="800" letterSpacing={companyId === "nothing" ? 3 : -1} x="60" y="22" textAnchor="middle">{companyId === "nothing" ? "NOTHING" : "realme"}</text></svg>;
}
