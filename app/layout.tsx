import type { Metadata } from "next";
import "./globals.css";

const themeScript = `(function(){try{var saved=localStorage.getItem("layera-x-caseforge-theme");document.documentElement.dataset.theme=saved==="dark"?"dark":"light"}catch(e){}})()`;
export const metadata: Metadata = {
  title: "Layera X Caseforge — Design studio",
  description: "Customize a phone case in a live 3D design studio. Save and share your design locally.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="light" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body>{children}</body></html>;
}

