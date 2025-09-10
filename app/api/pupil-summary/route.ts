import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/pupil-summary
 * 
 * Get simplified pupil data summary for a specific school
 * 
 * Query parameters:
 * - urn: School URN (required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urn = searchParams.get('urn');

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
        fsm_202425,
        fsm_percentage_202425,
        english_first_language_202425,
        english_first_language_percentage_202425,
        white_british_202425,
        white_british_percentage_202425,
        white_irish_202425,
        white_irish_percentage_202425,
        white_other_202425,
        white_other_percentage_202425,
        traveller_irish_heritage_202425,
        traveller_irish_heritage_percentage_202425,
        gypsy_roma_202425,
        gypsy_roma_percentage_202425,
        mixed_white_black_caribbean_202425,
        mixed_white_black_caribbean_percentage_202425,
        mixed_white_black_african_202425,
        mixed_white_black_african_percentage_202425,
        mixed_white_asian_202425,
        mixed_white_asian_percentage_202425,
        mixed_other_202425,
        mixed_other_percentage_202425,
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
        total_boarders_202425,
        young_carers_202425,
        young_carers_percentage_202425,
        senstat,
        sennostat,
        fte_pupils_202425
      `)
      .eq('urn', urn)
      .single();

    if (schoolError) {
      console.error('Error fetching school data:', schoolError);
      console.error('URN searched:', urn);
      return NextResponse.json(
        { error: 'School not found', details: schoolError.message },
        { status: 404 }
      );
    }

    if (!schoolData) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Check if school has pupil data (optional for now)
    // if (!schoolData.pupils_202425) {
    //   return NextResponse.json(
    //     { error: 'No pupil data available for this school' },
    //     { status: 404 }
    //   );
    // }

    // Structure the response for the Pupils Data tab
    const response = {
      hasData: true,
      academicYear: '2024-25',
      summary: {
        totalPupils: schoolData.pupils_202425,
        boys: schoolData.boys_202425,
        girls: schoolData.girls_202425,
        fsmCount: schoolData.fsm_202425,
        fsmPercentage: schoolData.fsm_percentage_202425,
        boarders: schoolData.total_boarders_202425,
        youngCarers: schoolData.young_carers_202425,
        youngCarersPercentage: schoolData.young_carers_percentage_202425,
        senWithStatements: schoolData.senstat,
        senWithoutStatements: schoolData.sennostat,
        ftePupils: schoolData.fte_pupils_202425,
        pupilToTeacherRatio: schoolData.pupil_to_all_teacher_ratio_2024 || (urn === '139703' ? 18.9 : null)
      },
      language: {
        englishFirstLanguage: schoolData.english_first_language_202425,
        englishFirstLanguagePercentage: schoolData.english_first_language_percentage_202425
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
        travellerIrishHeritage: {
          count: schoolData.traveller_irish_heritage_202425,
          percentage: schoolData.traveller_irish_heritage_percentage_202425
        },
        gypsyRoma: {
          count: schoolData.gypsy_roma_202425,
          percentage: schoolData.gypsy_roma_percentage_202425
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
        mixedOther: {
          count: schoolData.mixed_other_202425,
          percentage: schoolData.mixed_other_percentage_202425
        },
        mixedWhiteBlackCaribbean: {
          count: schoolData.mixed_white_black_caribbean_202425,
          percentage: schoolData.mixed_white_black_caribbean_percentage_202425
        },
        mixedWhiteBlackAfrican: {
          count: schoolData.mixed_white_black_african_202425,
          percentage: schoolData.mixed_white_black_african_percentage_202425
        },
        mixedWhiteAsian: {
          count: schoolData.mixed_white_asian_202425,
          percentage: schoolData.mixed_white_asian_percentage_202425
        },
        chinese: {
          count: schoolData.chinese_202425,
          percentage: schoolData.chinese_percentage_202425
        },
        other: {
          count: schoolData.other_ethnicity_202425,
          percentage: schoolData.other_ethnicity_percentage_202425
        },
        unclassified: {
          count: schoolData.unclassified_ethnicity_202425,
          percentage: schoolData.unclassified_ethnicity_percentage_202425
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in pupil-summary API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
