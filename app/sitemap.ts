import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages = [
    {
      url: 'https://schoolchecker.io',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: 'https://schoolchecker.io/schools-near-me',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: 'https://schoolchecker.io/schools-in-london',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: 'https://schoolchecker.io/schools-in-manchester',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: 'https://schoolchecker.io/schools-in-birmingham',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: 'https://schoolchecker.io/schools-in-leeds',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: 'https://schoolchecker.io/schools-in-liverpool',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: 'https://schoolchecker.io/about',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: 'https://schoolchecker.io/schoolchecker-rating',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  try {
    // Fetch all schools from database
    const { data: schools, error } = await supabase
      .from('schools')
      .select('urn, establishmentname, lat, lon')
      .limit(50000) // Adjust based on your school count

    if (error) {
      console.error('Error fetching schools for sitemap:', error)
      return staticPages
    }

    // Generate school page URLs
    const schoolPages = schools?.map((school) => {
      // Create URL-friendly slug from school name and URN
      const slug = `${school.establishmentname.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim()}-${school.urn}`

      return {
        url: `https://schoolchecker.io/school/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }
    }) || []

    return [...staticPages, ...schoolPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
