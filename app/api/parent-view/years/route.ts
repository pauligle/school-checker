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

    if (!urn) {
      return NextResponse.json(
        { error: 'URN parameter is required' },
        { status: 400 }
      );
    }

    // Get all available years for this school (distinct dates only)
    const { data, error } = await supabase
      .from('parent_view_data')
      .select('data_date, submissions')
      .eq('urn', urn)
      .order('data_date', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch parent view years' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No parent view data found for this school' },
        { status: 404 }
      );
    }

    // Transform dates into year format for display and remove duplicates
    const uniqueData = data.filter((record, index, self) => 
      index === self.findIndex(r => r.data_date === record.data_date)
    );

    const years = uniqueData.map(record => {
      const date = new Date(record.data_date);
      const year = date.getFullYear();
      
      // Determine academic year based on month
      let academicYear;
      if (date.getMonth() >= 8) { // September onwards
        academicYear = `${year}-${(year + 1).toString().slice(-2)}`;
      } else { // January-August
        academicYear = `${year - 1}-${year.toString().slice(-2)}`;
      }
      
      return {
        academicYear,
        displayYear: year.toString(),
        dataDate: record.data_date,
        submissions: record.submissions,
        // Format date for display
        dateLabel: date.toLocaleDateString('en-GB', { 
          month: 'short', 
          year: 'numeric' 
        })
      };
    });

    return NextResponse.json({
      urn,
      years,
      totalYears: years.length
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
