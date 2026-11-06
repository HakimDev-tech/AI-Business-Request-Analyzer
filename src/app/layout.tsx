import type { Metadata, Viewport } from "next";
import { DM_Sans, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { WorkspaceShell } from "@/components/workspace-shell";
import "./globals.css";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], display: "swap" });
const space = Space_Grotesk({ variable: "--font-space", subsets: ["latin"], display: "swap" });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

export const metadata: Metadata = {
  applicationName: "Veyra",
  title: { default: "Veyra — Commercial operations intelligence", template: "%s · Veyra" },
  description: "A commercial operations workspace for B2B request analysis, product matching, inventory checks and searchable business knowledge.",
  keywords: ["B2B request analysis", "procurement operations", "catalog intelligence", "commercial workflow", "inventory verification"],
  category: "business",
  openGraph: {
    type: "website",
    siteName: "Veyra",
    title: "Veyra — Commercial operations intelligence",
    description: "Convert customer requests into structured requirements and evidence-backed commercial decisions.",
  },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#171923",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${space.variable} ${plexMono.variable} antialiased`}>
        <WorkspaceShell>{children}</WorkspaceShell>
      </body>
    </html>
  );
}