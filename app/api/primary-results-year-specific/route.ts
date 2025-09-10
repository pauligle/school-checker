import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urn = searchParams.get('urn');
    const year = searchParams.get('year') || '2024';

    if (!urn) {
      return NextResponse.json({ error: 'URN parameter is required' }, { status: 400 });
    }

    // Get school's primary results with year-specific fields
    console.log('Looking for URN:', urn, 'year:', year);
    
    // Get the record for the specific year
    const { data: primaryResultsList, error: primaryError } = await supabase
      .from('primary_results')
      .select('*')
      .eq('urn', urn)
      .eq('data_year', parseInt(year));
    
    console.log('Query result:', { data: primaryResultsList, error: primaryError });
    
    if (primaryError) {
      console.error('Error fetching primary results:', primaryError);
      return NextResponse.json({ error: 'Failed to fetch primary results' }, { status: 500 });
    }
    
    if (!primaryResultsList || primaryResultsList.length === 0) {
      return NextResponse.json({ error: 'No primary results found for this school and year' }, { status: 404 });
    }
    
    // Use the record for the specific year
    const primaryResults = primaryResultsList[0];
    console.log('Using record for URN:', urn, 'year:', year);

    // Extract year-specific data
    const yearData = {
      reading_average_score: primaryResults[`reading_${year}`],
      maths_average_score: primaryResults[`maths_${year}`],
      gps_average_score: primaryResults[`gps_${year}`],
      rwm_expected_percentage: primaryResults[`rwm_exp_${year}`],
      rwm_higher_percentage: primaryResults[`rwm_high_${year}`],
      gps_expected_percentage: primaryResults[`gps_exp_${year}`],
      gps_higher_percentage: primaryResults[`gps_high_${year}`]
    };

    console.log(`Year-specific data for ${year}:`, yearData);

    // Get Local Authority averages for the same year
    const { data: laAverages } = await supabase
      .from('la_averages')
      .select('*')
      .eq('lea_code', primaryResults.lea_code)
      .eq('data_year', parseInt(year))
      .single();

    // Get England averages for the same year
    const { data: englandAverages } = await supabase
      .from('england_averages')
      .select('*')
      .eq('data_year', parseInt(year))
      .single();

    return NextResponse.json({
      school: {
        ...primaryResults,
        ...yearData,
        data_year: parseInt(year)
      },
      laAverages: laAverages || null,
      englandAverages: englandAverages || null
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
