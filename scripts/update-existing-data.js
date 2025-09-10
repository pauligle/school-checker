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

const YEARS = ['2024', '2023', '2018']; // Skip 2019 since it was imported

function parsePercentage(value) {
  if (!value || value === 'SUPP' || value === 'N/A' || value === '') return null;
  const cleaned = value.toString().replace('%', '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : Math.round(parsed);
}

async function updateYearData(year) {
  console.log(`📊 Updating ${year} data...`);
  
  const csvPath = path.join(__dirname, '..', 'data', 'raw', 'results', year, 'england_ks2final.csv');
  if (!fs.existsSync(csvPath)) {
    console.log(`❌ ${year} CSV file not found`);
    return;
  }

  const columnMap = COLUMN_MAPPINGS[year];
  let updatedCount = 0;
  
  try {
    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const lines = fileContent.split('\n');
    
    console.log(`Processing ${lines.length - 1} lines for ${year}...`);
    
    // Process in batches of 1000
    const batchSize = 1000;
    let batch = [];
    
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
          [`reading_${year}`]: parseFloat(columns[columnMap.readAverage]) || null,
          [`maths_${year}`]: parseFloat(columns[columnMap.matAverage]) || null,
          [`gps_${year}`]: parseFloat(columns[columnMap.gpsExp]) || null,
          [`rwm_exp_${year}`]: parsePercentage(columns[columnMap.rwmExp]),
          [`rwm_high_${year}`]: parsePercentage(columns[columnMap.rwmHigh]),
          [`gps_exp_${year}`]: parsePercentage(columns[columnMap.gpsExp]),
          [`gps_high_${year}`]: parsePercentage(columns[columnMap.gpsHigh])
        };
        
        batch.push(schoolData);
        
        if (batch.length >= batchSize) {
          await updateBatch(batch, year);
          updatedCount += batch.length;
          console.log(`  Updated ${updatedCount} schools...`);
          batch = [];
        }
      }
    }
    
    // Process remaining batch
    if (batch.length > 0) {
      await updateBatch(batch, year);
      updatedCount += batch.length;
    }

    console.log(`✅ ${year} completed: ${updatedCount} schools updated`);

  } catch (error) {
    console.error(`❌ Error updating ${year}:`, error);
  }
}

async function updateBatch(schools, year) {
  // Update each school individually to avoid constraint issues
  for (const school of schools) {
    if (!school.urn) continue;
    
    const { error } = await supabase
      .from('primary_results')
      .update({
        [`reading_${year}`]: school[`reading_${year}`],
        [`maths_${year}`]: school[`maths_${year}`],
        [`gps_${year}`]: school[`gps_${year}`],
        [`rwm_exp_${year}`]: school[`rwm_exp_${year}`],
        [`rwm_high_${year}`]: school[`rwm_high_${year}`],
        [`gps_exp_${year}`]: school[`gps_exp_${year}`],
        [`gps_high_${year}`]: school[`gps_high_${year}`]
      })
      .eq('urn', school.urn)
      .eq('data_year', parseInt(year));
    
    if (error && error.code !== 'PGRST116') {
      console.error(`Error updating school ${school.urn}:`, error);
    }
  }
}

async function main() {
  console.log('🚀 Starting UPDATE import...');
  console.log('Updating existing records with correct data');
  
  const startTime = Date.now();
  
  // Update each year
  for (const year of YEARS) {
    const yearStart = Date.now();
    await updateYearData(year);
    const yearTime = Date.now() - yearStart;
    console.log(`⏱️  ${year} took ${(yearTime / 1000).toFixed(1)}s`);
  }
  
  const totalTime = Date.now() - startTime;
  console.log(`🎉 Update completed in ${(totalTime / 1000).toFixed(1)}s`);
}

main().catch(console.error);
