import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import StructuredData from '@/components/StructuredData';
import SchoolPageClientWrapper from '@/components/SchoolPageClientWrapper';

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
  gcseData: any | null;
  gcseMultiYearData: any | null;
  parentViewData: any | null;
}> {
  try {
    console.log('🔍 getSchoolData called with slug:', slug);
    // Extract URN from slug (format: school-name-urn)
    const urn = slug.split('-').pop();
    console.log('🔍 Extracted URN:', urn);
    if (!urn || isNaN(Number(urn))) {
      console.log('❌ Invalid URN:', urn);
      return { school: null, inspection: null, ranking: null, laRanking: null, admissionsData: null, gcseData: null, gcseMultiYearData: null, parentViewData: null };
    }

    // Get school data
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('urn', urn)
      .single();

    if (schoolError || !schoolData) {
      return { school: null, inspection: null, ranking: null, laRanking: null, admissionsData: null, gcseData: null, gcseMultiYearData: null, parentViewData: null };
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
              // Get the best school in this LA (first in the sorted list)
              const bestSchool = schoolsWithRankings.length > 0 ? schoolsWithRankings[0] : null;
              
              laRankingData = {
                la_rank: currentRank,
                total_la_schools: schoolsWithRankings.length,
                la_name: schoolData.la__name_,
                la_code: schoolData.la__code_,
                year: 2024,
                bestSchoolName: bestSchool?.establishmentname || null,
                bestSchoolUrn: bestSchool?.urn || null
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

    // Get GCSE data for secondary schools
    let gcseData = null;
    if (schoolData.phaseofeducation__name_ === '16 plus' || 
        schoolData.phaseofeducation__name_ === 'Secondary' || 
        schoolData.phaseofeducation__name_ === 'All-through') {
      try {
        // Fetch GCSE results for the school
        const { data: gcseResults, error: gcseError } = await supabase
          .from('gcse_results')
          .select('*')
          .eq('urn', urn)
          .eq('academic_year', '2023-24')
          .single();

        if (!gcseError && gcseResults) {
          // Fetch rankings for the school
          const { data: rankings } = await supabase
            .from('gcse_rankings')
            .select('*')
            .eq('urn', urn)
            .eq('academic_year', '2023-24')
            .single();

          // Fetch LA averages
          const { data: laAverages } = await supabase
            .from('gcse_la_averages')
            .select('*')
            .eq('la_code', schoolData.lea_code)
            .eq('academic_year', '2023-24')
            .single();

          // Fetch England averages
          const { data: englandAverages } = await supabase
            .from('gcse_england_averages')
            .select('*')
            .eq('academic_year', '2023-24')
            .single();

          gcseData = {
            school: gcseResults,
            rankings: rankings || null,
            laAverages: laAverages || null,
            englandAverages: englandAverages || null,
            academicYear: '2023-24'
          };
        }
      } catch (error) {
        console.error('Error fetching GCSE data:', error);
      }
    }

    // Get multi-year GCSE data for secondary schools
    let gcseMultiYearData = null;
    if (schoolData.phaseofeducation__name_ === '16 plus' || 
        schoolData.phaseofeducation__name_ === 'Secondary' || 
        schoolData.phaseofeducation__name_ === 'All-through') {
      try {
        // Fetch available years
        const { data: yearsData } = await supabase
          .from('gcse_results_multi_year')
          .select('academic_year')
          .eq('urn', urn)
          .order('academic_year', { ascending: false });

        if (yearsData && yearsData.length > 0) {
          const uniqueYears = [...new Set(yearsData.map(item => item.academic_year))];
          const yearsWithNotes = uniqueYears.map(year => ({
            year,
            hasData: true,
            covidNote: year === 2020 || year === 2021 ? 
              'Results for this year were significantly impacted by the COVID-19 pandemic. Exams were cancelled and grades were awarded through teacher assessment.' : 
              null
          }));

          gcseMultiYearData = {
            years: yearsWithNotes,
            defaultYear: Math.max(...uniqueYears)
          };
        }
      } catch (error) {
        console.error('Error fetching multi-year GCSE data:', error);
      }
    }

    // Get Parent View data
    let parentViewData = null;
    try {
      // Fetch available years for Parent View
      const { data: parentViewYears } = await supabase
        .from('parent_view_data')
        .select('data_date')
        .eq('urn', urn)
        .order('data_date', { ascending: false });

      if (parentViewYears && parentViewYears.length > 0) {
        const availableYears = parentViewYears.map(year => ({ dataDate: year.data_date }));
        const selectedYear = availableYears[0].dataDate;

        // Fetch Parent View data for the most recent year
        const { data: parentViewResults } = await supabase
          .from('parent_view_data')
          .select('*')
          .eq('urn', urn)
          .eq('data_date', selectedYear)
          .single();

        if (parentViewResults) {
          // Transform the data into the same format as the API
          const transformedData = {
            urn: parentViewResults.urn,
            schoolName: parentViewResults.school_name,
            localAuthority: parentViewResults.local_authority,
            ofstedRegion: parentViewResults.ofsted_region,
            ofstedPhase: parentViewResults.ofsted_phase,
            submissions: parentViewResults.submissions,
            responseRate: parentViewResults.response_rate,
            dataDate: parentViewResults.data_date,
            
            questions: {
              q1: {
                question: "My child is happy at this school",
                responses: {
                  stronglyAgree: parentViewResults.q1_strongly_agree,
                  agree: parentViewResults.q1_agree,
                  disagree: parentViewResults.q1_disagree,
                  stronglyDisagree: parentViewResults.q1_strongly_disagree,
                  dontKnow: parentViewResults.q1_dont_know
                }
              },
              q2: {
                question: "My child feels safe at this school",
                responses: {
                  stronglyAgree: parentViewResults.q2_strongly_agree,
                  agree: parentViewResults.q2_agree,
                  disagree: parentViewResults.q2_disagree,
                  stronglyDisagree: parentViewResults.q2_strongly_disagree,
                  dontKnow: parentViewResults.q2_dont_know
                }
              },
              q3: {
                question: "The school makes sure its pupils are well behaved",
                responses: {
                  stronglyAgree: parentViewResults.q3_strongly_agree,
                  agree: parentViewResults.q3_agree,
                  disagree: parentViewResults.q3_disagree,
                  stronglyDisagree: parentViewResults.q3_strongly_disagree,
                  dontKnow: parentViewResults.q3_dont_know
                }
              },
              q4: {
                question: "My child has been bullied and the school dealt with the bullying effectively",
                responses: {
                  stronglyAgree: parentViewResults.q4_strongly_agree,
                  agree: parentViewResults.q4_agree,
                  disagree: parentViewResults.q4_disagree,
                  stronglyDisagree: parentViewResults.q4_strongly_disagree,
                  dontKnow: parentViewResults.q4_dont_know,
                  notApplicable: parentViewResults.q4_not_applicable
                }
              },
              q5: {
                question: "The school makes me aware of what my child will learn during the year",
                responses: {
                  stronglyAgree: parentViewResults.q5_strongly_agree,
                  agree: parentViewResults.q5_agree,
                  disagree: parentViewResults.q5_disagree,
                  stronglyDisagree: parentViewResults.q5_strongly_disagree,
                  dontKnow: parentViewResults.q5_dont_know
                }
              },
              q6: {
                question: "When I have raised concerns with the school they have been dealt with properly",
                responses: {
                  stronglyAgree: parentViewResults.q6_strongly_agree,
                  agree: parentViewResults.q6_agree,
                  disagree: parentViewResults.q6_disagree,
                  stronglyDisagree: parentViewResults.q6_strongly_disagree,
                  dontKnow: parentViewResults.q6_dont_know,
                  notApplicable: parentViewResults.q6_not_applicable
                }
              },
              q8: {
                question: "The school has high expectations for my child",
                responses: {
                  stronglyAgree: parentViewResults.q8_strongly_agree,
                  agree: parentViewResults.q8_agree,
                  disagree: parentViewResults.q8_disagree,
                  stronglyDisagree: parentViewResults.q8_strongly_disagree,
                  dontKnow: parentViewResults.q8_dont_know
                }
              },
              q9: {
                question: "My child does well at this school",
                responses: {
                  stronglyAgree: parentViewResults.q9_strongly_agree,
                  agree: parentViewResults.q9_agree,
                  disagree: parentViewResults.q9_disagree,
                  stronglyDisagree: parentViewResults.q9_strongly_disagree,
                  dontKnow: parentViewResults.q9_dont_know
                }
              },
              q10: {
                question: "The school lets me know how my child is doing",
                responses: {
                  stronglyAgree: parentViewResults.q10_strongly_agree,
                  agree: parentViewResults.q10_agree,
                  disagree: parentViewResults.q10_disagree,
                  stronglyDisagree: parentViewResults.q10_strongly_disagree,
                  dontKnow: parentViewResults.q10_dont_know
                }
              },
              q11: {
                question: "There is a good range of subjects available to my child at this school",
                responses: {
                  stronglyAgree: parentViewResults.q11_strongly_agree,
                  agree: parentViewResults.q11_agree,
                  disagree: parentViewResults.q11_disagree,
                  stronglyDisagree: parentViewResults.q11_strongly_disagree,
                  dontKnow: parentViewResults.q11_dont_know
                }
              },
              q12: {
                question: "My child can take part in clubs and activities at this school",
                responses: {
                  stronglyAgree: parentViewResults.q12_strongly_agree,
                  agree: parentViewResults.q12_agree,
                  disagree: parentViewResults.q12_disagree,
                  stronglyDisagree: parentViewResults.q12_strongly_disagree,
                  dontKnow: parentViewResults.q12_dont_know
                }
              },
              q13: {
                question: "The school supports my child's wider personal development",
                responses: {
                  stronglyAgree: parentViewResults.q13_strongly_agree,
                  agree: parentViewResults.q13_agree,
                  disagree: parentViewResults.q13_disagree,
                  stronglyDisagree: parentViewResults.q13_strongly_disagree,
                  dontKnow: parentViewResults.q13_dont_know
                }
              },
              q14: {
                question: "I would recommend this school to another parent",
                responses: {
                  yes: parentViewResults.q14_yes,
                  no: parentViewResults.q14_no
                }
              }
            }
          };

          parentViewData = {
            parentViewData: transformedData,
            availableYears: availableYears,
            selectedYear: selectedYear
          };
        }
      }
    } catch (error) {
      console.error('Error fetching Parent View data:', error);
    }

    return {
      school: schoolData as SchoolData,
      inspection: inspectionData as InspectionData,
      ranking: rankingData,
      laRanking: laRankingData,
      admissionsData: Object.keys(admissionsData).length > 0 ? admissionsData : null,
      gcseData: gcseData,
      gcseMultiYearData: gcseMultiYearData,
      parentViewData: parentViewData
    };
  } catch (error) {
    console.error('Error fetching school data:', error);
    return { school: null, inspection: null, ranking: null, laRanking: null, admissionsData: null, gcseData: null, gcseMultiYearData: null, parentViewData: null };
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
        'max-image-preview': 'large' as const,
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
    const { school, inspection, ranking, laRanking, admissionsData, gcseData, gcseMultiYearData, parentViewData } = await getSchoolData(slug);

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
              <div className="mt-2 space-y-1">
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

                {/* Best School in LA */}
                <div className="mt-2">
                  <div className="border border-yellow-400/30 bg-yellow-400/10 rounded-lg px-3 py-2 inline-block">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-600 text-sm">⭐</span>
                      <div className="text-xs md:text-sm">
                        <span className="text-gray-200 font-medium">Best School in KS2 Results in {laRanking.la_name}: </span>
                        <Link
                          href={`/school/${createLaSlug(laRanking.bestSchoolName || 'Best School')}-${laRanking.bestSchoolUrn || ''}`}
                          className="text-blue-300 hover:text-blue-100 underline hover:no-underline font-medium"
                        >
                          {laRanking.bestSchoolName || 'Loading...'}
                        </Link>
                        <span className="text-gray-300"> (2024)</span>
            </div>
            </div>
          </div>
        </div>
      </div>
            )}
              </div>
            </div>
          </div>

      {/* Table of Contents */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Page Contents</h2>
            <div className="flex flex-col gap-2 text-sm">
              <a href="#school-details" className="text-blue-600 hover:text-blue-800 underline transition-colors">School Details</a>
              <a href="#pupils-data" className="text-blue-600 hover:text-blue-800 underline transition-colors">Pupils Data</a>
              <a href="#ofsted-inspections" className="text-blue-600 hover:text-blue-800 underline transition-colors">Ofsted Inspections</a>
              <a href="#primary-results" className="text-blue-600 hover:text-blue-800 underline transition-colors">Primary Results</a>
              <a href="#admissions" className="text-blue-600 hover:text-blue-800 underline transition-colors">Admissions</a>
              <a href="#parent-reviews" className="text-blue-600 hover:text-blue-800 underline transition-colors">Parent Reviews</a>
              {school.phaseofeducation__name_ === 'All-through' && (
                <>
                  <a href="#gcse-results" className="text-blue-600 hover:text-blue-800 underline transition-colors">GCSE Results</a>
                  <a href="#catchment-area" className="text-blue-600 hover:text-blue-800 underline transition-colors">Catchment Area</a>
                  <a href="#a-levels-results" className="text-blue-600 hover:text-blue-800 underline transition-colors">A Levels Results</a>
                  <a href="#subjects" className="text-blue-600 hover:text-blue-800 underline transition-colors">Subjects</a>
                </>
              )}
              </div>
            </div>
            </div>
          </div>

      {/* Client Components */}
      <SchoolPageClientWrapper 
        school={school}
        gcseData={gcseData}
        gcseMultiYearData={gcseMultiYearData}
        parentViewData={parentViewData}
      />

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
