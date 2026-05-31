import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Laryera Case Generator",
  description: "Phase 1 parametric phone case generator",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
