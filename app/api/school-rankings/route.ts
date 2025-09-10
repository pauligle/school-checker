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

    // If year specified, return single ranking
    if (year) {
      return NextResponse.json({ ranking: data[0] });
    }

    // If no year specified, return all years
    return NextResponse.json({ rankings: data });

  } catch (error) {
    console.error('Error in school rankings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
