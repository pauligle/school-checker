import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import ClientSchoolsMap from '@/components/ClientSchoolsMap'
import SortableSchoolsTable from '@/components/SortableSchoolsTable'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SchoolData {
  id: string
  establishmentname: string
  urn: string
  la__name_: string
  typeofestablishment__name_: string
  numberofpupils: number
  postcode: string | null
  lat: number | null
  lon: number | null
  phaseofeducation__name_: string
  statutorylowage: number | null
  statutoryhighage: number | null
  religiouscharacter__name_: string | null
  inspectionOutcome?: number | null
}

interface LocationData {
  location: string
  totalSchools: number
  outstandingSchools: number
  goodSchools: number
  requiresImprovementSchools: number
  inadequateSchools: number
  averagePupils: number
}

// Helper function to convert LA name to slug
function createLASlug(laName: string): string {
  return laName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

// Helper function to convert slug back to LA name
function slugToLAName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

async function getLocationData(laName: string): Promise<LocationData> {
  // Get all primary schools in the specified Local Authority with inspection data
  const { data: schools, error } = await supabase
    .from('schools')
    .select(`
      numberofpupils,
      urn,
      establishmentname,
      statutorylowage,
      statutoryhighage
    `)
    .in('phaseofeducation__name_', ['Primary', 'All-through'])
    .eq('la__name_', laName)
    .not('lat', 'is', null)
    .not('lon', 'is', null)
    .not('statutorylowage', 'is', null)
    .not('statutoryhighage', 'is', null)

  if (error) {
    console.error(`Error fetching ${laName} location data:`, error)
    return {
      location: laName,
      totalSchools: 0,
      outstandingSchools: 0,
      goodSchools: 0,
      requiresImprovementSchools: 0,
      inadequateSchools: 0,
      averagePupils: 0
    }
  }

  if (!schools || schools.length === 0) {
    return {
      location: laName,
      totalSchools: 0,
      outstandingSchools: 0,
      goodSchools: 0,
      requiresImprovementSchools: 0,
      inadequateSchools: 0,
      averagePupils: 0
    }
  }

  // Filter out nursery age ranges that don't have KS2 data
  const excludedAgeRanges = ['0-5', '2-4', '2-5', '2-7', '3-5', '3-7', '5-7']
  const filteredSchools = schools.filter(school => {
    if (!school.statutorylowage || !school.statutoryhighage) return false
    const ageRange = `${school.statutorylowage}-${school.statutoryhighage}`
    return !excludedAgeRanges.includes(ageRange)
  })

  const totalSchools = filteredSchools.length
  const averagePupils = totalSchools > 0 ? Math.round(filteredSchools.reduce((sum, s) => sum + (s.numberofpupils || 0), 0) / totalSchools) : 0

  // Get inspection data for schools in this LA
  const schoolUrns = filteredSchools.map(s => s.urn).filter(Boolean)
  let outstandingSchools = 0
  let goodSchools = 0
  let requiresImprovementSchools = 0
  let inadequateSchools = 0

  if (schoolUrns.length > 0) {
    const { data: inspections, error: inspectionError } = await supabase
      .from('inspections')
      .select('urn, outcome')
      .in('urn', schoolUrns)

    if (!inspectionError && inspections) {
      outstandingSchools = inspections.filter(i => i.outcome === 1).length
      goodSchools = inspections.filter(i => i.outcome === 2).length
      requiresImprovementSchools = inspections.filter(i => i.outcome === 3).length
      inadequateSchools = inspections.filter(i => i.outcome === 4).length
    }
  }

  return {
    location: laName,
    totalSchools,
    outstandingSchools,
    goodSchools,
    requiresImprovementSchools,
    inadequateSchools,
    averagePupils
  }
}

async function getPrimarySchools(laName: string): Promise<SchoolData[]> {
  // Get primary schools in the specified Local Authority with inspection data
  const { data: schools, error } = await supabase
    .from('schools')
    .select(`
      id,
      establishmentname,
      urn,
      la__name_,
      typeofestablishment__name_,
      numberofpupils,
      postcode,
      lat,
      lon,
      phaseofeducation__name_,
      statutorylowage,
      statutoryhighage
    `)
    .in('phaseofeducation__name_', ['Primary', 'All-through'])
    .eq('la__name_', laName)
    .not('lat', 'is', null)
    .not('lon', 'is', null)
    .not('statutorylowage', 'is', null)
    .not('statutoryhighage', 'is', null)
    .order('establishmentname', { ascending: true })

  if (error) {
    console.error(`Error fetching ${laName} schools:`, error)
    return []
  }

  if (!schools || schools.length === 0) {
    return []
  }

  // Filter out nursery age ranges that don't have KS2 data
  const excludedAgeRanges = ['0-5', '2-4', '2-5', '2-7', '3-5', '3-7', '5-7']
  const filteredSchools = schools.filter(school => {
    if (!school.statutorylowage || !school.statutoryhighage) return false
    const ageRange = `${school.statutorylowage}-${school.statutoryhighage}`
    return !excludedAgeRanges.includes(ageRange)
  })

  if (filteredSchools.length === 0) {
    return []
  }

  // Get inspection data for these schools
  const schoolUrns = filteredSchools.map(s => s.urn).filter(Boolean)
  let inspections: any[] = []

  if (schoolUrns.length > 0) {
    const { data: inspectionData, error: inspectionError } = await supabase
      .from('inspections')
      .select('urn, outcome')
      .in('urn', schoolUrns)

    if (!inspectionError && inspectionData) {
      inspections = inspectionData
    }
  }

  // Create a map of URN to inspection outcome for quick lookup
  const inspectionMap = new Map(inspections.map(i => [i.urn, i.outcome]))

  // Add inspection data to schools
  return filteredSchools.map(school => ({
    ...school,
    religiouscharacter__name_: null, // Default value since not available in source data
    inspectionOutcome: inspectionMap.get(school.urn) || null
  }))
}


async function getInspections(laName: string): Promise<{ [urn: string]: any }> {
  // Get inspections for schools in the specified Local Authority
  const schools = await getPrimarySchools(laName)
  const schoolUrns = schools.map(s => s.urn).filter(Boolean)
  
  if (schoolUrns.length === 0) {
    return {}
  }

  const { data: inspections, error } = await supabase
    .from('inspections')
    .select(`
      urn,
      outcome,
      quality_of_education,
      effectiveness_of_leadership,
      behaviour_and_attitudes,
      personal_development
    `)
    .in('urn', schoolUrns)

  if (error) {
    console.error(`Error fetching ${laName} inspections:`, error)
    return {}
  }

  // Convert to object keyed by URN
  const inspectionsMap: { [urn: string]: any } = {}
  inspections?.forEach(inspection => {
    inspectionsMap[inspection.urn] = inspection
  })

  return inspectionsMap
}

async function getRankings(laName: string): Promise<{ [urn: string]: { rwm_rank: number } }> {
  // Get rankings for schools in the specified Local Authority
  const schools = await getPrimarySchools(laName)
  const schoolUrns = schools.map(s => s.urn).filter(Boolean)
  
  if (schoolUrns.length === 0) {
    return {}
  }

  const { data: rankings, error } = await supabase
    .from('school_rankings')
    .select('urn, rwm_rank')
    .in('urn', schoolUrns)
    .eq('data_year', 2024) // Use latest year

  if (error) {
    console.error(`Error fetching ${laName} rankings:`, error)
    return {}
  }

  // Convert to object keyed by URN
  const rankingsMap: { [urn: string]: { rwm_rank: number } } = {}
  rankings?.forEach(ranking => {
    rankingsMap[ranking.urn] = { rwm_rank: ranking.rwm_rank }
  })

  return rankingsMap
}

async function getLocalRankings(laName: string): Promise<{ [urn: string]: { la_rank: number } }> {
  // Get local rankings for schools in the specified Local Authority
  const schools = await getPrimarySchools(laName)
  const schoolUrns = schools.map(s => s.urn).filter(Boolean)
  
  if (schoolUrns.length === 0) {
    return {}
  }

  // Get LA code for this LA name
  const { data: laData, error: laError } = await supabase
    .from('la_averages')
    .select('lea_code')
    .eq('lea_name', laName)
    .eq('data_year', 2024)
    .single()

  if (laError || !laData) {
    console.error(`Error fetching LA code for ${laName}:`, laError)
    return {}
  }

  const leaCode = laData.lea_code

  // Get all schools in this LA with their KS2 results
  const { data: laSchools, error: schoolsError } = await supabase
    .from('primary_results')
    .select('urn, rwm_exp_2024, rwm_high_2024, gps_exp_2024, gps_high_2024')
    .eq('lea_code', leaCode)
    .eq('data_year', 2024)
    .in('urn', schoolUrns)
    .not('rwm_exp_2024', 'is', null)

  if (schoolsError) {
    console.error(`Error fetching ${laName} schools for ranking:`, schoolsError)
    return {}
  }

  if (!laSchools || laSchools.length === 0) {
    return {}
  }

  // Sort schools using the same methodology as national rankings
  laSchools.sort((a, b) => {
    const aExpected = a.rwm_exp_2024 || 0
    const bExpected = b.rwm_exp_2024 || 0
    const aHigher = a.rwm_high_2024 || 0
    const bHigher = b.rwm_high_2024 || 0
    
    // 1. Primary: RWM Expected percentage (descending)
    if (bExpected !== aExpected) {
      return bExpected - aExpected
    }
    
    // 2. Secondary: RWM Higher percentage (descending)
    if (bHigher !== aHigher) {
      return bHigher - aHigher
    }
    
    // 3. Tertiary: Gap between Expected and Higher (ascending - smaller gap = better consistency)
    const aGap = aExpected - aHigher
    const bGap = bExpected - bHigher
    if (aGap !== bGap) {
      return aGap - bGap // Smaller gap ranks higher
    }
    
    // 4. Quaternary: GPS Expected percentage (descending - for final tie-breaking)
    const aGPS = a.gps_exp_2024 || 0
    const bGPS = b.gps_exp_2024 || 0
    if (bGPS !== aGPS) {
      return bGPS - aGPS
    }
    
    // 5. Quinary: GPS Higher percentage (descending - for extra accuracy)
    const aGPSHigher = a.gps_high_2024 || 0
    const bGPSHigher = b.gps_high_2024 || 0
    if (bGPSHigher !== aGPSHigher) {
      return bGPSHigher - aGPSHigher
    }
    
    // If all criteria are identical, schools are considered tied
    return 0
  })

  // Create rankings map with proper tied ranking logic
  const localRankingsMap: { [urn: string]: { la_rank: number } } = {}
  let currentRank = 1
  
  for (let i = 0; i < laSchools.length; i++) {
    const school = laSchools[i]
    
    // Check if this school is tied with the previous school
    if (i > 0) {
      const prevSchool = laSchools[i - 1]
      const isTied = (
        (school.rwm_exp_2024 || 0) === (prevSchool.rwm_exp_2024 || 0) &&
        (school.rwm_high_2024 || 0) === (prevSchool.rwm_high_2024 || 0) &&
        ((school.rwm_exp_2024 || 0) - (school.rwm_high_2024 || 0)) === ((prevSchool.rwm_exp_2024 || 0) - (prevSchool.rwm_high_2024 || 0)) &&
        (school.gps_exp_2024 || 0) === (prevSchool.gps_exp_2024 || 0) &&
        (school.gps_high_2024 || 0) === (prevSchool.gps_high_2024 || 0)
      )
      
      if (!isTied) {
        currentRank = i + 1
      }
    }
    
    localRankingsMap[school.urn] = { la_rank: currentRank }
  }

  return localRankingsMap
}

function createSlug(schoolName: string, urn: string): string {
  // Convert school name to URL-friendly format and append URN
  const nameSlug = schoolName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
  
  return `${nameSlug}-${urn}`
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ filter?: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { filter } = await searchParams
  const laName = slugToLAName(slug)
  const locationData = await getLocationData(laName)
  
  // Add noindex for pages with filter parameters
  const robotsConfig = filter ? {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  } : {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  };

  return {
    title: `Best Primary Schools in ${laName} | SchoolChecker.io`,
    description: `Find the best primary schools in ${laName}. Compare ${locationData.totalSchools} primary schools with Ofsted ratings, pupil numbers, and detailed reviews.`,
    keywords: `primary schools ${laName}, best primary schools ${laName}, primary school ratings ${laName}, Ofsted primary schools ${laName}, ${laName} schools`,
    openGraph: {
      title: `Best Primary Schools in ${laName}`,
      description: `Compare ${locationData.totalSchools} primary schools in ${laName} with detailed ratings and reviews.`,
      url: `https://schoolchecker.io/local-authority/${slug}`,
      siteName: 'SchoolChecker.io',
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best Primary Schools in ${laName}`,
      description: `Compare ${locationData.totalSchools} primary schools in ${laName} with detailed ratings and reviews.`,
    },
    alternates: {
      canonical: `https://schoolchecker.io/local-authority/${slug}`,
    },
    robots: robotsConfig,
  }
}

export default async function LocalAuthorityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const laName = slugToLAName(slug)
  
  const [locationData, schools, inspections, rankings, localRankings] = await Promise.all([
    getLocationData(laName),
    getPrimarySchools(laName),
    getInspections(laName),
    getRankings(laName),
    getLocalRankings(laName)
  ])

  // Calculate map center from schools
  const mapCenter = schools.length > 0 ? [
    schools.reduce((sum, s) => sum + (s.lat || 0), 0) / schools.length,
    schools.reduce((sum, s) => sum + (s.lon || 0), 0) / schools.length
  ] : [51.5074, -0.1278] // Default to London

  // Find schools with most and least pupils
  const schoolWithMostPupils = schools.length > 0 ? schools.reduce((max, school) => 
    (school.numberofpupils || 0) > (max.numberofpupils || 0) ? school : max
  ) : null

  const schoolWithLeastPupils = schools.length > 0 ? schools.reduce((min, school) => 
    (school.numberofpupils || 0) < (min.numberofpupils || 0) ? school : min
  ) : null

  // Find the #1 ranked school in KS2 Results
  const topRankedSchool = schools.find(school => localRankings[school.urn]?.la_rank === 1)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Dark Professional */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
          <div className="max-w-6xl">
            {/* Breadcrumbs */}
            <nav className="mt-3 md:mt-0 mb-3 md:mb-4">
              <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-300">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span className="text-gray-400">/</span>
                <Link href="/best-primary-schools-england" className="hover:text-white transition-colors">
                  England
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-white font-medium">{laName}</span>
              </div>
            </nav>
            
            <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 leading-tight">Best Primary Schools in {laName}</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-gray-300 text-xs md:text-sm">
              <span className="flex items-center gap-2">
                <span className="text-gray-400">🎓</span>
                Primary & All-through Schools
              </span>
              <span className="flex items-center gap-2">
                <span className="text-gray-400">📊</span>
                {schools.length} Schools Listed
              </span>
            </div>
            {topRankedSchool && (
              <div className="mt-3 md:mt-4">
                <div className="inline-flex items-center gap-2 border border-yellow-400/30 bg-yellow-400/10 rounded-lg px-3 py-2 backdrop-blur-sm text-xs md:text-sm">
                  <span className="text-yellow-400">⭐</span>
                  <span>
                    Best School in KS2 Results in {laName}: 
                    <Link 
                      href={`/school/${topRankedSchool.urn}`} 
                      className="ml-1 text-yellow-200 hover:text-white underline font-medium"
                    >
                      {topRankedSchool.establishmentname}
                    </Link>
                    <span className="text-gray-300 ml-1">(2024)</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* School Location Map */}
      <div className="bg-gray-50 py-6 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl">
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Primary Schools in {laName}</h2>
              <div className="text-sm text-gray-600">
                Showing {schools.length} schools in {laName}
              </div>
            </div>
            <div className="h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-lg">
              <ClientSchoolsMap
                center={mapCenter as [number, number]}
                zoom={10}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-6xl">

        {/* Key Highlights */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Highlights for {laName}</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>
                <strong>{locationData.outstandingSchools}</strong> Outstanding schools in {laName}
                {locationData.outstandingSchools > 0 && (
                  <Link href="?filter=outstanding#schools-table" className="ml-2 text-blue-600 hover:text-blue-800 underline">
                    (view all)
                  </Link>
                )}
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>
                <strong>{locationData.goodSchools}</strong> Good Schools in {laName}
                {locationData.goodSchools > 0 && (
                  <Link href="?filter=good#schools-table" className="ml-2 text-blue-600 hover:text-blue-800 underline">
                    (view all)
                  </Link>
                )}
              </span>
            </li>
            {schoolWithMostPupils && (
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✓</span>
                <span>
                  Primary School with most pupils is: 
                  <Link 
                    href={`/school/${createSlug(schoolWithMostPupils.establishmentname, schoolWithMostPupils.urn)}`} 
                    className="ml-1 text-blue-600 hover:text-blue-800 underline"
                  >
                    {schoolWithMostPupils.establishmentname}
                  </Link>
                  <span className="text-gray-500 ml-1">({(schoolWithMostPupils.numberofpupils || 0).toLocaleString()} pupils)</span>
                </span>
              </li>
            )}
            {schoolWithLeastPupils && schoolWithLeastPupils !== schoolWithMostPupils && (
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">✓</span>
                <span>
                  Primary School with the least pupils: 
                  <Link 
                    href={`/school/${createSlug(schoolWithLeastPupils.establishmentname, schoolWithLeastPupils.urn)}`} 
                    className="ml-1 text-blue-600 hover:text-blue-800 underline"
                  >
                    {schoolWithLeastPupils.establishmentname}
                  </Link>
                  <span className="text-gray-500 ml-1">({(schoolWithLeastPupils.numberofpupils || 0).toLocaleString()} pupils)</span>
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* Schools Table */}
        <div id="schools-table" className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">
              Primary Schools in {laName} - Ranked by Rating
            </h2>
            <p className="text-gray-600 mt-1">
              Showing {schools.length} primary schools in {laName} sorted by Ofsted rating and SchoolChecker.io calculated rating
            </p>
          </div>
          
          <SortableSchoolsTable 
            schools={schools} 
            inspections={inspections} 
            city={laName} 
            initialFilter="all"
            rankings={rankings}
            localRankings={localRankings}
          />
          
          {schools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No primary schools found for {laName}</p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">About Our {laName} Rankings</h3>
          <p className="text-blue-800 text-sm mb-3">
            Schools are ranked by their latest Ofsted inspection rating (Outstanding, Good, Requires Improvement, Inadequate). 
            For schools without recent Ofsted inspections, we use our SchoolChecker.io rating system. 
            All data is sourced from official government databases and updated regularly.
          </p>
          <p className="text-blue-800 text-sm">
            <strong>{laName} Coverage:</strong> This page includes all primary schools within the {laName} Local Authority boundaries, 
            ensuring comprehensive coverage of all state-funded primary education in the area.
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}
