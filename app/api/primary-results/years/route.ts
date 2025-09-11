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

    // Get all available years for this school
    const { data: yearsData, error } = await supabase
      .from('primary_results')
      .select('data_year')
      .eq('urn', urn)
      .order('data_year', { ascending: false });

    if (error) {
      console.error('Error fetching available years:', error);
      return NextResponse.json({ error: 'Failed to fetch available years' }, { status: 500 });
    }

    const years = yearsData?.map(row => row.data_year.toString()) || ['2024'];

    return NextResponse.json({ years });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


