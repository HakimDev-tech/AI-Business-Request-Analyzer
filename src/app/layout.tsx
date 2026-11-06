import type { Metadata, Viewport } from "next";
import { Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
const plex = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  applicationName: "Veyra",
  title: {
    default: "Veyra — Commercial intelligence workspace",
    template: "%s · Veyra",
  },
  description:
    "A structured workspace for B2B request analysis, product intelligence, document retrieval and evidence-based commercial decisions.",
  keywords: [
    "B2B request analysis",
    "procurement intelligence",
    "AI request extraction",
    "catalog search",
    "inventory verification",
    "commercial operations",
  ],
  category: "business",
  openGraph: {
    type: "website",
    siteName: "Veyra",
    title: "Veyra — Commercial intelligence workspace",
    description:
      "Turn unstructured B2B requests into traceable requirements and evidence-based decisions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veyra — Commercial intelligence workspace",
    description:
      "Structured B2B request analysis, catalog intelligence and operational checks.",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#18241f",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${instrument.variable} ${plex.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}