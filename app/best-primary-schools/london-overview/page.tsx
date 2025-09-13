import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import fs from 'fs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface LondonAreaData {
  area: string
  areaPostcode: string
  totalSchools: number
  primarySchools: number
  secondarySchools: number
  districts: Array<{
    postcode: string
    name: string
    primarySchools: number
    totalSchools: number
  }>
}

async function getLondonData(): Promise<LondonAreaData[]> {
  try {
    // Load London districts data
    const districtsPath = path.join(process.cwd(), 'scripts', 'london-districts-pages.json')
    const districtsData = JSON.parse(fs.readFileSync(districtsPath, 'utf8'))
    
    // Group districts by area
    const areas: { [key: string]: LondonAreaData } = {}
    
    districtsData.forEach((district: any) => {
      if (!areas[district.area]) {
        areas[district.area] = {
          area: district.area,
          areaPostcode: district.areaPostcode,
          totalSchools: 0,
          primarySchools: 0,
          secondarySchools: 0,
          districts: []
        }
      }
      
      areas[district.area].totalSchools += district.totalSchools
      areas[district.area].primarySchools += district.primarySchools
      areas[district.area].secondarySchools += district.secondarySchools
      
      if (district.primarySchools > 0) {
        areas[district.area].districts.push({
          postcode: district.postcode,
          name: district.name,
          primarySchools: district.primarySchools,
          totalSchools: district.totalSchools
        })
      }
    })
    
    // Sort districts within each area by primary school count
    Object.values(areas).forEach(area => {
      area.districts.sort((a, b) => b.primarySchools - a.primarySchools)
    })
    
    // Sort areas by total primary schools
    return Object.values(areas).sort((a, b) => b.primarySchools - a.primarySchools)
  } catch (error) {
    console.error('Error loading London data:', error)
    return []
  }
}

export const metadata: Metadata = {
  title: 'Best Primary Schools in London | SchoolChecker.io',
  description: 'Find the best primary schools across all London areas. Comprehensive rankings, Ofsted ratings, and detailed information for primary schools in every London postcode district.',
  keywords: 'primary schools London, best schools London, school rankings London, Ofsted ratings London, London schools, London postcodes',
  openGraph: {
    title: 'Best Primary Schools in London',
    description: 'Find the best primary schools across all London areas. Comprehensive rankings and Ofsted ratings.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Primary Schools in London',
    description: 'Find the best primary schools across all London areas. Comprehensive rankings and Ofsted ratings.',
  },
}

export default async function LondonPage() {
  const londonAreas = await getLondonData()
  const totalPrimarySchools = londonAreas.reduce((sum, area) => sum + area.primarySchools, 0)
  const totalSchools = londonAreas.reduce((sum, area) => sum + area.totalSchools, 0)
  
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
                <Link href="/best-primary-schools-england" className="text-gray-300 hover:text-white">Best Primary Schools</Link>
                <span className="text-gray-400">/</span>
                <span className="text-white font-medium">London</span>
              </div>
            </nav>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Best Primary Schools in London
            </h1>
            <p className="text-xl text-gray-300">
              Discover the best primary schools across all London areas. From North London to South London, find comprehensive rankings, Ofsted ratings, and detailed information for primary schools in every London postcode district.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-6xl">
          {/* London Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {londonAreas.map((area) => (
              <div key={area.area} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  <Link 
                    href={`/best-primary-schools/${encodeURIComponent(area.area)}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {area.area}
                  </Link>
                </h3>
                <p className="text-gray-600 text-sm mb-4">London, England</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Primary Schools:</span>
                    <span className="font-medium text-gray-900">{area.primarySchools}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Schools:</span>
                    <span className="font-medium text-gray-900">{area.totalSchools}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Districts:</span>
                    <span className="font-medium text-gray-900">{area.districts.length}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link 
                    href={`/best-primary-schools/${encodeURIComponent(area.area)}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                  >
                    View Schools in {area.area} →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Top Districts Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Top London Districts by Primary School Count</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {londonAreas.flatMap(area => area.districts.slice(0, 3)).slice(0, 12).map((district, index) => (
                <div key={`${district.postcode}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Link 
                      href={`/best-primary-schools/${encodeURIComponent(district.name)}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      {district.name}
                    </Link>
                    <p className="text-sm text-gray-500">{district.postcode}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{district.primarySchools}</p>
                    <p className="text-sm text-gray-500">primary schools</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">London School Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{londonAreas.length}</div>
                <div className="text-sm text-gray-600">London Areas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{londonAreas.reduce((sum, area) => sum + area.districts.length, 0)}</div>
                <div className="text-sm text-gray-600">Districts with Schools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalPrimarySchools.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Primary Schools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalSchools.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Schools</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
