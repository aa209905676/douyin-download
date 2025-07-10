import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://douyin-downloader.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: ['/ads.txt', '/'],
        disallow: ['/api/', '/_next/', '/admin/'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
