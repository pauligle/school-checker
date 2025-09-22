import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academic_year') || '2023-24';
    const laCode = searchParams.get('la_code');

    // Fetch England averages
    const { data: englandAverages, error: englandError } = await supabase
      .from('gcse_england_averages')
      .select('*')
      .eq('academic_year', academicYear)
      .single();

    if (englandError) {
      console.error('Error fetching England averages:', englandError);
      return NextResponse.json({ error: 'Failed to fetch England averages' }, { status: 500 });
    }

    let laAverages = null;
    if (laCode) {
      // Fetch specific LA averages
      const { data: laData, error: laError } = await supabase
        .from('gcse_la_averages')
        .select('*')
        .eq('la_code', laCode)
        .eq('academic_year', academicYear)
        .single();

      if (laError) {
        console.error('Error fetching LA averages:', laError);
      } else {
        laAverages = laData;
      }
    } else {
      // Fetch all LA averages
      const { data: allLaData, error: allLaError } = await supabase
        .from('gcse_la_averages')
        .select('*')
        .eq('academic_year', academicYear)
        .order('attainment8_avg', { ascending: false });

      if (allLaError) {
        console.error('Error fetching all LA averages:', allLaError);
      } else {
        laAverages = allLaData;
      }
    }

    const response = {
      englandAverages: englandAverages || null,
      laAverages: laAverages,
      academicYear
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in GCSE averages API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
