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
    const schoolName = searchParams.get('schoolName');
    const phase = searchParams.get('phase') || 'Primary';
    const year = searchParams.get('year') || '202526';

    if (!urn && !schoolName) {
      return NextResponse.json({ error: 'URN or school name is required' }, { status: 400 });
    }

    // Get admissions data for the school
    let query = supabase
      .from('admissions')
      .select('*')
      .eq('school_phase', phase)
      .eq('time_period', year);

    if (urn) {
      query = query.eq('school_urn', urn);
    } else if (schoolName) {
      query = query.ilike('school_name', `%${schoolName}%`);
    }

    const { data: admissionsDataArray, error } = await query.limit(1);

    if (error) {
      console.error('Error fetching admissions data:', error);
      return NextResponse.json({ error: 'Admissions data not found' }, { status: 404 });
    }

    if (!admissionsDataArray || admissionsDataArray.length === 0) {
      return NextResponse.json({ error: 'No admissions data found for this school' }, { status: 404 });
    }

    const admissionsData = admissionsDataArray[0];

    // Calculate additional metrics
    const isOversubscribed = admissionsData.times_put_as_1st_preference > admissionsData.number_1st_preference_offers;
    const oversubscriptionRate = admissionsData.times_put_as_1st_preference > 0 
      ? ((admissionsData.times_put_as_1st_preference - admissionsData.number_1st_preference_offers) / admissionsData.number_1st_preference_offers * 100)
      : 0;

    const successRate = admissionsData.times_put_as_1st_preference > 0
      ? (admissionsData.number_1st_preference_offers / admissionsData.times_put_as_1st_preference * 100)
      : 0;

    const competitionRatio = admissionsData.total_places_offered > 0
      ? (admissionsData.times_put_as_any_preferred_school / admissionsData.total_places_offered)
      : 0;

    // Format the response to match Locrating's structure
    const response = {
      school_name: admissionsData.school_name,
      school_urn: admissionsData.school_urn,
      la_name: admissionsData.la_name,
      school_phase: admissionsData.school_phase,
      time_period: admissionsData.time_period,
      
      // Oversubscription status
      is_oversubscribed: isOversubscribed,
      oversubscription_rate: Math.round(oversubscriptionRate * 100) / 100,
      
      // Application data
      total_applications: admissionsData.times_put_as_any_preferred_school,
      first_preference_applications: admissionsData.times_put_as_1st_preference,
      second_preference_applications: admissionsData.times_put_as_2nd_preference,
      third_preference_applications: admissionsData.times_put_as_3rd_preference,
      applications_from_another_la: admissionsData.applications_from_another_la,
      
      // Offer data
      total_offers: admissionsData.total_places_offered,
      first_preference_offers: admissionsData.number_1st_preference_offers,
      second_preference_offers: admissionsData.number_2nd_preference_offers,
      third_preference_offers: admissionsData.number_3rd_preference_offers,
      total_preferred_offers: admissionsData.number_preferred_offers,
      offers_to_another_la: admissionsData.offers_to_another_la,
      
      // Calculated metrics
      success_rate: Math.round(successRate * 100) / 100,
      competition_ratio: Math.round(competitionRatio * 100) / 100,
      
      // School details
      establishment_type: admissionsData.establishment_type,
      denomination: admissionsData.denomination,
      admissions_policy: admissionsData.admissions_policy,
      fsm_eligible_percent: admissionsData.fsm_eligible_percent,
      urban_rural: admissionsData.urban_rural,
      allthrough_school: admissionsData.allthrough_school,
      
      // Proportions
      proportion_1stprefs_v_1stprefoffers: admissionsData.proportion_1stprefs_v_1stprefoffers,
      proportion_1stprefs_v_totaloffers: admissionsData.proportion_1stprefs_v_totaloffers
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in admissions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
