import type { DevicePreset } from "@/lib/types";

export function PhoneIllustration({ device, color = "#dad8d2" }: { device: DevicePreset; color?: string }) {
  const regions = device.profile?.openings ?? [{ ...device.camera, shape: "rounded-rect" as const, role: "island" as const }];
  const w = device.width + 5, h = device.height + 5;
  return <svg viewBox={`-5 -5 ${w + 10} ${h + 10}`} role="img" aria-label={`${device.name} rear case outline`}>
    <rect x="0" y="0" width={w} height={h} rx={device.cornerRadius + 2} fill={color} stroke="#11111130" strokeWidth=".6" />
    <rect x="1.4" y="1.4" width={w - 2.8} height={h - 2.8} rx={device.cornerRadius + 1} fill="none" stroke="#ffffff65" strokeWidth=".7" />
    {regions.map((region, index) => region.shape === "circle" ? <circle key={index} cx={w / 2 - region.x} cy={h / 2 - region.y} r={region.radius + .8} fill="#24262b" stroke="#ffffff80" strokeWidth=".8" /> : <rect key={index} x={w / 2 - region.x - region.width / 2} y={h / 2 - region.y - region.height / 2} width={region.width} height={region.height} rx={region.radius} fill="#24262b" stroke="#ffffff80" strokeWidth=".8" />)}
    <text x={w / 2} y={h * .71} textAnchor="middle" fontSize="5" letterSpacing="1" fill="#11111145">LAYERA</text>
  </svg>;
}
