import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const urn = searchParams.get('urn');
  const year = searchParams.get('year') || '2024';

  if (!urn) {
    return NextResponse.json({ error: 'URN is required' }, { status: 400 });
  }

  try {
    // First, get the school's LA code from primary_results
    const { data: schoolData, error: schoolError } = await supabase
      .from('primary_results')
      .select('lea_code')
      .eq('urn', parseInt(urn))
      .eq('data_year', parseInt(year))
      .single();

    if (schoolError || !schoolData) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const leaCode = schoolData.lea_code;

    // Get LA name from la_averages table
    const { data: laData, error: laNameError } = await supabase
      .from('la_averages')
      .select('lea_name')
      .eq('lea_code', leaCode)
      .eq('data_year', parseInt(year))
      .single();

    const leaName = laData?.lea_name || `LA ${leaCode}`;

    // Get all schools in the same LA for the same year
    const rwmExpColumn = `rwm_exp_${year}`;
    const rwmHighColumn = `rwm_high_${year}`;
    const gpsExpColumn = `gps_exp_${year}`;
    const gpsHighColumn = `gps_high_${year}`;
    
    const { data: laSchools, error: laError } = await supabase
      .from('primary_results')
      .select(`urn, ${rwmExpColumn}, ${rwmHighColumn}, ${gpsExpColumn}, ${gpsHighColumn}`)
      .eq('lea_code', leaCode)
      .eq('data_year', parseInt(year))
      .not(rwmExpColumn, 'is', null);

    if (laError) {
      console.error('Error fetching LA schools:', laError);
      return NextResponse.json({ error: 'Failed to fetch LA schools' }, { status: 500 });
    }

    if (!laSchools || laSchools.length === 0) {
      return NextResponse.json({ error: 'No schools found in LA' }, { status: 404 });
    }

    // Sort schools using the same methodology as national rankings
    laSchools.sort((a, b) => {
      const aExpected = a[rwmExpColumn] || 0;
      const bExpected = b[rwmExpColumn] || 0;
      const aHigher = a[rwmHighColumn] || 0;
      const bHigher = b[rwmHighColumn] || 0;
      
      // 1. Primary: RWM Expected percentage (descending)
      if (bExpected !== aExpected) {
        return bExpected - aExpected;
      }
      
      // 2. Secondary: RWM Higher percentage (descending)
      if (bHigher !== aHigher) {
        return bHigher - aHigher;
      }
      
      // 3. Tertiary: Gap between Expected and Higher (ascending - smaller gap = better consistency)
      const aGap = aExpected - aHigher;
      const bGap = bExpected - bHigher;
      if (aGap !== bGap) {
        return aGap - bGap; // Smaller gap ranks higher
      }
      
      // 4. Quaternary: GPS Expected percentage (descending - for final tie-breaking)
      const aGPS = a[gpsExpColumn] || 0;
      const bGPS = b[gpsExpColumn] || 0;
      if (bGPS !== aGPS) {
        return bGPS - aGPS;
      }
      
      // 5. Quinary: GPS Higher percentage (descending - for extra accuracy)
      const aGPSHigher = a[gpsHighColumn] || 0;
      const bGPSHigher = b[gpsHighColumn] || 0;
      if (bGPSHigher !== aGPSHigher) {
        return bGPSHigher - aGPSHigher;
      }
      
      // If all criteria are identical, schools are considered tied
      return 0;
    });

    // Find the school's rank in the LA
    const schoolIndex = laSchools.findIndex(school => school.urn === parseInt(urn));
    
    if (schoolIndex === -1) {
      return NextResponse.json({ error: 'School not found in LA ranking' }, { status: 404 });
    }

    // Calculate LA rank (1-based)
    const laRank = schoolIndex + 1;
    const totalLaSchools = laSchools.length;

    return NextResponse.json({
      la_rank: laRank,
      total_la_schools: totalLaSchools,
      la_name: leaName,
      la_code: leaCode,
      year: parseInt(year),
      top_schools: laSchools.slice(0, 8).map((school, index) => ({
        urn: school.urn,
        school_name: school.school_name,
        la_rank: index + 1,
        rwm_exp_2024: school[rwmExpColumn],
        rwm_high_2024: school[rwmHighColumn],
        gps_exp_2024: school[gpsExpColumn],
        gps_high_2024: school[gpsHighColumn],
        gap: (school[rwmExpColumn] || 0) - (school[rwmHighColumn] || 0)
      }))
    });

  } catch (error) {
    console.error('Error in LA rankings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
