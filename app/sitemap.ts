import type { MetadataRoute } from 'next';
import { getApprovedCoaches } from '../src/coach/data';

const siteUrl = 'https://www.foresports.in';

const routes: MetadataRoute.Sitemap = [
  { url: siteUrl, priority: 1 },
  { url: `${siteUrl}/golfers`, priority: 0.9 },
  { url: `${siteUrl}/coaches`, priority: 0.9 },
  { url: `${siteUrl}/coaches/teaching`, priority: 0.9 },
  { url: `${siteUrl}/coaches/performance`, priority: 0.9 },
  { url: `${siteUrl}/coaches/directory`, priority: 0.8 },
  { url: `${siteUrl}/coaches/teaching/join`, priority: 0.7 },
  { url: `${siteUrl}/coaches/performance/join`, priority: 0.7 },
  { url: `${siteUrl}/facilities`, priority: 0.9 },
  { url: `${siteUrl}/about`, priority: 0.8 },
  { url: `${siteUrl}/privacy`, priority: 0.2 },
  { url: `${siteUrl}/terms`, priority: 0.2 },
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { coaches } = await getApprovedCoaches();
  return [...routes, ...coaches.map((c) => ({ url: `${siteUrl}/coaches/directory/${c.slug}`, priority: 0.6 }))];
}
