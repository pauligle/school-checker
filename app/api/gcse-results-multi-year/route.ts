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
    const year = searchParams.get('year');

    if (!urn) {
      return NextResponse.json({ error: 'URN is required' }, { status: 400 });
    }

    const academicYear = year ? parseInt(year) : 2024; // Default to latest year
    const urnInt = parseInt(urn); // Convert URN to integer

    // Fetch school data for the specific year
    const { data: schoolData, error: schoolError } = await supabase
      .from('gcse_results_multi_year')
      .select('*')
      .eq('urn', urnInt)
      .eq('academic_year', academicYear)
      .single();

    if (schoolError || !schoolData) {
      return NextResponse.json({ 
        error: 'School data not found for this year',
        details: schoolError?.message 
      }, { status: 404 });
    }

    // Fetch rankings for the school
    const { data: rankings, error: rankingsError } = await supabase
      .from('gcse_rankings_multi_year')
      .select('*')
      .eq('urn', urnInt)
      .eq('academic_year', academicYear)
      .single();

    // Fetch LA averages
    const { data: laAverages, error: laError } = await supabase
      .from('gcse_averages_multi_year')
      .select('*')
      .eq('academic_year', academicYear)
      .eq('lea_code', schoolData.lea_code)
      .single();

    // Fetch England averages
    const { data: englandAverages, error: englandError } = await supabase
      .from('gcse_averages_multi_year')
      .select('*')
      .eq('academic_year', academicYear)
      .is('lea_code', null)
      .single();

    return NextResponse.json({
      school: schoolData,
      rankings: rankings || null,
      laAverages: laAverages || null,
      englandAverages: englandAverages || null,
      academicYear
    });

  } catch (error) {
    console.error('Error fetching multi-year GCSE data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
