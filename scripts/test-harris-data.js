const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Correct column positions (0-indexed)
const COLUMN_MAPPING = {
  rectype: 0,
  lea: 2,
  urn: 4,
  schoolName: 5,
  rwmExp: 48,      // PTRWM_EXP
  rwmHigh: 49,     // PTRWM_HIGH
  readAverage: 65, // READ_AVERAGE
  matAverage: 73,  // MAT_AVERAGE
  gpsExp: 66,      // PTGPS_EXP
  gpsHigh: 67      // PTGPS_HIGH
};

const YEARS = ['2018', '2019', '2023', '2024'];

function parseCSVLine(line) {
  // Simple split by comma - the CSV format is consistent
  return line.split(',');
}

function parsePercentage(value) {
  if (!value || value === 'SUPP' || value === 'N/A' || value === '') return null;
  const cleaned = value.toString().replace('%', '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : Math.round(parsed);
}

async function testHarrisData() {
  console.log('🔍 Testing Harris Academy Chobham data extraction...');
  
  for (const year of YEARS) {
    console.log(`\n=== ${year} DATA ===`);
    
    const csvPath = path.join(__dirname, '..', 'data', 'raw', 'results', year, 'england_ks2final.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log(`❌ ${year} CSV file not found`);
      continue;
    }

    try {
      const fileContent = fs.readFileSync(csvPath, 'utf8');
      const lines = fileContent.split('\n');
      const dataRow = lines.find(line => line.includes('139703'));

      if (dataRow) {
        const columns = parseCSVLine(dataRow);
        
        const data = {
          urn: columns[COLUMN_MAPPING.urn],
          school_name: columns[COLUMN_MAPPING.schoolName],
          rwm_expected: parsePercentage(columns[COLUMN_MAPPING.rwmExp]),
          rwm_higher: parsePercentage(columns[COLUMN_MAPPING.rwmHigh]),
          reading_average: parseFloat(columns[COLUMN_MAPPING.readAverage]) || null,
          maths_average: parseFloat(columns[COLUMN_MAPPING.matAverage]) || null,
          gps_expected: parsePercentage(columns[COLUMN_MAPPING.gpsExp]),
          gps_higher: parsePercentage(columns[COLUMN_MAPPING.gpsHigh])
        };
        
        console.log('RWM Expected:', data.rwm_expected + '%');
        console.log('RWM Higher:', data.rwm_higher + '%');
        console.log('Reading Average:', data.reading_average);
        console.log('Maths Average:', data.maths_average);
        console.log('GPS Expected:', data.gps_expected + '%');
        console.log('GPS Higher:', data.gps_higher + '%');
      } else {
        console.log('❌ Harris Academy Chobham not found in 2024 data');
      }
    } catch (error) {
      console.error(`❌ Error processing ${year}:`, error);
    }
  }
}

testHarrisData();
