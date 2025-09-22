import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urn = searchParams.get('urn');
    const academicYear = searchParams.get('academic_year') || '2023-24';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!urn) {
      return NextResponse.json({ error: 'URN is required' }, { status: 400 });
    }

    // Fetch rankings for the school
    const { data: rankings, error: rankingsError } = await supabase
      .from('gcse_rankings')
      .select('*')
      .eq('urn', urn)
      .eq('academic_year', academicYear)
      .single();

    if (rankingsError) {
      console.error('Error fetching rankings:', rankingsError);
      return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 });
    }

    if (!rankings) {
      return NextResponse.json({ error: 'No rankings found' }, { status: 404 });
    }

    // Fetch top schools for each metric
    const topSchoolsPromises = [
      // Top Attainment 8 schools
      supabase
        .from('gcse_rankings')
        .select(`
          *,
          gcse_results!inner(school_name, attainment8_score)
        `)
        .eq('academic_year', academicYear)
        .not('attainment8_rank', 'is', null)
        .order('attainment8_rank', { ascending: true })
        .range(offset, offset + limit - 1),

      // Top Progress 8 schools
      supabase
        .from('gcse_rankings')
        .select(`
          *,
          gcse_results!inner(school_name, progress8_score)
        `)
        .eq('academic_year', academicYear)
        .not('progress8_rank', 'is', null)
        .order('progress8_rank', { ascending: true })
        .range(offset, offset + limit - 1),

      // Top Grade 5 English & Maths schools
      supabase
        .from('gcse_rankings')
        .select(`
          *,
          gcse_results!inner(school_name, grade5_eng_maths_percent)
        `)
        .eq('academic_year', academicYear)
        .not('grade5_eng_maths_rank', 'is', null)
        .order('grade5_eng_maths_rank', { ascending: true })
        .range(offset, offset + limit - 1),

      // Top EBacc schools
      supabase
        .from('gcse_rankings')
        .select(`
          *,
          gcse_results!inner(school_name, ebacc_average_point_score)
        `)
        .eq('academic_year', academicYear)
        .not('ebacc_rank', 'is', null)
        .order('ebacc_rank', { ascending: true })
        .range(offset, offset + limit - 1)
    ];

    const [
      { data: topAttainment8, error: attainment8Error },
      { data: topProgress8, error: progress8Error },
      { data: topGrade5EngMaths, error: grade5Error },
      { data: topEbacc, error: ebaccError }
    ] = await Promise.all(topSchoolsPromises);

    if (attainment8Error) console.error('Error fetching top Attainment 8:', attainment8Error);
    if (progress8Error) console.error('Error fetching top Progress 8:', progress8Error);
    if (grade5Error) console.error('Error fetching top Grade 5:', grade5Error);
    if (ebaccError) console.error('Error fetching top EBacc:', ebaccError);

    const response = {
      schoolRankings: rankings,
      topSchools: {
        attainment8: topAttainment8 || [],
        progress8: topProgress8 || [],
        grade5EngMaths: topGrade5EngMaths || [],
        ebacc: topEbacc || []
      },
      academicYear
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in GCSE rankings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
