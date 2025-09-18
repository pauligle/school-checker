import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urn = searchParams.get('urn');

    if (!urn) {
      return NextResponse.json({ error: 'URN parameter is required' }, { status: 400 });
    }

    // Get all available years for this school that have meaningful data
    const { data: yearsData, error } = await supabase
      .from('primary_results')
      .select('data_year, rwm_expected_percentage, reading_average_score, maths_average_score')
      .eq('urn', urn)
      .order('data_year', { ascending: false });

    if (error) {
      console.error('Error fetching available years:', error);
      return NextResponse.json({ error: 'Failed to fetch available years' }, { status: 500 });
    }

    // Filter out years where all key metrics are null
    const yearsWithData = yearsData?.filter(row => 
      row.rwm_expected_percentage !== null || 
      row.reading_average_score !== null || 
      row.maths_average_score !== null
    ) || [];

    const years = yearsWithData.map(row => row.data_year.toString());

    return NextResponse.json({ years });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




