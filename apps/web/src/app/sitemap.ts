import type { MetadataRoute } from 'next';
import { publicPages } from '@/config/navigation';
import { siteConfig } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${siteConfig.legal.updated}T00:00:00Z`);
  return publicPages.map(({ path, priority }) => ({
    url: `${siteConfig.url}${path === '/' ? '' : path}`,
    lastModified,
    priority,
  }));
}
