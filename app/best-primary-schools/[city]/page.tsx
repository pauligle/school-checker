import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import CitySchoolsMap from '@/components/CitySchoolsMap'
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
  statutorylowage: number | null
  statutoryhighage: number | null
}

interface LocationData {
  location: string
  totalSchools: number
  primarySchools: number
  secondarySchools: number
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function capitalizeCityName(city: string): string {
  return city
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Helper function to get London districts for an area
function getLondonDistrictsForArea(areaName: string): Array<{name: string, postcode: string}> {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const londonDistrictsPath = path.join(process.cwd(), 'scripts', 'london-districts-pages.json');
    const londonDistricts = JSON.parse(fs.readFileSync(londonDistrictsPath, 'utf8'));
    
    // Convert area name to different formats for matching
    const areaLower = areaName.toLowerCase()
    const areaWithSpaces = areaLower.replace(/-/g, ' ')
    const areaCapitalized = areaWithSpaces.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
    
    const districts = londonDistricts
      .filter((district: any) => 
        district.area.toLowerCase() === areaLower || 
        district.area.toLowerCase() === areaWithSpaces ||
        district.area === areaCapitalized
      )
      .filter((district: any) => district.name !== 'Head district') // Exclude head districts
      .map((district: any) => ({
        name: district.name,
        postcode: district.postcode
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name)) // Sort alphabetically
    
    return districts;
  } catch (error) {
    console.error('Error loading London districts:', error);
    return [];
  }
}


async function getLocationData(city: string): Promise<LocationData> {
  const fs = require('fs')
  const path = require('path')
  
  try {
    // Check if this is a London postcode district
    const londonDistrictsPath = path.join(process.cwd(), 'scripts', 'london-districts-pages.json')
    let isLondonDistrict = false
    let londonDistrictData = null
    
    try {
      const londonDistricts = JSON.parse(fs.readFileSync(londonDistrictsPath, 'utf8'))
      londonDistrictData = londonDistricts.find((item: any) => 
        item.name.toLowerCase() === city.toLowerCase() || 
        item.postcode.toLowerCase() === city.toLowerCase()
      )
      isLondonDistrict = !!londonDistrictData
    } catch (londonDistrictError) {
      // London districts file doesn't exist or is invalid, continue with other checks
    }
    
    if (isLondonDistrict && londonDistrictData) {
      // This is a London postcode district
      return {
        location: londonDistrictData.name,
        totalSchools: londonDistrictData.totalSchools,
        primarySchools: londonDistrictData.primarySchools,
        secondarySchools: londonDistrictData.secondarySchools
      }
    }
    
    // Check if this is a London postcode area
    const londonMappingPath = path.join(process.cwd(), 'scripts', 'london-postcode-pages.json')
    let isLondonPostcode = false
    let londonData = null
    
    try {
      const londonMapping = JSON.parse(fs.readFileSync(londonMappingPath, 'utf8'))
      londonData = londonMapping.find((item: any) => 
        item.name.toLowerCase() === city.toLowerCase() || 
        item.postcode.toLowerCase() === city.toLowerCase()
      )
      isLondonPostcode = !!londonData
    } catch (londonError) {
      // London mapping file doesn't exist or is invalid, continue with regular city logic
    }
    
    if (isLondonPostcode && londonData) {
      // This is a London postcode area
      return {
        location: londonData.name,
        totalSchools: londonData.totalSchools,
        primarySchools: londonData.primarySchools,
        secondarySchools: londonData.secondarySchools
      }
    }
    
    // Regular city logic - load postcode mapping to get postcodes for this city
    const mappingPath = path.join(process.cwd(), 'scripts', 'data', 'postcode-city-mapping.json')
    const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf8'))
    
    // Find postcodes for this city (case-insensitive)
    const cityPostcodes = mappingData
      .filter((item: any) => item.city.toLowerCase() === city.toLowerCase())
      .map((item: any) => item.postcode)
    
    if (cityPostcodes.length === 0) {
      return {
        location: city,
        totalSchools: 0,
        primarySchools: 0,
        secondarySchools: 0
      }
    }
    
    // Count total schools
    const { count: totalSchools } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .in('postcode', cityPostcodes)
    
    // Count primary schools
    const { count: primarySchools } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .in('postcode', cityPostcodes)
      .in('phaseofeducation__name_', ['Primary', 'All-through'])
    
    // Count secondary schools
    const { count: secondarySchools } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .in('postcode', cityPostcodes)
      .in('phaseofeducation__name_', ['Secondary', 'All-through'])
    
    return {
      location: city,
      totalSchools: totalSchools || 0,
      primarySchools: primarySchools || 0,
      secondarySchools: secondarySchools || 0
    }
  } catch (error) {
    console.error('Error loading postcode mapping:', error)
    return {
      location: city,
      totalSchools: 0,
      primarySchools: 0,
      secondarySchools: 0
    }
  }
}

async function getPrimarySchools(city: string): Promise<SchoolData[]> {
  const fs = require('fs')
  const path = require('path')
  
  try {
    // Check if this is a London postcode district
    const londonDistrictsPath = path.join(process.cwd(), 'scripts', 'london-districts-pages.json')
    let isLondonDistrict = false
    let londonDistrictData = null
    
    try {
      const londonDistricts = JSON.parse(fs.readFileSync(londonDistrictsPath, 'utf8'))
      londonDistrictData = londonDistricts.find((item: any) => 
        item.name.toLowerCase() === city.toLowerCase() || 
        item.postcode.toLowerCase() === city.toLowerCase()
      )
      isLondonDistrict = !!londonDistrictData
    } catch (londonDistrictError) {
      // London districts file doesn't exist or is invalid, continue with other checks
    }
    
    if (isLondonDistrict && londonDistrictData) {
      // This is a London postcode district - fetch schools by postcode prefix
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
          statutorylowage,
          statutoryhighage
        `)
        .in('phaseofeducation__name_', ['Primary', 'All-through'])
        .like('postcode', londonDistrictData.postcode + '%')
        .not('lat', 'is', null)
        .not('lon', 'is', null)
        .order('establishmentname')
      
      if (error) {
        console.error('Error fetching London district schools:', error)
        return []
      }
      
      return schools || []
    }
    
    // Check if this is a London postcode area
    const londonMappingPath = path.join(process.cwd(), 'scripts', 'london-postcode-pages.json')
    let isLondonPostcode = false
    let londonData = null
    
    try {
      const londonMapping = JSON.parse(fs.readFileSync(londonMappingPath, 'utf8'))
      londonData = londonMapping.find((item: any) => 
        item.name.toLowerCase() === city.toLowerCase() || 
        item.postcode.toLowerCase() === city.toLowerCase()
      )
      isLondonPostcode = !!londonData
    } catch (londonError) {
      // London mapping file doesn't exist or is invalid, continue with regular city logic
    }
    
    if (isLondonPostcode && londonData) {
      // This is a London postcode area - fetch schools by postcode prefix
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
          statutorylowage,
          statutoryhighage
        `)
        .in('phaseofeducation__name_', ['Primary', 'All-through'])
        .like('postcode', londonData.postcode + '%')
        .not('lat', 'is', null)
        .not('lon', 'is', null)
        .order('establishmentname')
      
      if (error) {
        console.error('Error fetching London schools:', error)
        return []
      }
      
      return schools || []
    }
    
    // Regular city logic - check both data sources
    let cityPostcodes: string[] = []
    
    // First, try the new city data
    try {
      const cityDataPath = path.join(process.cwd(), 'scripts', 'city-pages-to-create.json')
      const cityData = JSON.parse(fs.readFileSync(cityDataPath, 'utf8'))
      const cityInfo = cityData.find((item: any) => item.city.toLowerCase() === city.toLowerCase())
      
      if (cityInfo && cityInfo.postcodes) {
        cityPostcodes = cityInfo.postcodes
      }
    } catch (cityDataError) {
      console.log('City data file not found, trying postcode mapping...')
    }
    
    // If no postcodes found, try the old postcode mapping
    if (cityPostcodes.length === 0) {
      try {
        const mappingPath = path.join(process.cwd(), 'scripts', 'data', 'postcode-city-mapping.json')
        const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf8'))
        
        cityPostcodes = mappingData
          .filter((item: any) => item.city.toLowerCase() === city.toLowerCase())
          .map((item: any) => item.postcode)
      } catch (mappingError) {
        console.log('Postcode mapping file not found')
      }
    }
    
    if (cityPostcodes.length === 0) {
      return []
    }
    
    // Use LIKE queries for postcode prefixes - try each postcode prefix separately
    let allSchools: any[] = []
    
    for (const postcodePrefix of cityPostcodes) {
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
          statutorylowage,
          statutoryhighage
        `)
        .in('phaseofeducation__name_', ['Primary', 'All-through'])
        .like('postcode', `${postcodePrefix}%`)
        .not('lat', 'is', null)
        .not('lon', 'is', null)
        .order('establishmentname')
      
      if (error) {
        console.error(`Error fetching schools for postcode ${postcodePrefix}:`, error)
        continue
      }
      
      if (schools) {
        allSchools = allSchools.concat(schools)
      }
    }
    
    // Remove duplicates based on URN
    const uniqueSchools = allSchools.filter((school, index, self) => 
      index === self.findIndex(s => s.urn === school.urn)
    )
    
    return uniqueSchools
  } catch (error) {
    console.error('Error loading postcode mapping:', error)
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: cityParam } = await params
  const city = decodeURIComponent(cityParam)
  const cityDisplayName = capitalizeCityName(city)
  const locationData = await getLocationData(city)
  
  // Check if this is a London area for better SEO
  const fs = require('fs')
  const path = require('path')
  let isLondonArea = false
  let londonAreaType = ''
  
  try {
    const londonDistrictsPath = path.join(process.cwd(), 'scripts', 'london-districts-pages.json')
    const londonDistricts = JSON.parse(fs.readFileSync(londonDistrictsPath, 'utf8'))
    
    const cityLower = city.toLowerCase()
    const cityWithSpaces = cityLower.replace(/-/g, ' ')
    const cityCapitalized = cityWithSpaces.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
    
    const londonDistrictData = londonDistricts.find((item: any) => 
      item.name.toLowerCase() === cityLower || 
      item.postcode.toLowerCase() === cityLower ||
      item.area.toLowerCase() === cityLower ||
      item.name.toLowerCase() === cityWithSpaces ||
      item.area.toLowerCase() === cityWithSpaces ||
      item.area === cityCapitalized
    )
    
    if (londonDistrictData) {
      isLondonArea = true
      londonAreaType = londonDistrictData.area || 'London'
    }
  } catch (error) {
    // Continue with regular logic
  }
  
  // Enhanced SEO content based on location type
  const baseTitle = `Best Primary Schools in ${cityDisplayName}`
  const baseDescription = `Find the best primary schools in ${cityDisplayName}. Comprehensive rankings, Ofsted ratings, and detailed information for ${locationData.primarySchools} primary schools.`
  
  const enhancedTitle = isLondonArea 
    ? `${baseTitle} | London Primary Schools | SchoolChecker.io`
    : `${baseTitle} | SchoolChecker.io`
    
  const enhancedDescription = isLondonArea
    ? `${baseDescription} Compare ${cityDisplayName} primary schools with Ofsted ratings, performance data, and pupil numbers. Free school comparison tool.`
    : `${baseDescription} Compare ${cityDisplayName} primary schools with Ofsted ratings, performance data, and pupil numbers. Free school comparison tool.`
  
  const enhancedKeywords = isLondonArea
    ? `primary schools ${cityDisplayName}, ${cityDisplayName} primary schools, best schools ${cityDisplayName}, ${londonAreaType} schools, school rankings ${cityDisplayName}, Ofsted ratings ${cityDisplayName}, ${cityDisplayName} education, London primary schools, school comparison ${cityDisplayName}`
    : `primary schools ${cityDisplayName}, best schools ${cityDisplayName}, school rankings ${cityDisplayName}, Ofsted ratings ${cityDisplayName}, ${cityDisplayName} schools, school comparison ${cityDisplayName}, education ${cityDisplayName}`
  
  return {
    title: enhancedTitle,
    description: enhancedDescription,
    keywords: enhancedKeywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: enhancedTitle,
      description: enhancedDescription,
      type: 'website',
      url: `https://schoolchecker.io/best-primary-schools/${encodeURIComponent(city)}`,
      siteName: 'SchoolChecker.io',
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title: enhancedTitle,
      description: enhancedDescription,
      site: '@schoolcheckerio',
    },
    alternates: {
      canonical: `https://schoolchecker.io/best-primary-schools/${encodeURIComponent(city)}`,
    },
  }
}

// Function to get inspection data for schools
async function getSchoolInspections(schools: SchoolData[]): Promise<{ [urn: string]: any }> {
  if (schools.length === 0) return {}
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const urns = schools.map(school => school.urn)
    
    const { data: inspections, error } = await supabase
      .from('inspections')
      .select('*')
      .in('urn', urns)
      .order('inspection_date', { ascending: false })
    
    if (error) {
      console.error('Error fetching inspections:', error)
      return {}
    }
    
    // Group by URN and get the latest inspection for each school
    const latestInspections: { [urn: string]: any } = {}
    inspections?.forEach(inspection => {
      if (!latestInspections[inspection.urn]) {
        latestInspections[inspection.urn] = inspection
      }
    })
    
    return latestInspections
  } catch (error) {
    console.error('Error fetching school inspections:', error)
    return {}
  }
}

// Function to calculate SchoolChecker.io rating from category judgments
function calculateSchoolCheckerRating(inspection: any) {
  if (!inspection) return null;

  // If we have an official Ofsted overall rating (pre-September 2024), use that
  if (inspection.outcome && inspection.outcome >= 1 && inspection.outcome <= 4) {
    return {
      rating: inspection.outcome,
      isCalculated: false,
      source: 'Official Ofsted Rating'
    };
  }

  // Calculate rating from category judgments (post-September 2024)
  const weights = {
    quality_of_education: 0.40,      // Most important
    effectiveness_of_leadership: 0.30, // Leadership and management
    behaviour_and_attitudes: 0.20,    // Behaviour and attitudes
    personal_development: 0.10        // Personal development
  };

  let weightedScore = 0;
  let totalWeight = 0;
  let categoriesUsed = [];

  Object.keys(weights).forEach(category => {
    const rating = inspection[category as keyof typeof inspection];
    if (rating && rating >= 1 && rating <= 4) {
      // Invert rating so 1=Outstanding=4 points, 4=Inadequate=1 point
      weightedScore += (5 - rating) * weights[category as keyof typeof weights];
      totalWeight += weights[category as keyof typeof weights];
      categoriesUsed.push(category);
    }
  });

  if (totalWeight === 0) return null;

  const averageScore = weightedScore / totalWeight;

  // Convert to rating
  let calculatedRating;
  if (averageScore >= 3.5) calculatedRating = 1; // Outstanding
  else if (averageScore >= 2.5) calculatedRating = 2; // Good  
  else if (averageScore >= 1.5) calculatedRating = 3; // Requires improvement
  else calculatedRating = 4; // Inadequate

  return {
    rating: calculatedRating,
    isCalculated: true,
    source: 'Schoolchecker.io Rating',
    categoriesUsed: categoriesUsed.length,
    totalCategories: Object.keys(weights).length
  };
}

// Function to get rating color and text
function getRatingDisplay(inspection: any) {
  const schoolCheckerRating = calculateSchoolCheckerRating(inspection);
  
  if (!schoolCheckerRating) {
    return {
      text: 'Not Rated',
      color: 'bg-gray-100 text-gray-800',
      type: 'none'
    }
  }
  
  const rating = schoolCheckerRating.rating
  const isCalculated = schoolCheckerRating.isCalculated
  
  switch (rating) {
    case 1: // Outstanding
      return {
        text: 'Outstanding',
        color: 'bg-green-100 text-green-800',
        type: isCalculated ? 'SchoolChecker' : 'Ofsted',
        isCalculated
      }
    case 2: // Good
      return {
        text: 'Good',
        color: 'bg-blue-100 text-blue-800',
        type: isCalculated ? 'SchoolChecker' : 'Ofsted',
        isCalculated
      }
    case 3: // Requires improvement
      return {
        text: 'Requires Improvement',
        color: 'bg-yellow-100 text-yellow-800',
        type: isCalculated ? 'SchoolChecker' : 'Ofsted',
        isCalculated
      }
    case 4: // Inadequate
      return {
        text: 'Inadequate',
        color: 'bg-red-100 text-red-800',
        type: isCalculated ? 'SchoolChecker' : 'Ofsted',
        isCalculated
      }
    default:
      return {
        text: 'Not Rated',
        color: 'bg-gray-100 text-gray-800',
        type: 'none'
      }
  }
}


export default async function CityPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ city: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { city: cityParam } = await params
  const searchParamsData = await searchParams
  const city = decodeURIComponent(cityParam)
  const cityDisplayName = capitalizeCityName(city)
  const locationData = await getLocationData(city)
  const schools = await getPrimarySchools(city)
  const inspections = await getSchoolInspections(schools)
  
  // Check if we should show specific filter
  const filterParam = searchParamsData.filter
  const initialFilter = filterParam === 'outstanding' ? 'outstanding' : 
                       filterParam === 'good' ? 'good' : 'all'
  
  // Get London districts for this area
  const londonDistricts = getLondonDistrictsForArea(city)
  
  // Check if this is a London area for breadcrumb logic
  const fs = require('fs')
  const path = require('path')
  let isLondonArea = false
  
  try {
    const londonDistrictsPath = path.join(process.cwd(), 'scripts', 'london-districts-pages.json')
    const londonDistricts = JSON.parse(fs.readFileSync(londonDistrictsPath, 'utf8'))
    
    // Convert city parameter to different formats for matching
    const cityLower = city.toLowerCase()
    const cityWithSpaces = cityLower.replace(/-/g, ' ')
    const cityCapitalized = cityWithSpaces.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
    
    const londonDistrictData = londonDistricts.find((item: any) => 
      item.name.toLowerCase() === cityLower || 
      item.postcode.toLowerCase() === cityLower ||
      item.area.toLowerCase() === cityLower ||
      item.name.toLowerCase() === cityWithSpaces ||
      item.area.toLowerCase() === cityWithSpaces ||
      item.area === cityCapitalized
    )
    isLondonArea = !!londonDistrictData
    console.log('London area check:', { 
      city, 
      cityLower, 
      cityWithSpaces, 
      cityCapitalized,
      isLondonArea, 
      foundData: londonDistrictData 
    })
  } catch (error) {
    console.log('Error checking London districts:', error)
    // London districts file doesn't exist or is invalid, continue with regular logic
  }
  
  // Calculate statistics for key highlights using the same logic as the table
  // Import the calculateSchoolCheckerRating function logic
  const calculateSchoolCheckerRating = (inspection: any) => {
    if (!inspection) return null;

    // If we have an official Ofsted overall rating (pre-September 2024), use that
    if (inspection.outcome && inspection.outcome >= 1 && inspection.outcome <= 4) {
      return {
        rating: inspection.outcome,
        isCalculated: false,
        source: 'Official Ofsted Rating'
      };
    }

    // Calculate rating from category judgments (post-September 2024)
    const weights = {
      quality_of_education: 0.40,      // Most important
      effectiveness_of_leadership: 0.30, // Leadership and management
      behaviour_and_attitudes: 0.20,    // Behaviour and attitudes
      personal_development: 0.10        // Personal development
    };

    let weightedScore = 0;
    let totalWeight = 0;
    let categoriesUsed: string[] = [];

    Object.keys(weights).forEach(category => {
      const rating = inspection[category as keyof typeof inspection];
      if (rating && rating >= 1 && rating <= 4) {
        // Invert rating so 1=Outstanding=4 points, 4=Inadequate=1 point
        weightedScore += (5 - rating) * weights[category as keyof typeof weights];
        totalWeight += weights[category as keyof typeof weights];
        categoriesUsed.push(category);
      }
    });

    if (totalWeight === 0) return null;

    const averageScore = weightedScore / totalWeight;
    
    // Convert score to rating (1=Outstanding, 2=Good, 3=Requires improvement, 4=Inadequate)
    let calculatedRating;
    if (averageScore >= 3.5) calculatedRating = 1; // Outstanding
    else if (averageScore >= 2.5) calculatedRating = 2; // Good
    else if (averageScore >= 1.5) calculatedRating = 3; // Requires improvement
    else calculatedRating = 4; // Inadequate

    return {
      rating: calculatedRating,
      isCalculated: true,
      source: 'SchoolChecker.io Calculated',
      score: averageScore,
      categoriesUsed
    };
  }
  
  const outstandingSchools = schools.filter(school => {
    const inspection = inspections[school.urn]
    const rating = calculateSchoolCheckerRating(inspection)
    return rating?.rating === 1 // Outstanding rating
  }).length
  
  const goodSchools = schools.filter(school => {
    const inspection = inspections[school.urn]
    const rating = calculateSchoolCheckerRating(inspection)
    return rating?.rating === 2 // Good rating
  }).length
  
  const requiresImprovementSchools = schools.filter(school => {
    const inspection = inspections[school.urn]
    const rating = calculateSchoolCheckerRating(inspection)
    return rating?.rating === 3 // Requires improvement rating
  }).length
  
  const inadequateSchools = schools.filter(school => {
    const inspection = inspections[school.urn]
    const rating = calculateSchoolCheckerRating(inspection)
    return rating?.rating === 4 // Inadequate rating
  }).length
  
  // Calculate percentages safely - use total schools if no inspections available
  const totalSchoolsWithInspections = Object.keys(inspections).length
  const denominator = totalSchoolsWithInspections > 0 ? totalSchoolsWithInspections : schools.length
  const outstandingPercentage = denominator > 0 ? Math.round((outstandingSchools / denominator) * 100) : 0
  const goodOrOutstandingPercentage = denominator > 0 ? Math.round(((outstandingSchools + goodSchools) / denominator) * 100) : 0
  
  // Calculate average pupils safely with strict filtering
  const schoolsWithPupilData = schools.filter(school => {
    const pupils = school.numberofpupils
    return pupils && 
           pupils > 0 && 
           pupils < 1000 && // More restrictive limit for primary schools
           typeof pupils === 'number' && 
           !isNaN(pupils) && 
           isFinite(pupils)
  })
  
  const totalPupils = schoolsWithPupilData.reduce((sum, s) => {
    const pupils = s.numberofpupils
    return sum + (pupils || 0)
  }, 0)
  
  const averagePupils = schoolsWithPupilData.length > 0 ? Math.round(totalPupils / schoolsWithPupilData.length) : 0
  
  // Debug logging
  console.log('Pupil data debug:', {
    totalSchools: schools.length,
    schoolsWithPupilData: schoolsWithPupilData.length,
    totalPupils,
    averagePupils,
    samplePupilNumbers: schoolsWithPupilData.slice(0, 5).map(s => s.numberofpupils)
  })
  
  // Find schools with most/least pupils
  const schoolsWithValidPupils = schools.filter(school => {
    const pupils = school.numberofpupils
    // Handle both number and string types
    const pupilNumber = typeof pupils === 'string' ? parseInt(pupils) : pupils
    return pupilNumber && 
           pupilNumber > 0 && 
           !isNaN(pupilNumber) &&
           isFinite(pupilNumber) &&
           pupilNumber < 2000 // Reasonable upper limit for primary schools
  })
  
  // Debug pupil data
  console.log('Pupil data debug:', {
    totalSchools: schools.length,
    schoolsWithValidPupils: schoolsWithValidPupils.length,
    samplePupilNumbers: schools.slice(0, 5).map(s => ({ name: s.establishmentname, pupils: s.numberofpupils }))
  })
  
  const schoolWithMostPupils = schoolsWithValidPupils.length > 0 
    ? schoolsWithValidPupils.reduce((max, school) => {
        const maxPupils = typeof max.numberofpupils === 'string' ? parseInt(max.numberofpupils) : max.numberofpupils
        const schoolPupils = typeof school.numberofpupils === 'string' ? parseInt(school.numberofpupils) : school.numberofpupils
        return schoolPupils > maxPupils ? school : max
      })
    : null
    
  const schoolWithLeastPupils = schoolsWithValidPupils.length > 0 
    ? schoolsWithValidPupils.reduce((min, school) => {
        const minPupils = typeof min.numberofpupils === 'string' ? parseInt(min.numberofpupils) : min.numberofpupils
        const schoolPupils = typeof school.numberofpupils === 'string' ? parseInt(school.numberofpupils) : school.numberofpupils
        return schoolPupils < minPupils ? school : min
      })
    : null

  // Debug inspection data
  console.log('Inspection data sample:', Object.values(inspections).slice(0, 3))
  console.log('All inspection outcomes:', Object.values(inspections).map(i => i?.outcome).filter(Boolean))
  console.log('Outcome code mapping:', {
    1: 'Outstanding',
    2: 'Good', 
    3: 'Requires improvement',
    4: 'Inadequate'
  })
  
  // Debug logging
  console.log(`City: ${city}, CityDisplayName: ${cityDisplayName}, Schools: ${schools.length}, Inspections: ${totalSchoolsWithInspections}, Outstanding: ${outstandingSchools}, Good: ${goodSchools}`)
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Dark Professional */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-16">
          <div className="max-w-6xl">
            {/* Breadcrumbs */}
            <nav className="mb-4 md:mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <span className="text-gray-400">/</span>
                {isLondonArea ? (
                  <>
                    <Link href="/best-primary-schools-england" className="hover:text-white transition-colors">
                      England
                    </Link>
                    <span className="text-gray-400">/</span>
                    <Link href="/best-primary-schools/london-overview" className="hover:text-white transition-colors">
                      London
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-white font-medium">{cityDisplayName}</span>
                  </>
                ) : (
                  <>
                    <Link href="/best-primary-schools" className="hover:text-white transition-colors">
                      Best Primary Schools
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-white font-medium">{cityDisplayName}</span>
                  </>
                )}
              </div>
            </nav>
            
            <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">Best Primary Schools in {cityDisplayName}</h1>
            
            {/* London Districts List */}
            {londonDistricts.length > 0 && (
              <div className="mb-4 md:mb-6">
                <p className="text-gray-300 text-sm md:text-base mb-2">
                  Areas included: 
                </p>
                <div className="flex flex-wrap gap-1">
                  {londonDistricts.map((district, index) => (
                    <span key={district.postcode}>
                      <Link 
                        href={`/best-primary-schools/${district.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-blue-300 hover:text-blue-100 hover:underline text-sm md:text-base"
                      >
                        {district.name}
                      </Link>
                      {index < londonDistricts.length - 1 && (
                        <span className="text-gray-400 mx-1">,</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-gray-300 text-sm md:text-lg">
              <span className="flex items-center gap-2">
                <span className="text-gray-400">📍</span>
                {cityDisplayName} Area
              </span>
              <span className="flex items-center gap-2">
                <span className="text-gray-400">🏛️</span>
                {cityDisplayName} & Surrounding Areas
              </span>
              <span className="flex items-center gap-2">
                <span className="text-gray-400">🎓</span>
                Primary & All-through Schools
              </span>
              <span className="flex items-center gap-2">
                <span className="text-gray-400">📊</span>
                {schools.length} Schools Listed
              </span>
            </div>
            <div className="mt-4 md:mt-8 space-y-3 md:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm md:text-lg font-medium text-gray-200">Coverage Area:</span>
                  <span className="px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded bg-blue-100 text-blue-800">
                    {cityDisplayName} Metropolitan Area
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm md:text-lg font-medium text-gray-200">School Types:</span>
                  <span className="px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded bg-green-100 text-green-800">
                    Primary Schools
                  </span>
                  <span className="px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded bg-purple-100 text-purple-800">
                    All-through Schools
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* School Location Map */}
      <div className="bg-gray-50 py-6 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl">
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Primary Schools in {cityDisplayName} Area</h2>
              <div className="text-sm text-gray-600">
                Showing {schools.length} schools in {cityDisplayName} area
              </div>
            </div>
            <CitySchoolsMap schools={schools} city={city} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-6xl">

        {/* Key Highlights */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Highlights for {cityDisplayName}</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>
                <strong>{outstandingSchools}</strong> Outstanding schools in {cityDisplayName}
                {outstandingSchools > 0 && (
                  <Link href="?filter=outstanding#schools-table" className="ml-2 text-blue-600 hover:text-blue-800 underline">
                    (view all)
                  </Link>
                )}
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>
                <strong>{goodSchools}</strong> Good Schools in {cityDisplayName}
                {goodSchools > 0 && (
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
                    href={`/school/${schoolWithMostPupils.urn}`} 
                    className="ml-1 text-blue-600 hover:text-blue-800 underline"
                  >
                    {schoolWithMostPupils.establishmentname}
                  </Link>
                  <span className="text-gray-500 ml-1">({(typeof schoolWithMostPupils.numberofpupils === 'string' ? parseInt(schoolWithMostPupils.numberofpupils) : schoolWithMostPupils.numberofpupils).toLocaleString()} pupils)</span>
                </span>
              </li>
            )}
            {schoolWithLeastPupils && schoolWithLeastPupils !== schoolWithMostPupils && (
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">✓</span>
                <span>
                  Primary School with the least pupils: 
                  <Link 
                    href={`/school/${schoolWithLeastPupils.urn}`} 
                    className="ml-1 text-blue-600 hover:text-blue-800 underline"
                  >
                    {schoolWithLeastPupils.establishmentname}
                  </Link>
                  <span className="text-gray-500 ml-1">({(typeof schoolWithLeastPupils.numberofpupils === 'string' ? parseInt(schoolWithLeastPupils.numberofpupils) : schoolWithLeastPupils.numberofpupils).toLocaleString()} pupils)</span>
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* Schools Table */}
        <div id="schools-table" className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">
              Primary Schools in {city} - Ranked by Rating
            </h2>
            <p className="text-gray-600 mt-1">
              Showing {schools.length} primary schools in {city} sorted by Ofsted rating and SchoolChecker.io calculated rating
            </p>
          </div>
            
          <SortableSchoolsTable 
            schools={schools} 
            inspections={inspections} 
            city={city} 
            initialFilter={initialFilter}
          />
          
          {schools.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No primary schools found for {city}</p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">About Our {city} Rankings</h3>
          <p className="text-blue-800 text-sm mb-3">
            Schools are ranked by their latest Ofsted inspection rating (Outstanding, Good, Requires Improvement, Inadequate). 
            For schools without recent Ofsted inspections, we use our SchoolChecker.io calculated rating system based on individual category judgments. 
            All data is sourced from official government databases and updated regularly.
          </p>
          <p className="text-blue-800 text-sm">
            <strong>{city} Coverage:</strong> This page includes all primary schools in {city}, 
            ensuring comprehensive coverage of the area's educational institutions.
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}

// Generate static params for all cities
export async function generateStaticParams() {
  try {
    const fs = require('fs')
    const path = require('path')
    
    const cityListPath = path.join(process.cwd(), 'scripts', 'city-pages-to-create.json')
    const cityData = JSON.parse(fs.readFileSync(cityListPath, 'utf8'))
    
    return cityData
      .filter((city: any) => city.primarySchools >= 10) // Only cities with 10+ primary schools
      .map((city: any) => ({
        city: encodeURIComponent(city.city)
      }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}
