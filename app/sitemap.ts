import type { MetadataRoute } from 'next';

const siteUrl = 'https://www.foresports.in';

const routes: MetadataRoute.Sitemap = [
  { url: siteUrl, priority: 1 },
  { url: `${siteUrl}/golfers`, priority: 0.9 },
  { url: `${siteUrl}/coaches`, priority: 0.9 },
  { url: `${siteUrl}/facilities`, priority: 0.9 },
  { url: `${siteUrl}/about`, priority: 0.8 },
  { url: `${siteUrl}/privacy`, priority: 0.2 },
  { url: `${siteUrl}/terms`, priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes;
}
