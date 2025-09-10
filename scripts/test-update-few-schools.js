const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Year-specific column positions (0-indexed) - verified correct
const COLUMN_MAPPINGS = {
  '2024': {
    rectype: 0, lea: 2, urn: 4, schoolName: 5,
    rwmExp: 47, rwmHigh: 48, readAverage: 64, matAverage: 72, gpsExp: 65, gpsHigh: 66
  }
};

function parsePercentage(value) {
  if (!value || value === 'SUPP' || value === 'N/A' || value === '') return null;
  const cleaned = value.toString().replace('%', '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : Math.round(parsed);
}

async function testUpdate() {
  console.log('🧪 Testing update with a few schools...');
  
  const year = '2024';
  const csvPath = path.join(__dirname, '..', 'data', 'raw', 'results', year, 'england_ks2final.csv');
  const columnMap = COLUMN_MAPPINGS[year];
  
  try {
    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const lines = fileContent.split('\n');
    
    // Test with first 10 schools
    let count = 0;
    for (let i = 1; i < lines.length && count < 10; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(',');
      if (columns.length < 2) continue;

      const rectype = columns[columnMap.rectype];
      
      if (rectype === '1' && columns[columnMap.urn]) {
        const urn = columns[columnMap.urn];
        const schoolName = columns[columnMap.schoolName];
        
        const reading = parseFloat(columns[columnMap.readAverage]) || null;
        const maths = parseFloat(columns[columnMap.matAverage]) || null;
        const gps = parseFloat(columns[columnMap.gpsExp]) || null;
        const rwmExp = parsePercentage(columns[columnMap.rwmExp]);
        const rwmHigh = parsePercentage(columns[columnMap.rwmHigh]);
        const gpsExp = parsePercentage(columns[columnMap.gpsExp]);
        const gpsHigh = parsePercentage(columns[columnMap.gpsHigh]);
        
        console.log(`Updating ${schoolName} (URN: ${urn})...`);
        console.log(`  RWM Expected: ${rwmExp}%, RWM Higher: ${rwmHigh}%`);
        console.log(`  Reading: ${reading}, Maths: ${maths}`);
        console.log(`  GPS Expected: ${gpsExp}%, GPS Higher: ${gpsHigh}%`);
        
        // Update the record
        const { error } = await supabase
          .from('primary_results')
          .update({
            [`reading_${year}`]: reading,
            [`maths_${year}`]: maths,
            [`gps_${year}`]: gps,
            [`rwm_exp_${year}`]: rwmExp,
            [`rwm_high_${year}`]: rwmHigh,
            [`gps_exp_${year}`]: gpsExp,
            [`gps_high_${year}`]: gpsHigh
          })
          .eq('urn', urn)
          .eq('data_year', parseInt(year));
        
        if (error) {
          console.error(`  Error: ${error.message}`);
        } else {
          console.log(`  ✅ Updated successfully`);
        }
        
        count++;
      }
    }
    
    console.log(`\n🎉 Test completed: ${count} schools updated`);

  } catch (error) {
    console.error(`❌ Error:`, error);
  }
}

testUpdate();
