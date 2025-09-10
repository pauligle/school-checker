const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Year-specific column positions (0-indexed)
const COLUMN_MAPPINGS = {
  '2018': {
    rectype: 0,
    lea: 2,
    urn: 4,
    schoolName: 5,
    rwmExp: 48,      // PTRWM_EXP at position 49
    rwmHigh: 49,     // PTRWM_HIGH at position 50
    readAverage: 65, // READ_AVERAGE at position 66
    matAverage: 73,  // MAT_AVERAGE at position 74
    gpsExp: 66,      // PTGPS_EXP at position 67
    gpsHigh: 67      // PTGPS_HIGH at position 68
  },
  '2019': {
    rectype: 0,
    lea: 2,
    urn: 4,
    schoolName: 5,
    rwmExp: 48,      // PTRWM_EXP at position 49
    rwmHigh: 49,     // PTRWM_HIGH at position 50
    readAverage: 65, // READ_AVERAGE at position 66
    matAverage: 73,  // MAT_AVERAGE at position 74
    gpsExp: 66,      // PTGPS_EXP at position 67
    gpsHigh: 67      // PTGPS_HIGH at position 68
  },
  '2023': {
    rectype: 0,
    lea: 2,
    urn: 4,
    schoolName: 5,
    rwmExp: 47,      // PTRWM_EXP at position 48
    rwmHigh: 48,     // PTRWM_HIGH at position 49
    readAverage: 64, // READ_AVERAGE at position 65
    matAverage: 72,  // MAT_AVERAGE at position 73
    gpsExp: 65,      // PTGPS_EXP at position 66
    gpsHigh: 66      // PTGPS_HIGH at position 67
  },
  '2024': {
    rectype: 0,
    lea: 2,
    urn: 4,
    schoolName: 5,
    rwmExp: 47,      // PTRWM_EXP at position 48
    rwmHigh: 48,     // PTRWM_HIGH at position 49
    readAverage: 64, // READ_AVERAGE at position 65
    matAverage: 72,  // MAT_AVERAGE at position 73
    gpsExp: 65,      // PTGPS_EXP at position 66
    gpsHigh: 66      // PTGPS_HIGH at position 67
  }
};

const YEARS = ['2018', '2019', '2023', '2024'];

async function importYearData(year) {
  console.log(`📊 Importing ${year} data with correct column positions...`);
  
  const csvPath = path.join(__dirname, '..', 'data', 'raw', 'results', year, 'england_ks2final.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log(`❌ ${year} CSV file not found: ${csvPath}`);
    return;
  }

  const columnMap = COLUMN_MAPPINGS[year];
  let schoolCount = 0;
  const batchSize = 100;
  let schoolBatch = [];

  try {
    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const lines = fileContent.split('\n');
    
    console.log(`Processing ${lines.length - 1} lines for ${year}...`);
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(',');
      if (columns.length < 2) continue;

      const rectype = columns[columnMap.rectype];
      
      if (rectype === '1') {
        // School data
        const schoolData = {
          urn: columns[columnMap.urn] || null,
          school_name: columns[columnMap.schoolName] || null,
          lea_code: parseInt(columns[columnMap.lea]) || null,
        };

        // Add year-specific fields with correct data
        const yearFields = {
          [`reading_${year}`]: parseFloat(columns[columnMap.readAverage]) || null,
          [`maths_${year}`]: parseFloat(columns[columnMap.matAverage]) || null,
          [`gps_${year}`]: parseFloat(columns[columnMap.gpsExp]) || null,
          [`rwm_exp_${year}`]: parsePercentage(columns[columnMap.rwmExp]),
          [`rwm_high_${year}`]: parsePercentage(columns[columnMap.rwmHigh]),
          [`gps_exp_${year}`]: parsePercentage(columns[columnMap.gpsExp]),
          [`gps_high_${year}`]: parsePercentage(columns[columnMap.gpsHigh])
        };

        schoolBatch.push({ ...schoolData, ...yearFields });

        if (schoolBatch.length >= batchSize) {
          await upsertSchools(schoolBatch);
          schoolCount += schoolBatch.length;
          console.log(`  Processed ${schoolCount} schools...`);
          schoolBatch = [];
        }
      }
    }

    // Process remaining batch
    if (schoolBatch.length > 0) {
      await upsertSchools(schoolBatch);
      schoolCount += schoolBatch.length;
    }

    console.log(`✅ ${year} completed: ${schoolCount} schools imported`);

  } catch (error) {
    console.error(`❌ Error importing ${year}:`, error);
  }
}

async function upsertSchools(schools) {
  try {
    // Use batch upsert for better performance
    const { error } = await supabase
      .from('primary_results')
      .upsert(schools, { 
        onConflict: 'urn',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error upserting schools:', error);
    }
  } catch (err) {
    console.error('Error in upsertSchools:', err);
  }
}

function parsePercentage(value) {
  if (!value || value === 'SUPP' || value === 'N/A' || value === '') return null;
  const cleaned = value.toString().replace('%', '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : Math.round(parsed);
}

async function main() {
  console.log('🚀 Starting CORRECTED primary results import...');
  console.log('Using year-specific column positions');
  console.log('Processing in smaller batches for speed...');
  
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
  console.log('Data should now match Locrating exactly');
}

main().catch(console.error);
