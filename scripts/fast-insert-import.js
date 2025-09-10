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
  '2018': {
    rectype: 0, lea: 2, urn: 4, schoolName: 5,
    rwmExp: 48, rwmHigh: 49, readAverage: 65, matAverage: 73, gpsExp: 66, gpsHigh: 67
  },
  '2019': {
    rectype: 0, lea: 2, urn: 4, schoolName: 5,
    rwmExp: 48, rwmHigh: 49, readAverage: 65, matAverage: 73, gpsExp: 66, gpsHigh: 67
  },
  '2023': {
    rectype: 0, lea: 2, urn: 4, schoolName: 5,
    rwmExp: 47, rwmHigh: 48, readAverage: 64, matAverage: 72, gpsExp: 65, gpsHigh: 66
  },
  '2024': {
    rectype: 0, lea: 2, urn: 4, schoolName: 5,
    rwmExp: 47, rwmHigh: 48, readAverage: 64, matAverage: 72, gpsExp: 65, gpsHigh: 66
  }
};

const YEARS = ['2024', '2023', '2019', '2018'];

function parsePercentage(value) {
  if (!value || value === 'SUPP' || value === 'N/A' || value === '') return null;
  const cleaned = value.toString().replace('%', '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : Math.round(parsed);
}

async function importYearData(year) {
  console.log(`📊 Importing ${year} data...`);
  
  const csvPath = path.join(__dirname, '..', 'data', 'raw', 'results', year, 'england_ks2final.csv');
  if (!fs.existsSync(csvPath)) {
    console.log(`❌ ${year} CSV file not found`);
    return;
  }

  const columnMap = COLUMN_MAPPINGS[year];
  const allSchools = [];
  
  try {
    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const lines = fileContent.split('\n');
    
    console.log(`Processing ${lines.length - 1} lines for ${year}...`);
    
    // Process all lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(',');
      if (columns.length < 2) continue;

      const rectype = columns[columnMap.rectype];
      
      if (rectype === '1' && columns[columnMap.urn]) {
        const schoolData = {
          urn: columns[columnMap.urn],
          school_name: columns[columnMap.schoolName] || null,
          lea_code: parseInt(columns[columnMap.lea]) || null,
          data_year: parseInt(year),
          [`reading_${year}`]: parseFloat(columns[columnMap.readAverage]) || null,
          [`maths_${year}`]: parseFloat(columns[columnMap.matAverage]) || null,
          [`gps_${year}`]: parseFloat(columns[columnMap.gpsExp]) || null,
          [`rwm_exp_${year}`]: parsePercentage(columns[columnMap.rwmExp]),
          [`rwm_high_${year}`]: parsePercentage(columns[columnMap.rwmHigh]),
          [`gps_exp_${year}`]: parsePercentage(columns[columnMap.gpsExp]),
          [`gps_high_${year}`]: parsePercentage(columns[columnMap.gpsHigh])
        };
        
        allSchools.push(schoolData);
      }
    }

    console.log(`Found ${allSchools.length} schools for ${year}`);
    
    // Use batch insert - much faster and avoids constraint issues
    const { error } = await supabase
      .from('primary_results')
      .insert(allSchools);

    if (error) {
      console.error(`Error inserting ${year} data:`, error);
    } else {
      console.log(`✅ ${year} completed: ${allSchools.length} schools imported`);
    }

  } catch (error) {
    console.error(`❌ Error importing ${year}:`, error);
  }
}

async function main() {
  console.log('🚀 Starting FAST insert import...');
  console.log('Using batch insert operations for speed');
  
  const startTime = Date.now();
  
  // Import each year
  for (const year of YEARS) {
    const yearStart = Date.now();
    await importYearData(year);
    const yearTime = Date.now() - yearStart;
    console.log(`⏱️  ${year} took ${(yearTime / 1000).toFixed(1)}s`);
  }
  
  const totalTime = Date.now() - startTime;
  console.log(`🎉 Import completed in ${(totalTime / 1000).toFixed(1)}s`);
}

main().catch(console.error);
