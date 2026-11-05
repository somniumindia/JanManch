import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://janmanch.in';
  const currentDate = new Date().toISOString();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pulse`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/create`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];
}
