require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importAdmissionsData() {
  try {
    console.log('Starting fast admissions data import...');
    
    // Read the CSV file as text
    const csvPath = 'data/raw/primary-secondary-admissions/2025-2026/supporting-files/AppsandOffers_2025_SchoolLevel18062025.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    // Split into lines and skip header
    const lines = csvContent.split('\n');
    const header = lines[0];
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    console.log(`Found ${dataLines.length} data lines`);
    
    // Process in batches of 1000
    const batchSize = 1000;
    let processed = 0;
    
    for (let i = 0; i < dataLines.length; i += batchSize) {
      const batch = dataLines.slice(i, i + batchSize);
      const admissionsData = [];
      
      for (const line of batch) {
        const columns = line.split(',');
        
        // Only process school-level data for 2025
        if (columns[2] === 'School' && columns[0] === '202526') {
          admissionsData.push({
            time_period: columns[0],
            la_code: columns[8],
            la_name: columns[9],
            school_phase: columns[10],
            school_urn: columns[33] === 'z' ? null : columns[33],
            school_name: columns[13],
            total_places_offered: parseInt(columns[14]) || 0,
            number_preferred_offers: parseInt(columns[15]) || 0,
            number_1st_preference_offers: parseInt(columns[16]) || 0,
            number_2nd_preference_offers: parseInt(columns[17]) || 0,
            number_3rd_preference_offers: parseInt(columns[18]) || 0,
            times_put_as_any_preferred_school: parseInt(columns[19]) || 0,
            times_put_as_1st_preference: parseInt(columns[20]) || 0,
            times_put_as_2nd_preference: parseInt(columns[21]) || 0,
            times_put_as_3rd_preference: parseInt(columns[22]) || 0,
            proportion_1stprefs_v_1stprefoffers: parseFloat(columns[23]) || 0,
            proportion_1stprefs_v_totaloffers: parseFloat(columns[24]) || 0,
            applications_from_another_la: parseInt(columns[25]) || 0,
            offers_to_another_la: parseInt(columns[26]) || 0,
            establishment_type: columns[27] === 'z' ? null : columns[27],
            denomination: columns[28] === 'z' ? null : columns[28],
            fsm_eligible_percent: columns[29] === 'z' ? null : parseFloat(columns[29]),
            admissions_policy: columns[30] === 'z' ? null : columns[30],
            urban_rural: columns[31] === 'z' ? null : columns[31],
            allthrough_school: columns[32] === 'z' ? null : columns[32]
          });
        }
      }
      
      if (admissionsData.length > 0) {
        console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}: ${admissionsData.length} records`);
        
        const { error } = await supabase
          .from('admissions')
          .insert(admissionsData);
          
        if (error) {
          console.error('Error inserting batch:', error);
          return;
        }
        
        processed += admissionsData.length;
        console.log(`✅ Processed ${processed} admissions records`);
      }
    }
    
    console.log(`✅ Fast admissions data import completed! Total: ${processed} records`);
    
  } catch (error) {
    console.error('Error in fast admissions import:', error);
  }
}

importAdmissionsData();
