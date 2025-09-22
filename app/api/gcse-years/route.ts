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

    if (!urn) {
      return NextResponse.json({ error: 'URN is required' }, { status: 400 });
    }

    let years = new Set();

    // Check multi-year table
    const { data: multiYearData, error: multiYearError } = await supabase
      .from('gcse_results_multi_year')
      .select('academic_year')
      .eq('urn', urn)
      .order('academic_year', { ascending: false });

    if (multiYearData && multiYearData.length > 0) {
      multiYearData.forEach(item => {
        years.add(item.academic_year);
      });
    }

    // Also check regular GCSE results table
    const { data: regularData, error: regularError } = await supabase
      .from('gcse_results')
      .select('academic_year')
      .eq('urn', urn);

    if (regularData && regularData.length > 0) {
      regularData.forEach(item => {
        // Convert academic_year format (e.g., "2023-24" to 2024)
        const academicYear = item.academic_year;
        const year = academicYear.includes('-') ? 
          parseInt('20' + academicYear.split('-')[1]) : // "2023-24" -> 2024
          parseInt(academicYear); // Direct year format
        years.add(year);
      });
    }

    // Convert Set to array and format
    const yearsArray = Array.from(years)
      .sort((a: number, b: number) => b - a) // Sort descending (newest first)
      .map(year => ({
        year,
        hasData: true,
        covidNote: year === 2020 || year === 2021 ? 
          'Results for this year were significantly impacted by the COVID-19 pandemic. Exams were cancelled and grades were awarded through teacher assessment.' : 
          null
      }));

    if (yearsArray.length === 0) {
      return NextResponse.json({ 
        years: [],
        defaultYear: null 
      });
    }

    return NextResponse.json({
      years: yearsArray,
      defaultYear: yearsArray[0].year // Latest year as default
    });

  } catch (error) {
    console.error('Error fetching GCSE years:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
