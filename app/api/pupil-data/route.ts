import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/pupil-data
 * 
 * Get pupil data for a specific school
 * 
 * Query parameters:
 * - urn: School URN (required)
 * - year: Academic year (optional, defaults to 202425)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urn = searchParams.get('urn');
    const year = searchParams.get('year') || '202425';

    if (!urn) {
      return NextResponse.json(
        { error: 'URN parameter is required' },
        { status: 400 }
      );
    }

    // Get pupil data from schools table
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select(`
        urn,
        establishmentname,
        pupils_202425,
        boys_202425,
        girls_202425,
        fte_pupils_202425,
        fsm_202425,
        fsm_percentage_202425,
        english_first_language_202425,
        english_first_language_percentage_202425,
        other_language_202425,
        other_language_percentage_202425,
        unclassified_language_202425,
        unclassified_language_percentage_202425,
        white_british_202425,
        white_british_percentage_202425,
        white_irish_202425,
        white_irish_percentage_202425,
        white_other_202425,
        white_other_percentage_202425,
        mixed_202425,
        mixed_percentage_202425,
        asian_indian_202425,
        asian_indian_percentage_202425,
        asian_pakistani_202425,
        asian_pakistani_percentage_202425,
        asian_bangladeshi_202425,
        asian_bangladeshi_percentage_202425,
        asian_other_202425,
        asian_other_percentage_202425,
        black_caribbean_202425,
        black_caribbean_percentage_202425,
        black_african_202425,
        black_african_percentage_202425,
        black_other_202425,
        black_other_percentage_202425,
        chinese_202425,
        chinese_percentage_202425,
        other_ethnicity_202425,
        other_ethnicity_percentage_202425,
        unclassified_ethnicity_202425,
        unclassified_ethnicity_percentage_202425,
        male_boarders_202425,
        female_boarders_202425,
        total_boarders_202425,
        young_carers_202425,
        young_carers_percentage_202425,
        pupil_data_source_202425,
        pupil_data_updated_202425
      `)
      .eq('urn', urn)
      .single();

    if (schoolError) {
      console.error('Error fetching school data:', schoolError);
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    if (!schoolData) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Get year group breakdowns
    const { data: yearGroups } = await supabase
      .from('pupil_cohorts')
      .select('*')
      .eq('school_urn', urn)
      .eq('academic_year', year)
      .order('year_group');

    // Get detailed ethnicity data
    const { data: ethnicities } = await supabase
      .from('pupil_ethnicities')
      .select('*')
      .eq('school_urn', urn)
      .eq('academic_year', year)
      .order('pupil_count', { ascending: false });

    // Get class size data
    const { data: classSizes } = await supabase
      .from('class_sizes')
      .select('*')
      .eq('school_urn', urn)
      .eq('academic_year', year)
      .order('class_type');

    // Structure the response
    const response = {
      school: {
        urn: schoolData.urn,
        name: schoolData.establishmentname,
        academicYear: year,
        dataSource: schoolData.pupil_data_source_202425,
        lastUpdated: schoolData.pupil_data_updated_202425
      },
      summary: {
        totalPupils: schoolData.pupils_202425,
        boys: schoolData.boys_202425,
        girls: schoolData.girls_202425,
        ftePupils: schoolData.fte_pupils_202425,
        fsmCount: schoolData.fsm_202425,
        fsmPercentage: schoolData.fsm_percentage_202425,
        boarders: {
          male: schoolData.male_boarders_202425,
          female: schoolData.female_boarders_202425,
          total: schoolData.total_boarders_202425
        },
        youngCarers: {
          count: schoolData.young_carers_202425,
          percentage: schoolData.young_carers_percentage_202425
        }
      },
      language: {
        englishFirstLanguage: {
          count: schoolData.english_first_language_202425,
          percentage: schoolData.english_first_language_percentage_202425
        },
        otherLanguage: {
          count: schoolData.other_language_202425,
          percentage: schoolData.other_language_percentage_202425
        },
        unclassified: {
          count: schoolData.unclassified_language_202425,
          percentage: schoolData.unclassified_language_percentage_202425
        }
      },
      ethnicity: {
        whiteBritish: {
          count: schoolData.white_british_202425,
          percentage: schoolData.white_british_percentage_202425
        },
        whiteIrish: {
          count: schoolData.white_irish_202425,
          percentage: schoolData.white_irish_percentage_202425
        },
        whiteOther: {
          count: schoolData.white_other_202425,
          percentage: schoolData.white_other_percentage_202425
        },
        mixed: {
          count: schoolData.mixed_202425,
          percentage: schoolData.mixed_percentage_202425
        },
        asianIndian: {
          count: schoolData.asian_indian_202425,
          percentage: schoolData.asian_indian_percentage_202425
        },
        asianPakistani: {
          count: schoolData.asian_pakistani_202425,
          percentage: schoolData.asian_pakistani_percentage_202425
        },
        asianBangladeshi: {
          count: schoolData.asian_bangladeshi_202425,
          percentage: schoolData.asian_bangladeshi_percentage_202425
        },
        asianOther: {
          count: schoolData.asian_other_202425,
          percentage: schoolData.asian_other_percentage_202425
        },
        blackCaribbean: {
          count: schoolData.black_caribbean_202425,
          percentage: schoolData.black_caribbean_percentage_202425
        },
        blackAfrican: {
          count: schoolData.black_african_202425,
          percentage: schoolData.black_african_percentage_202425
        },
        blackOther: {
          count: schoolData.black_other_202425,
          percentage: schoolData.black_other_percentage_202425
        },
        chinese: {
          count: schoolData.chinese_202425,
          percentage: schoolData.chinese_percentage_202425
        },
        otherEthnicity: {
          count: schoolData.other_ethnicity_202425,
          percentage: schoolData.other_ethnicity_percentage_202425
        },
        unclassified: {
          count: schoolData.unclassified_ethnicity_202425,
          percentage: schoolData.unclassified_ethnicity_percentage_202425
        }
      },
      yearGroups: yearGroups || [],
      detailedEthnicities: ethnicities || [],
      classSizes: classSizes || []
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in pupil-data API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
