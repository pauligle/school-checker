import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Primary Schools in England | Complete City Guide | SchoolChecker.io',
  description: 'Find the best primary schools across England. Comprehensive city-by-city guide covering Sheffield, Bradford, Bromley, Croydon, Rotherham, and more. School rankings, Ofsted ratings, and detailed information.',
  keywords: 'primary schools England, best schools England, school rankings England, Ofsted ratings England, England schools guide',
  openGraph: {
    title: 'Best Primary Schools in England | Complete City Guide',
    description: 'Find the best primary schools across England. Comprehensive city-by-city guide with rankings and Ofsted ratings.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Primary Schools in England | Complete City Guide',
    description: 'Find the best primary schools across England. Comprehensive city-by-city guide with rankings and Ofsted ratings.',
  },
}

interface CityData {
  city: string
  slug: string
  county: string
  region: string
  country: string
  totalSchools: number
  primarySchools: number
  secondarySchools: number
  postcodeCount: number
  postcodes: string[]
  pagesToCreate: {
    primary: boolean
    secondary: boolean
    all: boolean
  }
}

async function getCityData(): Promise<CityData[]> {
  try {
    const fs = require('fs')
    const path = require('path')
    
    // Load regular cities
    const cityListPath = path.join(process.cwd(), 'scripts', 'city-pages-to-create.json')
    const cityData = JSON.parse(fs.readFileSync(cityListPath, 'utf8'))
    
    // Load London postcode areas
    const londonListPath = path.join(process.cwd(), 'scripts', 'london-postcode-pages.json')
    let londonData: any[] = []
    try {
      londonData = JSON.parse(fs.readFileSync(londonListPath, 'utf8'))
    } catch (londonError) {
      console.log('London postcode data not found, skipping...')
    }
    
    // Convert London data to CityData format
    const londonCities: CityData[] = londonData.map((london: any) => ({
      city: london.name,
      county: 'London',
      region: 'London',
      primarySchools: london.primarySchools,
      secondarySchools: london.secondarySchools,
      totalSchools: london.totalSchools,
      postcodes: [london.postcode],
      pagesToCreate: {
        primary: london.primarySchools >= 10,
        secondary: london.secondarySchools >= 10,
        all: true
      }
    }))
    
    // Add London overview page
    const londonOverview: CityData = {
      city: 'London',
      county: 'London',
      region: 'London',
      primarySchools: londonData.reduce((sum: number, london: any) => sum + london.primarySchools, 0),
      secondarySchools: londonData.reduce((sum: number, london: any) => sum + london.secondarySchools, 0),
      totalSchools: londonData.reduce((sum: number, london: any) => sum + london.totalSchools, 0),
      postcodes: londonData.map((london: any) => london.postcode),
      pagesToCreate: {
        primary: true,
        secondary: true,
        all: true
      }
    }
    
    londonCities.unshift(londonOverview)
    
    // Combine and filter (only main London areas, not individual districts)
    const allCities = [...cityData, ...londonCities]
      .filter((city: CityData) => city.primarySchools > 0) // Only cities with at least 1 primary school
      .sort((a: CityData, b: CityData) => b.primarySchools - a.primarySchools) // Sort by primary school count
    
    return allCities
  } catch (error) {
    console.error('Error loading city data:', error)
    return []
  }
}

export default async function EnglandPage() {
  const cities = await getCityData()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl">
            {/* Breadcrumbs */}
            <nav className="mb-8">
              <div className="flex items-center space-x-2 text-sm">
                <Link href="/" className="text-gray-300 hover:text-white">Home</Link>
                <span className="text-gray-400">/</span>
                <span className="text-white font-medium">Best Primary Schools England</span>
              </div>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Best Primary Schools in England
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Comprehensive guide to the best primary schools across England. Find top-rated schools in your city with detailed rankings, Ofsted ratings, and school information.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-4xl">
          {/* London Areas Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              <Link 
                href="/best-primary-schools/london-overview"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                🏙️ London Primary Schools
              </Link>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cities.filter(city => city.county === 'London' && city.city !== 'London').map((city) => (
                <div key={city.city} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <Link 
                    href={`/best-primary-schools/${encodeURIComponent(city.city)}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {city.city}
                  </Link>
                  <span className="text-sm text-gray-500">{city.primarySchools} primary schools</span>
                </div>
              ))}
            </div>
          </div>

          {/* Other Cities Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🏫 Other Cities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cities.filter(city => city.county !== 'London').map((city) => (
                <div key={city.city} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <Link 
                    href={`/best-primary-schools/${encodeURIComponent(city.city)}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {city.city}
                  </Link>
                  <span className="text-sm text-gray-500">{city.primarySchools} primary schools</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
