import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope, Newsreader } from "next/font/google";
import { WorkspaceShell } from "@/components/workspace-shell";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});
const editorial = Newsreader({
  variable: "--font-editorial",
  subsets: ["latin"],
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "https://ai-business-request-analyzer.vercel.app"),
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
  themeColor: "#193738",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${editorial.variable} ${plexMono.variable} antialiased`}>
        <WorkspaceShell>{children}</WorkspaceShell>
      </body>
    </html>
  );
}