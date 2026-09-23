import type { MetadataRoute } from 'next';

const routes: MetadataRoute.Sitemap = [
  { url: 'https://foresports.in/', priority: 1 },
  { url: 'https://foresports.in/golfers', priority: 0.9 },
  { url: 'https://foresports.in/coaches', priority: 0.9 },
  { url: 'https://foresports.in/facilities', priority: 0.9 },
  { url: 'https://foresports.in/about', priority: 0.8 },
  { url: 'https://foresports.in/privacy', priority: 0.2 },
  { url: 'https://foresports.in/terms', priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes;
}
