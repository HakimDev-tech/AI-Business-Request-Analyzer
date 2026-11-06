import type { MetadataRoute } from "next";

const siteUrl = (process.env.APP_URL || "https://ai-business-request-analyzer.vercel.app").replace(/\/+$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl + "/product",
      lastModified: new Date("2026-11-06T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
