import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/*?school=', '/*?filter='],
    },
    sitemap: 'https://schoolchecker.io/sitemap.xml',
  }
}
