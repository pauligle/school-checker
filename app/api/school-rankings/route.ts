import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const urn = searchParams.get('urn');
  const year = searchParams.get('year');

  if (!urn) {
    return NextResponse.json({ error: 'URN is required' }, { status: 400 });
  }

  try {
    // Get the school's ranking data
    let query = supabase
      .from('school_rankings')
      .select('*')
      .eq('urn', parseInt(urn));

    if (year) {
      query = query.eq('data_year', parseInt(year));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching school rankings:', error);
      return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ rankings: [] });
    }

    // If year specified, calculate LA ranking and return enhanced data
    if (year) {
      const schoolRanking = data[0];
      
      // Get school's LA from schools table
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('la__name_, la__code_')
        .eq('urn', parseInt(urn))
        .single();

      console.log('School data:', schoolData, 'Error:', schoolError);

      if (!schoolError && schoolData) {
        // Get all schools in the same LA with rankings for the same year
        const { data: laSchools, error: laError } = await supabase
          .from('schools')
          .select(`
            urn,
            establishmentname,
            la__name_,
            phaseofeducation__name_,
            statutorylowage,
            statutoryhighage
          `)
          .eq('la__name_', schoolData.la__name_)
          .in('phaseofeducation__name_', ['Primary', 'All-through'])
          .not('lat', 'is', null)
          .not('lon', 'is', null);

        if (!laError && laSchools) {
          // Filter out nursery age ranges (same logic as area pages)
          const excludedAgeRanges = ['0-5', '2-4', '2-5', '2-7', '2-9', '2-11', '3-5', '3-7', '4-7', '5-7'];
          const filteredSchools = laSchools.filter(school => {
            if (!school.statutorylowage || !school.statutoryhighage) return false;
            const ageRange = `${school.statutorylowage}-${school.statutoryhighage}`;
            return !excludedAgeRanges.includes(ageRange);
          });

          // Get rankings for these schools
          const schoolUrns = filteredSchools.map(s => s.urn).filter(Boolean);
          const { data: rankings, error: rankingsError } = await supabase
            .from('school_rankings')
            .select('urn, rwm_rank')
            .in('urn', schoolUrns)
            .eq('data_year', parseInt(year));

          if (!rankingsError && rankings) {
            // Create rankings map
            const rankingsMap = {};
            rankings.forEach(ranking => {
              rankingsMap[ranking.urn] = { rwm_rank: ranking.rwm_rank };
            });

            // Only include schools that have ranking data
            const schoolsWithRankings = filteredSchools
              .filter(school => rankingsMap[school.urn])
              .map(school => ({
                ...school,
                ranking: rankingsMap[school.urn]
              }));

            // Sort by ranking
            schoolsWithRankings.sort((a, b) => {
              const aRank = a.ranking.rwm_rank || 999999;
              const bRank = b.ranking.rwm_rank || 999999;
              return aRank - bRank;
            });

            // Find the current school's rank in the LA
            let laRank = null;
            let currentRank = 1;
            for (let i = 0; i < schoolsWithRankings.length; i++) {
              if (schoolsWithRankings[i].urn === parseInt(urn)) {
                laRank = currentRank;
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

            // Add LA ranking data to the response
            if (laRank !== null) {
              schoolRanking.la_rank = laRank;
              schoolRanking.total_la_schools = schoolsWithRankings.length;
              schoolRanking.la_name = schoolData.la__name_;
            }
          }
        }
      }

      return NextResponse.json({ ranking: schoolRanking });
    }

    // If no year specified, return all years
    return NextResponse.json({ rankings: data });

  } catch (error) {
    console.error('Error in school rankings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
