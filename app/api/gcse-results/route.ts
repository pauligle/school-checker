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

    if (!urn) {
      return NextResponse.json({ error: 'URN is required' }, { status: 400 });
    }

    // Fetch GCSE results for the school
    const { data: gcseResults, error: gcseError } = await supabase
      .from('gcse_results')
      .select('*')
      .eq('urn', urn)
      .eq('academic_year', academicYear)
      .single();

    if (gcseError) {
      console.error('Error fetching GCSE results:', gcseError);
      return NextResponse.json({ error: 'Failed to fetch GCSE results' }, { status: 500 });
    }

    if (!gcseResults) {
      return NextResponse.json({ error: 'No GCSE results found' }, { status: 404 });
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
    }

    // Fetch LA averages
    const { data: laAverages, error: laError } = await supabase
      .from('gcse_la_averages')
      .select('*')
      .eq('la_code', gcseResults.lea_code)
      .eq('academic_year', academicYear)
      .single();

    if (laError) {
      console.error('Error fetching LA averages:', laError);
    }

    // Fetch England averages
    const { data: englandAverages, error: englandError } = await supabase
      .from('gcse_england_averages')
      .select('*')
      .eq('academic_year', academicYear)
      .single();

    if (englandError) {
      console.error('Error fetching England averages:', englandError);
    }

    // Calculate comparisons
    const comparisons = {
      attainment8: {
        vsEngland: gcseResults.attainment8_score && englandAverages?.attainment8_avg 
          ? gcseResults.attainment8_score - englandAverages.attainment8_avg 
          : null,
        vsLA: gcseResults.attainment8_score && laAverages?.attainment8_avg 
          ? gcseResults.attainment8_score - laAverages.attainment8_avg 
          : null
      },
      progress8: {
        vsEngland: gcseResults.progress8_score && englandAverages?.progress8_avg 
          ? gcseResults.progress8_score - englandAverages.progress8_avg 
          : null,
        vsLA: gcseResults.progress8_score && laAverages?.progress8_avg 
          ? gcseResults.progress8_score - laAverages.progress8_avg 
          : null
      },
      grade5EngMaths: {
        vsEngland: gcseResults.grade5_eng_maths_percent && englandAverages?.grade5_eng_maths_avg 
          ? gcseResults.grade5_eng_maths_percent - englandAverages.grade5_eng_maths_avg 
          : null,
        vsLA: gcseResults.grade5_eng_maths_percent && laAverages?.grade5_eng_maths_avg 
          ? gcseResults.grade5_eng_maths_percent - laAverages.grade5_eng_maths_avg 
          : null
      },
      ebacc: {
        vsEngland: gcseResults.ebacc_average_point_score && englandAverages?.ebacc_avg_point_score 
          ? gcseResults.ebacc_average_point_score - englandAverages.ebacc_avg_point_score 
          : null,
        vsLA: gcseResults.ebacc_average_point_score && laAverages?.ebacc_avg_point_score 
          ? gcseResults.ebacc_average_point_score - laAverages.ebacc_avg_point_score 
          : null
      }
    };

    const response = {
      school: gcseResults,
      rankings: rankings || null,
      comparisons,
      laAverages: laAverages || null,
      englandAverages: englandAverages || null,
      academicYear
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in GCSE results API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
