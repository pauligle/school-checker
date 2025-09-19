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
    const year = searchParams.get('year'); // Optional year parameter

    if (!urn) {
      return NextResponse.json(
        { error: 'URN parameter is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('parent_view_data')
      .select('*')
      .eq('urn', urn);

    if (year) {
      // If year is specified, get data for that specific year
      query = query.eq('data_date', year);
    } else {
      // If no year specified, get the most recent data
      query = query.order('data_date', { ascending: false }).limit(1);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return NextResponse.json(
          { error: 'No parent view data found for this school' },
          { status: 404 }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch parent view data' },
        { status: 500 }
      );
    }

    // Transform the data into a more usable format
    const parentViewData = {
      urn: data.urn,
      schoolName: data.school_name,
      localAuthority: data.local_authority,
      ofstedRegion: data.ofsted_region,
      ofstedPhase: data.ofsted_phase,
      submissions: data.submissions,
      responseRate: data.response_rate,
      dataDate: data.data_date,
      
      questions: {
        q1: {
          question: "My child is happy at this school",
          responses: {
            stronglyAgree: data.q1_strongly_agree,
            agree: data.q1_agree,
            disagree: data.q1_disagree,
            stronglyDisagree: data.q1_strongly_disagree,
            dontKnow: data.q1_dont_know
          }
        },
        q2: {
          question: "My child feels safe at this school",
          responses: {
            stronglyAgree: data.q2_strongly_agree,
            agree: data.q2_agree,
            disagree: data.q2_disagree,
            stronglyDisagree: data.q2_strongly_disagree,
            dontKnow: data.q2_dont_know
          }
        },
        q3: {
          question: "The school makes sure its pupils are well behaved",
          responses: {
            stronglyAgree: data.q3_strongly_agree,
            agree: data.q3_agree,
            disagree: data.q3_disagree,
            stronglyDisagree: data.q3_strongly_disagree,
            dontKnow: data.q3_dont_know
          }
        },
        q4: {
          question: "My child has been bullied and the school dealt with the bullying effectively",
          responses: {
            stronglyAgree: data.q4_strongly_agree,
            agree: data.q4_agree,
            disagree: data.q4_disagree,
            stronglyDisagree: data.q4_strongly_disagree,
            dontKnow: data.q4_dont_know,
            notApplicable: data.q4_not_applicable
          }
        },
        q5: {
          question: "The school makes me aware of what my child will learn during the year",
          responses: {
            stronglyAgree: data.q5_strongly_agree,
            agree: data.q5_agree,
            disagree: data.q5_disagree,
            stronglyDisagree: data.q5_strongly_disagree,
            dontKnow: data.q5_dont_know
          }
        },
        q6: {
          question: "When I have raised concerns with the school they have been dealt with properly",
          responses: {
            stronglyAgree: data.q6_strongly_agree,
            agree: data.q6_agree,
            disagree: data.q6_disagree,
            stronglyDisagree: data.q6_strongly_disagree,
            dontKnow: data.q6_dont_know,
            notApplicable: data.q6_not_applicable
          }
        },
        q8: {
          question: "The school has high expectations for my child",
          responses: {
            stronglyAgree: data.q8_strongly_agree,
            agree: data.q8_agree,
            disagree: data.q8_disagree,
            stronglyDisagree: data.q8_strongly_disagree,
            dontKnow: data.q8_dont_know
          }
        },
        q9: {
          question: "My child does well at this school",
          responses: {
            stronglyAgree: data.q9_strongly_agree,
            agree: data.q9_agree,
            disagree: data.q9_disagree,
            stronglyDisagree: data.q9_strongly_disagree,
            dontKnow: data.q9_dont_know
          }
        },
        q10: {
          question: "The school lets me know how my child is doing",
          responses: {
            stronglyAgree: data.q10_strongly_agree,
            agree: data.q10_agree,
            disagree: data.q10_disagree,
            stronglyDisagree: data.q10_strongly_disagree,
            dontKnow: data.q10_dont_know
          }
        },
        q11: {
          question: "There is a good range of subjects available to my child at this school",
          responses: {
            stronglyAgree: data.q11_strongly_agree,
            agree: data.q11_agree,
            disagree: data.q11_disagree,
            stronglyDisagree: data.q11_strongly_disagree,
            dontKnow: data.q11_dont_know
          }
        },
        q12: {
          question: "My child can take part in clubs and activities at this school",
          responses: {
            stronglyAgree: data.q12_strongly_agree,
            agree: data.q12_agree,
            disagree: data.q12_disagree,
            stronglyDisagree: data.q12_strongly_disagree,
            dontKnow: data.q12_dont_know
          }
        },
        q13: {
          question: "The school supports my child's wider personal development",
          responses: {
            stronglyAgree: data.q13_strongly_agree,
            agree: data.q13_agree,
            disagree: data.q13_disagree,
            stronglyDisagree: data.q13_strongly_disagree,
            dontKnow: data.q13_dont_know
          }
        },
        q14: {
          question: "I would recommend this school to another parent",
          responses: {
            yes: data.q14_yes,
            no: data.q14_no
          }
        }
      }
    };

    return NextResponse.json(parentViewData);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
