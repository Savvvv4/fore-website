import type { MetadataRoute } from 'next';

const routes = ['', '/golfers', '/coaches', '/facilities', '/about', '/privacy', '/terms'];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({ url: `https://foresports.in${route || '/'}`, changeFrequency: 'monthly', priority: route ? 0.8 : 1 }));
}
