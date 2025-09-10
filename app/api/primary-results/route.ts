import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urn = searchParams.get('urn');
    const year = searchParams.get('year') || '2024'; // Default to 2024 if no year specified

    if (!urn) {
      return NextResponse.json({ error: 'URN parameter is required' }, { status: 400 });
    }

    // Get school's primary results for the specified year
    const { data: primaryResults, error: primaryError } = await supabase
      .from('primary_results')
      .select('*')
      .eq('urn', urn)
      .eq('data_year', parseInt(year))
      .single();

    if (primaryError) {
      console.error('Error fetching primary results:', primaryError);
      // If no data found, return 404 instead of 500
      if (primaryError.code === 'PGRST116') {
        return NextResponse.json({ error: 'No primary results found for this school and year' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch primary results' }, { status: 500 });
    }

    if (!primaryResults) {
      return NextResponse.json({ error: 'No primary results found for this school and year' }, { status: 404 });
    }

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
      school: primaryResults,
      laAverages: laAverages || null,
      englandAverages: englandAverages || null
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
