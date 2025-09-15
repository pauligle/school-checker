const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function calculateSchoolRankings() {
  console.log('=== Calculating School Rankings for All Years ===');
  
  const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
  
  for (const year of years) {
    console.log(`\n--- Processing Year ${year} ---`);
    
    try {
      // Get ALL schools with primary results data for this year
      // Schools with RWM data will be ranked by RWM performance
      // Schools without RWM data will be ranked at the bottom
      // Use pagination to get all schools, not just the first 1000
      let allSchools = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;
      
      while (hasMore) {
        // Use year-specific columns for RWM data
        const rwmExpColumn = `rwm_exp_${year}`;
        const rwmHighColumn = `rwm_high_${year}`;
        const gpsExpColumn = `gps_exp_${year}`;
        const gpsHighColumn = `gps_high_${year}`;
        
        const { data: batch, error } = await supabase
          .from('primary_results')
          .select(`urn, ${rwmExpColumn}, ${rwmHighColumn}, ${gpsExpColumn}, ${gpsHighColumn}`)
          .eq('data_year', year)
          .or(`${rwmExpColumn}.not.is.null,${gpsExpColumn}.not.is.null`)
          .range(from, from + batchSize - 1);
        
        if (error) {
          console.error(`Error fetching batch for ${year}:`, error);
          break;
        }
        
        if (batch && batch.length > 0) {
          allSchools = allSchools.concat(batch);
          from += batchSize;
          hasMore = batch.length === batchSize;
        } else {
          hasMore = false;
        }
      }
      
      const schools = allSchools;
      
      if (!schools || schools.length === 0) {
        console.log(`No data found for year ${year}`);
        continue;
      }
      
      console.log(`Found ${schools.length} schools with primary results data for ${year}`);
      
      // Sort schools using Locrating methodology:
      // 1. Schools with RWM data ranked by RWM performance (descending)
      // 2. Schools without RWM data ranked at the bottom by GPS performance
      const rwmExpColumn = `rwm_exp_${year}`;
      const rwmHighColumn = `rwm_high_${year}`;
      const gpsExpColumn = `gps_exp_${year}`;
      const gpsHighColumn = `gps_high_${year}`;
      
      schools.sort((a, b) => {
        const aHasRWM = a[rwmExpColumn] !== null;
        const bHasRWM = b[rwmExpColumn] !== null;
        
        // Schools with RWM data always rank higher than those without
        if (aHasRWM && !bHasRWM) return -1; // a ranks higher
        if (!aHasRWM && bHasRWM) return 1;  // b ranks higher
        
        if (aHasRWM && bHasRWM) {
          // Both have RWM data - Locrating-style tie-breaking
          const aExpected = a[rwmExpColumn];
          const bExpected = b[rwmExpColumn];
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
        } else {
          // Neither has RWM data - compare GPS expected percentage
          const aGPS = a[gpsExpColumn] || 0;
          const bGPS = b[gpsExpColumn] || 0;
          if (bGPS !== aGPS) {
            return bGPS - aGPS;
          }
          // If GPS equal, compare GPS higher percentage
          const aGPSHigher = a[gpsHighColumn] || 0;
          const bGPSHigher = b[gpsHighColumn] || 0;
          if (bGPSHigher !== aGPSHigher) {
            return bGPSHigher - aGPSHigher;
          }
          // If all criteria are identical, schools are considered tied
          return 0;
        }
      });
      
      // Calculate rankings with ties handled properly
      const rankings = [];
      let currentRank = 1;
      let previousExpected = null;
      let previousHigher = null;
      
      for (let i = 0; i < schools.length; i++) {
        const school = schools[i];
        const currentExpected = school[rwmExpColumn];
        const currentHigher = school[rwmHighColumn] || 0; // Handle null values
        const currentGPS = school[gpsExpColumn];
        const currentGPSHigher = school[gpsHighColumn] || 0;
        
        // If either score is different from previous, update rank
        if (previousExpected !== null && 
            (currentExpected !== previousExpected || currentHigher !== previousHigher)) {
          currentRank = i + 1;
        }
        
        // Calculate percentile: (total_schools - rank + 1) / total_schools * 100
        const percentile = ((schools.length - currentRank + 1) / schools.length) * 100;
        
        rankings.push({
          urn: school.urn,
          data_year: year,
          rwm_rank: currentRank,
          total_schools: schools.length,
          percentile: Math.round(percentile * 100) / 100, // Round to 2 decimal places
          rwm_expected_percentage: currentExpected,
          rwm_higher_percentage: currentHigher,
          gps_expected_percentage: currentGPS,
          gps_higher_percentage: currentGPSHigher
        });
        
        previousExpected = currentExpected;
        previousHigher = currentHigher;
      }
      
      console.log(`Calculated rankings for ${rankings.length} schools`);
      
      // Insert rankings into database
      const { error: insertError } = await supabase
        .from('school_rankings')
        .upsert(rankings, { onConflict: 'urn,data_year' });
      
      if (insertError) {
        console.error(`Error inserting rankings for ${year}:`, insertError);
      } else {
        console.log(`✅ Successfully inserted ${rankings.length} rankings for ${year}`);
        
        // Show some examples
        const top5 = rankings.slice(0, 5);
        const bottom5 = rankings.slice(-5);
        console.log('Top 5 schools:');
        top5.forEach(rank => {
          console.log(`  Rank ${rank.rwm_rank}: URN ${rank.urn} - ${rank.rwm_expected_percentage}% (top ${rank.percentile}%)`);
        });
        console.log('Bottom 5 schools:');
        bottom5.forEach(rank => {
          console.log(`  Rank ${rank.rwm_rank}: URN ${rank.urn} - ${rank.rwm_expected_percentage}% (top ${rank.percentile}%)`);
        });
      }
      
    } catch (error) {
      console.error(`Error processing year ${year}:`, error);
    }
  }
  
  console.log('\n=== Ranking Calculation Complete ===');
  
  // Show summary
  const { data: summary } = await supabase
    .from('school_rankings')
    .select('data_year')
    .order('data_year');
  
  console.log('\nSummary by year:');
  const yearCounts = {};
  summary?.forEach(row => {
    yearCounts[row.data_year] = (yearCounts[row.data_year] || 0) + 1;
  });
  
  Object.keys(yearCounts).sort().forEach(year => {
    console.log(`  ${year}: ${yearCounts[year]} schools ranked`);
  });
}

// Run the calculation
calculateSchoolRankings().catch(console.error);
