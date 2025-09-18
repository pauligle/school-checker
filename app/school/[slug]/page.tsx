import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import ClientSchoolsMap from '@/components/ClientSchoolsMap';
import PrimaryResultsCard from '@/components/PrimaryResultsCard';
import AdmissionsCard from '@/components/AdmissionsCard';
import StructuredData from '@/components/StructuredData';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to capitalize city names
function capitalizeCityName(city: string): string {
  return city
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Helper function to get city from postcode
function getCityFromPostcode(postcode: string): string | null {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const mappingPath = path.join(process.cwd(), 'scripts', 'data', 'postcode-city-mapping.json');
    const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    
    const cityData = mappingData.find((item: any) => 
      item.postcode === postcode || 
      item.postcode === postcode.toUpperCase()
    );
    
    return cityData?.city && cityData.city !== 'Unknown' ? cityData.city : null;
  } catch (error) {
    console.error('Error loading postcode mapping:', error);
    return null;
  }
}

// Helper function to get school rankings (same as area pages)
async function getSchoolRankings(schools: any[]): Promise<{ [urn: string]: { rwm_rank: number } }> {
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
    console.error('Error fetching school rankings:', error)
    return {}
  }

  // Convert to object keyed by URN
  const rankingsMap: { [urn: string]: { rwm_rank: number } } = {}
  rankings?.forEach(ranking => {
    rankingsMap[ranking.urn] = { rwm_rank: ranking.rwm_rank }
  })

  return rankingsMap
}


// Helper function to convert numeric Ofsted rating to text
function getOfstedRatingText(rating: number | null | undefined): string {
  if (!rating) return 'Not Available';
  switch (rating) {
    case 1:
      return 'Outstanding';
    case 2:
      return 'Good';
    case 3:
      return 'Requires Improvement';
    case 4:
      return 'Inadequate';
    default:
      return 'Not Available';
  }
}

// Calculate School Checker Inspection Rating (same logic as SchoolDetailsCard)
function calculateSchoolCheckerRating(inspection: any) {
  if (!inspection) return null;

  // If we have an official Ofsted overall rating (pre-September 2024), use that
  if (inspection.outcome && inspection.outcome >= 1 && inspection.outcome <= 4) {
    return {
      rating: inspection.outcome,
      isCalculated: false,
      source: 'Ofsted Overall Rating'
    };
  }

  // Calculate rating from category judgments (post-September 2024)
  const weights = {
    quality_of_education: 0.4,
    effectiveness_of_leadership: 0.25,
    behaviour_and_attitudes: 0.2,
    personal_development: 0.15
  };

  let weightedScore = 0;
  let totalWeight = 0;
  const categoriesUsed: string[] = [];

  Object.keys(weights).forEach(category => {
    const rating = inspection[category];
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
    categoriesUsed
  };
}

// Get rating text and color
function getRatingInfo(rating: number) {
  switch (rating) {
    case 1: return { text: 'Outstanding', color: 'text-green-600 bg-green-100' };
    case 2: return { text: 'Good', color: 'text-yellow-600 bg-yellow-100' };
    case 3: return { text: 'Requires Improvement', color: 'text-orange-600 bg-orange-100' };
    case 4: return { text: 'Inadequate', color: 'text-red-600 bg-red-100' };
    default: return { text: 'N/A', color: 'text-gray-600 bg-gray-100' };
  }
}

interface SchoolData {
  urn: string;
  establishmentname: string;
  lat: number;
  lon: number;
  typeofestablishment__name_: string;
  phaseofeducation__name_: string;
  la__name_: string;
  numberofpupils: number;
  numberofboys: number;
  numberofgirls: number;
  gender__name_: string;
  age_range: string;
  schoolcapacity: number;
  address: string;
  postcode: string;
  telephonenum: string;
  schoolwebsite: string;
  headtitle__name_: string;
  headfirstname: string;
  headlastname: string;
  headpreferredjobtitle: string;
  establishmentstatus__name_: string;
  // 2024-25 pupil data
  pupils_202425: number;
  boys_202425: number;
  girls_202425: number;
  fte_pupils_202425: number;
  fsm_202425: number;
  fsm_percentage_202425: number;
  english_first_language_202425: number;
  english_first_language_percentage_202425: number;
  other_language_202425: number;
  other_language_percentage_202425: number;
  // Primary results data
  rwm_expected_percentage_2024: number;
  rwm_higher_percentage_2024: number;
  gps_expected_percentage_2024: number;
  gps_higher_percentage_2024: number;
  // Nursery provision
  nurseryprovision__name_: string;
  // Additional school details
  statutorylowage: number;
  statutoryhighage: number;
  religiouscharacter__name_: string;
  street: string;
  town: string;
  trusts__code_: string;
  trusts__name_: string;
  young_carers_202425: number;
  young_carers_percentage_202425: number;
  sen_with_statements_202425: string;
  sen_without_statements_202425: string;
  // Ethnicity data
  white_british_202425: number;
  white_british_percentage_202425: number;
  white_irish_202425: number;
  white_irish_percentage_202425: number;
  white_other_202425: number;
  white_other_percentage_202425: number;
  asian_indian_202425: number;
  asian_indian_percentage_202425: number;
  asian_pakistani_202425: number;
  asian_pakistani_percentage_202425: number;
  asian_bangladeshi_202425: number;
  asian_bangladeshi_percentage_202425: number;
  asian_other_202425: number;
  asian_other_percentage_202425: number;
  black_african_202425: number;
  black_african_percentage_202425: number;
  black_caribbean_202425: number;
  black_caribbean_percentage_202425: number;
  black_other_202425: number;
  black_other_percentage_202425: number;
  mixed_white_black_caribbean_202425: number;
  mixed_white_black_caribbean_percentage_202425: number;
  mixed_white_black_african_202425: number;
  mixed_white_black_african_percentage_202425: number;
  mixed_white_asian_202425: number;
  mixed_white_asian_percentage_202425: number;
  mixed_other_202425: number;
  mixed_other_percentage_202425: number;
  other_ethnic_group_202425: number;
  other_ethnic_group_percentage_202425: number;
  chinese_202425: number;
  chinese_percentage_202425: number;
  gypsy_roma_202425: number;
  gypsy_roma_percentage_202425: number;
  traveller_irish_heritage_202425: number;
  traveller_irish_heritage_percentage_202425: number;
  other_202425: number;
  other_percentage_202425: number;
  unclassified_202425: number;
  unclassified_percentage_202425: number;
  // SEN data
  senstat: number;
  sennostat: number;
  sen_percentage: number;
  // Teacher data
  pupil_to_all_teacher_ratio_2024: number;
}

interface InspectionData {
  id: string;
  inspection_date: string;
  outcome: number;
  previous_outcome: number;
  quality_of_education: number;
  behaviour_and_attitudes: number;
  personal_development: number;
  effectiveness_of_leadership: number;
  inspection_type: string;
  inspector_name: string;
}


function createLaSlug(laName: string): string {
  return laName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function getSchoolData(slug: string): Promise<{
  school: SchoolData | null;
  inspection: InspectionData | null;
  ranking: any | null;
  laRanking: any | null;
  admissionsData: { [year: string]: any } | null;
}> {
  try {
    // Extract URN from slug (format: school-name-urn)
    const urn = slug.split('-').pop();
    if (!urn || isNaN(Number(urn))) {
      return { school: null, inspection: null, ranking: null, laRanking: null, admissionsData: null };
    }

    // Get school data
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('urn', urn)
      .single();

    if (schoolError || !schoolData) {
      return { school: null, inspection: null, ranking: null, laRanking: null, admissionsData: null };
    }

    // Get latest inspection data
    const { data: inspectionData } = await supabase
      .from('inspections')
      .select('*')
      .eq('urn', urn)
      .order('inspection_date', { ascending: false })
      .limit(1)
      .single();

    // Get ranking data for the latest year (2024)
    const { data: rankingData } = await supabase
      .from('school_rankings')
      .select('*')
      .eq('urn', urn)
      .eq('data_year', 2024)
      .limit(1)
      .single();

    // Get LA ranking data using the same method as area pages
    let laRankingData = null;
    try {
      // Get all schools in the same local authority with the same filtering as area pages
      const { data: laSchools, error: laError } = await supabase
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
          statutoryhighage,
          religiouscharacter__name_
        `)
        .eq('la__name_', schoolData.la__name_)
        .in('phaseofeducation__name_', ['Primary', 'All-through'])
        .not('lat', 'is', null)
        .not('lon', 'is', null)
        .order('establishmentname');

      if (!laError && laSchools) {
        // Filter out nursery age ranges (same as area pages)
        const excludedAgeRanges = ['0-5', '2-4', '2-5', '2-7', '2-9', '2-11', '3-5', '3-7', '4-7', '5-7']
        const filteredSchools = laSchools.filter(laSchool => {
          if (!laSchool.statutorylowage || !laSchool.statutoryhighage) return false
          const ageRange = `${laSchool.statutorylowage}-${laSchool.statutoryhighage}`
          return !excludedAgeRanges.includes(ageRange)
        });

        // Get rankings for these schools using the same logic as area pages
        const schoolUrns = filteredSchools.map(s => s.urn).filter(Boolean);
        const rankings = await getSchoolRankings(filteredSchools);
        
        // Only include schools that have ranking data (same as area pages)
        const schoolsWithRankings = filteredSchools
          .filter(laSchool => rankings[laSchool.urn]) // Only schools with ranking data
          .map(laSchool => ({
            ...laSchool,
            ranking: rankings[laSchool.urn]
          }));

        schoolsWithRankings.sort((a, b) => {
          const aRank = a.ranking.rwm_rank || 999999;
          const bRank = b.ranking.rwm_rank || 999999;
          return aRank - bRank;
        });

        // Find the current school's rank
        const schoolIndex = schoolsWithRankings.findIndex(s => s.urn === schoolData.urn);
        
        if (schoolIndex !== -1) {
          // Calculate tied ranking (same logic as area pages)
          let currentRank = 1;
          for (let i = 0; i < schoolsWithRankings.length; i++) {
            if (schoolsWithRankings[i].urn === schoolData.urn) {
              laRankingData = {
                la_rank: currentRank,
                total_la_schools: schoolsWithRankings.length,
                la_name: schoolData.la__name_,
                la_code: schoolData.la__code_,
                year: 2024
              };
              break;
            }
            // Check if next school has different ranking to increment rank
            if (i < schoolsWithRankings.length - 1) {
              const currentSchoolRank = schoolsWithRankings[i].ranking.rwm_rank || 999999;
              const nextSchoolRank = schoolsWithRankings[i + 1].ranking.rwm_rank || 999999;
              if (nextSchoolRank !== currentSchoolRank) {
                currentRank = i + 2;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching LA ranking:', error);
    }

    // Get admissions data for all years
    let admissionsData: { [year: string]: any } = {};
    try {
      const years = ['202526', '202425', '202324', '202223'];
      const schoolName = schoolData.establishmentname;
      const schoolPhase = schoolData.phaseofeducation__name_ === 'All-through' ? 'Primary' : schoolData.phaseofeducation__name_;

      for (const year of years) {
        try {
          let query = supabase
            .from('admissions')
            .select('*')
            .eq('school_phase', schoolPhase)
            .eq('time_period', year);

          // Try school name first, then URN
          if (schoolName) {
            query = query.ilike('school_name', `%${schoolName}%`);
          } else {
            query = query.eq('school_urn', urn);
          }

          const { data: yearData, error: yearError } = await query.limit(1);
          
          if (!yearError && yearData && yearData.length > 0) {
            const data = yearData[0];
            // Calculate additional metrics
            const isOversubscribed = data.times_put_as_1st_preference > data.number_1st_preference_offers;
            const oversubscriptionRate = data.times_put_as_1st_preference > 0 
              ? ((data.times_put_as_1st_preference - data.number_1st_preference_offers) / data.number_1st_preference_offers * 100)
              : 0;

            const successRate = data.total_places_offered > 0 
              ? (data.total_offers / data.total_places_offered) * 100
              : 0;
            const competitionRatio = data.total_offers > 0 
              ? data.total_applications / data.total_offers
              : 0;

            admissionsData[year] = {
              school_name: data.school_name,
              school_urn: data.school_urn,
              la_name: data.la_name,
              school_phase: data.school_phase,
              time_period: data.time_period,
              is_oversubscribed: isOversubscribed,
              oversubscription_rate: oversubscriptionRate,
              total_applications: data.times_put_as_any_preferred_school,
              first_preference_applications: data.times_put_as_1st_preference,
              second_preference_applications: data.times_put_as_2nd_preference,
              third_preference_applications: data.times_put_as_3rd_preference,
              applications_from_another_la: data.applications_from_another_la,
              total_offers: data.total_places_offered,
              first_preference_offers: data.number_1st_preference_offers,
              second_preference_offers: data.number_2nd_preference_offers,
              third_preference_offers: data.number_3rd_preference_offers,
              total_preferred_offers: data.number_preferred_offers,
              offers_to_another_la: data.offers_to_another_la,
              success_rate: Math.round(successRate * 100) / 100,
              competition_ratio: Math.round(competitionRatio * 100) / 100,
              establishment_type: data.establishment_type,
              denomination: data.denomination,
              admissions_policy: data.admissions_policy,
              fsm_eligible_percent: data.fsm_eligible_percent,
              urban_rural: data.urban_rural,
              allthrough_school: data.allthrough_school,
              proportion_1stprefs_v_1stprefoffers: data.proportion_1stprefs_v_1stprefoffers,
              proportion_1stprefs_v_totaloffers: data.proportion_1stprefs_v_totaloffers,
            };
          }
        } catch (yearError) {
          console.error(`Error fetching admissions data for year ${year}:`, yearError);
        }
      }
    } catch (error) {
      console.error('Error fetching admissions data:', error);
    }

    return {
      school: schoolData as SchoolData,
      inspection: inspectionData as InspectionData,
      ranking: rankingData,
      laRanking: laRankingData,
      admissionsData: Object.keys(admissionsData).length > 0 ? admissionsData : null
    };
  } catch (error) {
    console.error('Error fetching school data:', error);
    return { school: null, inspection: null, ranking: null, laRanking: null, admissionsData: null };
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { school, inspection, ranking, laRanking, admissionsData } = await getSchoolData(slug);
  
  if (!school) {
    return {
      title: 'School Not Found | SchoolChecker.io',
      description: 'The requested school could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  // Get city from postcode for better SEO
  const city = school?.postcode ? getCityFromPostcode(school.postcode) : null;
  const cityDisplayName = city ? capitalizeCityName(city) : school.la__name_;
  
  // Get Ofsted rating for enhanced description
  const ofstedRating = inspection?.outcome ? getOfstedRatingText(inspection.outcome) : 'Not Available';
  const schoolCheckerRating = calculateSchoolCheckerRating(inspection);
  
  // Enhanced SEO content
  const enhancedTitle = `${school.establishmentname} | ${cityDisplayName} Primary School | SchoolChecker.io`;
  
  const enhancedDescription = `${school.establishmentname} is a ${school.phaseofeducation__name_} school in ${cityDisplayName}. ${ofstedRating !== 'Not Available' ? `Ofsted rating: ${ofstedRating}.` : ''} View complete school information including performance data, pupil numbers, and inspection reports.`;
  
  const enhancedKeywords = `${school.establishmentname}, ${school.establishmentname} school, ${cityDisplayName} primary school, ${school.la__name_} schools, ${school.phaseofeducation__name_} ${cityDisplayName}, Ofsted ${school.establishmentname}, school performance ${cityDisplayName}, ${school.postcode} schools, school ratings ${cityDisplayName}`;

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
      url: `https://schoolchecker.io/school/${slug}`,
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
      canonical: `https://schoolchecker.io/school/${slug}`,
    },
  };
}

export default async function SchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  try {
    const { school, inspection, ranking, laRanking, admissionsData } = await getSchoolData(slug);

    // Get city from postcode for breadcrumbs
    const city = school?.postcode ? getCityFromPostcode(school.postcode) : null;
    const cityDisplayName = city ? capitalizeCityName(city) : null;

    if (!school) {
      return (
        <div className="min-h-screen bg-gray-50 py-16">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">School Not Found</h1>
              <p className="text-lg text-gray-600">The requested school could not be found.</p>
              <p className="text-sm text-gray-500 mt-2">Slug: {slug}</p>
            </div>
          </div>
        </div>
      );
    }

  const getRatingColor = (rating: string | null | undefined) => {
    if (!rating || typeof rating !== 'string') {
      return 'text-gray-600 bg-gray-100';
    }
    switch (rating.toLowerCase()) {
      case 'outstanding': return 'text-green-600 bg-green-100';
      case 'good': return 'text-yellow-600 bg-yellow-100';
      case 'requires improvement': return 'text-orange-600 bg-orange-100';
      case 'inadequate': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };


  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString();
  };

  // Create breadcrumbs for structured data
  const breadcrumbs = [
    { name: 'Home', url: 'https://schoolchecker.io' },
    { name: 'Primary Schools', url: 'https://schoolchecker.io/best-primary-schools' },
    { name: 'England', url: 'https://schoolchecker.io/best-primary-schools-england' },
    { name: laRanking?.la_name || school.la__name_, url: `https://schoolchecker.io/best-primary-schools/${createLaSlug(laRanking?.la_name || school.la__name_)}` },
    { name: school.establishmentname, url: `https://schoolchecker.io/school/${slug}` }
  ];

  // Add slug property to school data for structured data component
  const schoolWithSlug = {
    ...school,
    slug: slug
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <StructuredData 
        school={schoolWithSlug} 
        inspection={inspection} 
        breadcrumbs={breadcrumbs}
      />
      
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
                <Link href="/best-primary-schools" className="hover:text-white transition-colors">
                  Primary Schools
                </Link>
                <span className="text-gray-400">/</span>
                <Link href="/best-primary-schools-england" className="hover:text-white transition-colors">
                  England
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-white font-medium">{laRanking?.la_name || school.la__name_}</span>
              </div>
            </nav>
            
            <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 leading-tight">{school.establishmentname}</h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-gray-300 text-xs md:text-sm">
              {school.postcode && (
                <span className="flex items-center gap-2">
                  <span className="text-gray-400">📍</span>
                  {school.postcode}
                </span>
              )}
              {school.la__name_ && (
                <span className="flex items-center gap-2">
                  <span className="text-gray-400">🏛️</span>
                  {school.la__name_}
                </span>
              )}
              {school.phaseofeducation__name_ && (
                <span className="flex items-center gap-2">
                  <span className="text-gray-400">🎓</span>
                  {school.phaseofeducation__name_}
                </span>
              )}
              {school.nurseryprovision__name_ && school.nurseryprovision__name_.includes('Has Nursery') && (
                <span className="flex items-center gap-2">
                  <span className="text-gray-400">👶</span>
                  With Nursery
                </span>
              )}
              {school.statutorylowage && school.statutoryhighage && (
                <span className="flex items-center gap-2">
                  <span className="text-gray-400">📅</span>
                  Ages {school.statutorylowage}-{school.statutoryhighage}
                </span>
              )}
              {(school.pupils_202425 || school.numberofpupils) && (
                <span className="flex items-center gap-2">
                  <span className="text-gray-400">👥</span>
                  {formatNumber(school.pupils_202425 || school.numberofpupils)} pupils
                </span>
              )}
            </div>
            <div className="mt-3 md:mt-4 space-y-2 md:space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm font-medium text-gray-200">Ofsted Overall Rating:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getRatingColor(getOfstedRatingText(inspection?.outcome))}`}>
                    {getOfstedRatingText(inspection?.outcome)}
                  </span>
                  {inspection?.inspection_date && (
                    <span className="ml-2 text-xs text-gray-300">
                      ({new Date(inspection.inspection_date).getFullYear()})
                    </span>
                  )}
                  {getOfstedRatingText(inspection?.outcome) === 'Not Available' && (
                    <a 
                      href="/schoolchecker-rating" 
                      className="text-blue-300 hover:text-blue-100 underline text-xs"
                    >
                      Why?
                    </a>
                  )}
                </div>
              </div>
              {(() => {
                const ofstedRating = getOfstedRatingText(inspection?.outcome);
                // Only show SchoolChecker.io rating if Ofsted rating is "Not Available"
                if (ofstedRating === 'Not Available') {
                  const schoolcheckerRating = calculateSchoolCheckerRating(inspection);
                  if (schoolcheckerRating) {
                    const ratingInfo = getRatingInfo(schoolcheckerRating.rating);
                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs md:text-sm font-medium text-gray-200">Schoolchecker.io Rating:</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${ratingInfo.color}`}>
                            {ratingInfo.text}
                          </span>
                          <span className="text-xs text-gray-200">
                            ({schoolcheckerRating.isCalculated ? 'calculated' : 'official'})
                          </span>
                          <a 
                            href="/schoolchecker-rating" 
                            className="text-blue-300 hover:text-blue-100 underline text-xs"
                          >
                            How?
                          </a>
                        </div>
                      </div>
                    );
                  }
                }
                return null;
              })()}
            </div>
            
            {/* Ranking Information */}
            {ranking && (
              <div className="mt-3 md:mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm font-medium text-gray-200">KS2 Primary Results Ranking:</span>
                  <span className="text-xs md:text-sm text-white font-semibold">
                    #{ranking.rwm_rank?.toLocaleString()} Ranked of {ranking.total_schools?.toLocaleString()} Primary Schools in England 
                    {(() => {
                      if (ranking.rwm_rank === 1) {
                        return ' (this is the best school in the area!)';
                      }
                      const percentile = (ranking.rwm_rank / ranking.total_schools) * 100;
                      return ` (top ${Math.round(percentile)}%)`;
                    })()}
                  </span>
                  <a 
                    href="/how-school-rankings-work" 
                    className="text-blue-300 hover:text-blue-100 underline text-xs"
                  >
                    How?
                  </a>
                </div>
              </div>
            )}
            
            {/* LA Ranking Information */}
            {laRanking && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm font-medium text-gray-200">Local Ranking:</span>
                  <span className="text-xs md:text-sm text-white font-semibold">
                    #{laRanking.la_rank} Ranked out of {laRanking.total_la_schools} Primary Schools in{' '}
                    <Link 
                      href={`/best-primary-schools/${createLaSlug(laRanking.la_name)}`}
                      className="text-blue-300 hover:text-blue-100 underline"
                    >
                      {laRanking.la_name}
                    </Link>
                    {(() => {
                      if (laRanking.la_rank === 1) {
                        return ' (this is the best school in the area!)';
                      }
                      const percentile = (laRanking.la_rank / laRanking.total_la_schools) * 100;
                      const percentileText = percentile <= 1 ? 'top 1%' :
                                            percentile <= 5 ? 'top 5%' :
                                            percentile <= 10 ? 'top 10%' :
                                            percentile <= 25 ? 'top 25%' :
                                            percentile <= 50 ? 'top 50%' :
                                            'bottom 50%';
                      return ` (top ${Math.round(percentile)}%)`;
                    })()}
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
          <div className="max-w-7xl">
            <div className="flex items-center justify-between mb-3 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">School Location</h2>
              <a
                href={`/?school=${school.urn}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg text-sm md:text-base"
              >
                <span>🗺️</span>
                View on Main Map
              </a>
            </div>
            <div className="h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-lg">
              <ClientSchoolsMap
                center={[school.lat, school.lon]}
                zoom={15}
                selectedSchool={school.urn}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        <div className="max-w-7xl space-y-8">
          {/* School Details Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded"></span>
              School Details
            </h2>
            
            {/* School Details Table - Exact same as map card but larger */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-200 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
                <h3 className="text-base md:text-lg font-semibold text-gray-800">School Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base min-w-[500px]">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Phase</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.phaseofeducation__name_ || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Type</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.typeofestablishment__name_ || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Age Range</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.statutorylowage}-{school.statutoryhighage}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Gender</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.gender__name_ || 'Mixed'}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Coeducational Sixth Form</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">Yes</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Has Nursery</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">Yes</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Religious Character</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.religiouscharacter__name_ || 'Does not apply'}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Principal</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.headtitle__name_ || ''} {school.headfirstname || ''} {school.headlastname || ''}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Address</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.street}, {school.town}, {school.postcode}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Phone Number</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.telephonenum || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Website</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">
                        {school.schoolwebsite ? (
                          <a 
                            href={school.schoolwebsite.startsWith('http') ? school.schoolwebsite : `https://${school.schoolwebsite}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {school.schoolwebsite}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Academy Sponsor</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">
                        {school.trusts__code_ && school.trusts__name_ ? (
                          <a 
                            href={`https://www.compare-school-performance.service.gov.uk/multi-academy-trust/${school.trusts__code_}/${school.trusts__name_.toLowerCase().replace(/\s+/g, '-')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {school.trusts__name_}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Local Authority</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.la__name_ || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-100 last:border-b-0">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Unique Reference Number</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.urn || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pupils Data Section */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-1 h-8 bg-green-600 rounded"></span>
              Pupils Data
            </h2>
            
            {/* Pupil Summary Table - Exact same as map card but larger */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
              <div className="bg-gray-200 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
                <h3 className="text-base md:text-lg font-semibold text-gray-800">Pupil Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base min-w-[500px]">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Total Pupils</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">
                        {formatNumber(school.pupils_202425 || school.numberofpupils)}
                        {school.schoolcapacity && (school.pupils_202425 || school.numberofpupils) && (
                          <span className="text-gray-500 ml-1">
                            ({Math.round(((school.pupils_202425 || school.numberofpupils) / school.schoolcapacity) * 100)}% capacity)
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Age Range</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.statutorylowage}-{school.statutoryhighage}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Gender</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">{school.gender__name_ || 'Mixed'}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Boy/Girl Ratio</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">
                        {school.boys_202425 && school.girls_202425 && (school.pupils_202425 || school.numberofpupils) ? (
                          <>
                            <div>{((school.girls_202425 / (school.pupils_202425 || school.numberofpupils)) * 100).toFixed(1)}% Girls</div>
                            <div>{((school.boys_202425 / (school.pupils_202425 || school.numberofpupils)) * 100).toFixed(1)}% Boys</div>
                          </>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Eligible for Free School Meals</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">
                        {school.fsm_202425 || 0} pupils ({school.fsm_percentage_202425?.toFixed(1) || 0}%)
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">First Language is Not English</td>
                      <td className="py-2 pl-1 pr-4 text-gray-800">
                        {school.english_first_language_202425 && (school.pupils_202425 || school.numberofpupils) ? (
                          <>
                            {(school.pupils_202425 || school.numberofpupils) - school.english_first_language_202425} pupils
                            <span className="text-gray-500 ml-1">
                              ({(((school.pupils_202425 || school.numberofpupils) - school.english_first_language_202425) / (school.pupils_202425 || school.numberofpupils) * 100).toFixed(1)}%)
                            </span>
                          </>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    </tr>
                    {school.young_carers_202425 > 0 && (
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Young Carers</td>
                        <td className="py-2 pl-1 pr-4 text-gray-800">
                          {school.young_carers_202425} ({school.young_carers_percentage_202425?.toFixed(1) || 0}%)
                        </td>
                      </tr>
                    )}
                    {school.pupil_to_all_teacher_ratio_2024 && (
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Pupils per Teacher</td>
                        <td className="py-2 pl-1 pr-4 text-gray-800">{school.pupil_to_all_teacher_ratio_2024}</td>
                      </tr>
                    )}
                    {((school.sen_with_statements_202425 && school.sen_with_statements_202425 !== '') || (school.sen_without_statements_202425 && school.sen_without_statements_202425 !== '')) && (
                      <tr className="border-b border-gray-100 last:border-b-0">
                        <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">Pupils with SEN Support</td>
                        <td className="py-2 pl-1 pr-4 text-gray-800">
                          {(() => {
                            const senWithStatements = parseInt(school.sen_with_statements_202425) || 0;
                            const senWithoutStatements = parseInt(school.sen_without_statements_202425) || 0;
                            const totalSen = senWithStatements + senWithoutStatements;
                            const totalPupils = school.pupils_202425 || school.numberofpupils || 1;
                            const percentage = (totalSen / totalPupils * 100).toFixed(1);
                            return `${totalSen} pupils (${percentage}%)`;
                          })()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pupil Ethnicities Table - Exact same as map card but larger */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-200 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
                <h3 className="text-base md:text-lg font-semibold text-gray-800">Pupil Ethnicities</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base min-w-[500px]">
                  <tbody>
                    {(() => {
                      // Create ethnicity mapping from school data
                      const ethnicityMapping = {
                        'White, British': school.white_british_percentage_202425,
                        'White, Irish': school.white_irish_percentage_202425,
                        'White, Other': school.white_other_percentage_202425,
                        'Asian, Indian': school.asian_indian_percentage_202425,
                        'Asian, Pakistani': school.asian_pakistani_percentage_202425,
                        'Asian, Bangladeshi': school.asian_bangladeshi_percentage_202425,
                        'Asian, Other': school.asian_other_percentage_202425,
                        'Black, African': school.black_african_percentage_202425,
                        'Black, Caribbean': school.black_caribbean_percentage_202425,
                        'Black, Other': school.black_other_percentage_202425,
                        'Mixed, White & Black Caribbean': school.mixed_white_black_caribbean_percentage_202425,
                        'Mixed, White & Black African': school.mixed_white_black_african_percentage_202425,
                        'Mixed, White & Asian': school.mixed_white_asian_percentage_202425,
                        'Mixed, Other': school.mixed_other_percentage_202425,
                        'Chinese': school.chinese_percentage_202425,
                        'Gypsy/Roma': school.gypsy_roma_percentage_202425,
                        'Traveller of Irish Heritage': school.traveller_irish_heritage_percentage_202425,
                        'Other': school.other_percentage_202425,
                        'Unclassified': school.unclassified_percentage_202425
                      };
                      
                      // Convert to array and filter out ethnicities with 0 or no data
                      const ethnicities = Object.entries(ethnicityMapping)
                        .map(([name, percentage]) => ({
                          name,
                          percentage: percentage || 0
                        }))
                        .filter(eth => eth.percentage > 0)
                        .sort((a, b) => b.percentage - a.percentage);
                      
                      return ethnicities.map((ethnicity, index) => (
                        <tr key={index} className="border-b border-gray-100 last:border-b-0">
                          <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-1/3">{ethnicity.name}</td>
                          <td className="py-2 pl-1 pr-4 text-gray-800">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${Math.min(ethnicity.percentage, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium min-w-[3rem]">{ethnicity.percentage.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Ofsted Inspections Section */}
          {inspection && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <span className="w-1 h-8 bg-yellow-600 rounded"></span>
                Ofsted Inspections
              </h2>
              
              {/* Latest Inspection Table - Exact same as map card but larger */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
                <div className="bg-gray-200 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800">Latest Inspection</h3>
                </div>
                <div className="overflow-visible">
                  <table className="w-full text-sm md:text-base">
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-2/5">Ofsted Overall Rating:</td>
                        <td className="py-2 pl-1 pr-4 text-gray-800">
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 text-sm font-medium rounded ${getRatingColor(getOfstedRatingText(inspection.outcome))}`}>
                              {getOfstedRatingText(inspection.outcome)}
                            </span>
                            {getOfstedRatingText(inspection.outcome) === 'Not Available' && (
                              <a 
                                href="/schoolchecker-rating" 
                                className="text-blue-600 hover:text-blue-800 text-xs underline ml-2"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Why?
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                      {(() => {
                        const ofstedRating = getOfstedRatingText(inspection.outcome);
                        // Only show SchoolChecker.io rating if Ofsted rating is "Not Available"
                        if (ofstedRating === 'Not Available') {
                          const schoolcheckerRating = calculateSchoolCheckerRating(inspection);
                          if (schoolcheckerRating) {
                            const ratingInfo = getRatingInfo(schoolcheckerRating.rating);
                            return (
                              <tr className="border-b border-gray-100">
                                <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-2/5">Schoolchecker.io Rating:</td>
                                <td className="py-2 pl-1 pr-4 text-gray-800">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={`px-3 py-1 text-sm font-medium rounded ${ratingInfo.color}`}>
                                      {ratingInfo.text}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      ({schoolcheckerRating.isCalculated ? 'calculated' : 'official'})
                                    </span>
                                    <a 
                                      href="/schoolchecker-rating" 
                                      className="text-blue-600 hover:text-blue-800 text-xs underline"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      How?
                                    </a>
                                  </div>
                                </td>
                              </tr>
                            );
                          }
                        }
                        return null;
                      })()}
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-2/5">Inspection Date:</td>
                        <td className="py-2 pl-1 pr-4 text-gray-800">{new Date(inspection.inspection_date).toLocaleDateString()}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-2/5">All Inspections:</td>
                        <td className="py-2 pl-1 pr-4 text-gray-800">
                          <a 
                            href={`https://reports.ofsted.gov.uk/provider/28/${school.urn}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            View on Ofsted Website
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Category Judgements Table - Exact same as map card but larger */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
                <div className="bg-gray-200 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800">Category Judgements</h3>
                </div>
                <div className="overflow-visible">
                  <table className="w-full text-sm md:text-base">
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-2/5">The quality of education</td>
                        <td className="py-2 pl-1 pr-4 text-gray-800">
                          <span className={`px-3 py-1 text-sm font-medium rounded ${getRatingColor(getOfstedRatingText(inspection.quality_of_education))}`}>
                            {getOfstedRatingText(inspection.quality_of_education)}
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-2/5">Behaviour and attitudes</td>
                        <td className="py-2 pl-1 pr-4 text-gray-800">
                          <span className={`px-3 py-1 text-sm font-medium rounded ${getRatingColor(getOfstedRatingText(inspection.behaviour_and_attitudes))}`}>
                            {getOfstedRatingText(inspection.behaviour_and_attitudes)}
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-2/5">Personal development</td>
                        <td className="py-2 pl-1 pr-4 text-gray-800">
                          <span className={`px-3 py-1 text-sm font-medium rounded ${getRatingColor(getOfstedRatingText(inspection.personal_development))}`}>
                            {getOfstedRatingText(inspection.personal_development)}
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-2 px-4 pr-1 text-gray-800 border-r border-gray-200 font-medium w-2/5">Leadership and management</td>
                        <td className="py-2 pl-1 pr-4 text-gray-800">
                          <span className={`px-3 py-1 text-sm font-medium rounded ${getRatingColor(getOfstedRatingText(inspection.effectiveness_of_leadership))}`}>
                            {getOfstedRatingText(inspection.effectiveness_of_leadership)}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Primary Results Section */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-1 h-8 bg-red-600 rounded"></span>
              Primary Results
            </h2>
            <PrimaryResultsCard schoolData={school} />
          </div>

          {/* Admissions Section */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-1 h-8 bg-blue-600 rounded"></span>
              Admissions
            </h2>
            
            
            <AdmissionsCard 
              urn={school.urn} 
              schoolName={school.establishmentname}
              phase={school.phaseofeducation__name_}
              preloadedData={admissionsData}
            />
          </div>

        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('Error in SchoolPage:', error);
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Error Loading School</h1>
            <p className="text-lg text-gray-600">There was an error loading the school information.</p>
            <p className="text-sm text-gray-500 mt-2">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </div>
      </div>
    );
  }
}
