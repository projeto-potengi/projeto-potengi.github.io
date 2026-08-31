import type { Metadata } from "next";
import SiteHeader from "@/src/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Projeto Potengi | Portal e WebGIS",
  description: "Portal institucional e WebGIS estático do Projeto Rio Potengi."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
