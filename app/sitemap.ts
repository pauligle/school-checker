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
      url: 'https://schoolchecker.io/best-primary-schools',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: 'https://schoolchecker.io/best-primary-schools-england',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: 'https://schoolchecker.io/best-primary-schools/london',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
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
    {
      url: 'https://schoolchecker.io/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: 'https://schoolchecker.io/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: 'https://schoolchecker.io/how-school-rankings-work',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: 'https://schoolchecker.io/best-secondary-schools',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: 'https://schoolchecker.io/best-nurseries',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: 'https://schoolchecker.io/privacy',
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: 'https://schoolchecker.io/terms',
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: 'https://schoolchecker.io/help',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ]

  try {
    // Load city data for city pages
    const fs = require('fs')
    const path = require('path')
    
    let cityPages: MetadataRoute.Sitemap = []
    try {
      // Load regular cities
      const cityListPath = path.join(process.cwd(), 'scripts', 'city-pages-to-create.json')
      const cityData = JSON.parse(fs.readFileSync(cityListPath, 'utf8'))
      
      // Load London postcode areas
      const londonListPath = path.join(process.cwd(), 'scripts', 'london-postcode-pages.json')
      let londonData: any[] = []
      try {
        londonData = JSON.parse(fs.readFileSync(londonListPath, 'utf8'))
      } catch (londonError) {
        console.log('London postcode data not found for sitemap, skipping...')
      }
      
      // Convert London data to city format
      const londonCities = londonData.map((london: any) => ({
        city: london.name,
        primarySchools: london.primarySchools
      }))
      
      // Load London districts
      const londonDistrictsPath = path.join(process.cwd(), 'scripts', 'london-districts-pages.json')
      let londonDistrictsData: any[] = []
      try {
        londonDistrictsData = JSON.parse(fs.readFileSync(londonDistrictsPath, 'utf8'))
      } catch (londonDistrictsError) {
        console.log('London districts data not found for sitemap, skipping...')
      }
      
      // Convert London districts to city format
      const londonDistrictsCities = londonDistrictsData.map((district: any) => ({
        city: district.name,
        primarySchools: district.primarySchools
      }))
      
      // Add London overview
      const londonOverview = {
        city: 'London',
        primarySchools: londonData.reduce((sum: number, london: any) => sum + london.primarySchools, 0)
      }
      
      // Add specific London area pages that should always be included
      const londonAreaPages = [
        { city: 'East London', primarySchools: 1000 },
        { city: 'North London', primarySchools: 1000 },
        { city: 'South London', primarySchools: 1000 },
        { city: 'West London', primarySchools: 1000 },
        { city: 'South East London', primarySchools: 1000 },
        { city: 'South West London', primarySchools: 1000 },
        { city: 'North West London', primarySchools: 1000 },
        { city: 'North East London', primarySchools: 1000 },
        { city: 'Central London', primarySchools: 1000 },
      ]
      
      // Combine all cities
      const allCities = [...cityData, ...londonCities, ...londonDistrictsCities, ...londonAreaPages, londonOverview]
      
      cityPages = allCities
        .filter((city: any) => city.primarySchools >= 5) // Include cities with 5+ primary schools
        .map((city: any) => {
          // Create URL-friendly slug
          const citySlug = city.city.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .trim()
          
          // Determine priority based on school count and city type
          let priority = 0.7
          if (city.primarySchools >= 1000) priority = 0.9
          else if (city.primarySchools >= 500) priority = 0.8
          else if (city.primarySchools >= 100) priority = 0.7
          else if (city.primarySchools >= 50) priority = 0.6
          else priority = 0.5
          
          // Boost priority for major cities and London areas
          if (city.city === 'London' || city.city.includes('London')) {
            priority = Math.max(priority, 0.9)
          }
          
          return {
            url: `https://schoolchecker.io/best-primary-schools/${citySlug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority,
          }
        })
    } catch (cityError) {
      console.error('Error loading city data for sitemap:', cityError)
    }

    // Load Local Authority data for LA pages
    let laPages: MetadataRoute.Sitemap = []
    try {
      const laListPath = path.join(process.cwd(), 'scripts', 'la-pages.json')
      const laData = JSON.parse(fs.readFileSync(laListPath, 'utf8'))
      
      laPages = laData.map((la: any) => ({
        url: `https://schoolchecker.io${la.url}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8, // High priority for Local Authority pages
      }))
    } catch (laError) {
      console.error('Error loading Local Authority data for sitemap:', laError)
    }

    // Fetch all schools from database
    const { data: schools, error } = await supabase
      .from('schools')
      .select('urn, establishmentname, lat, lon')
      .limit(50000) // Adjust based on your school count

    if (error) {
      console.error('Error fetching schools for sitemap:', error)
      return [...staticPages, ...cityPages]
    }

    // Function to create school slug (same logic as used in pages)
    const createSchoolSlug = (schoolName: string, urn: string) => {
      const nameSlug = schoolName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim()
      return `${nameSlug}-${urn}`
    }

    // Generate school page URLs with proper slugs
    const schoolPages = schools?.map((school) => {
      const slug = createSchoolSlug(school.establishmentname, school.urn)
      return {
        url: `https://schoolchecker.io/school/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }
    }) || []

    return [...staticPages, ...cityPages, ...laPages, ...schoolPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
