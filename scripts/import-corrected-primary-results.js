const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Correct column positions (0-indexed) - consistent across all years
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

async function importYearData(year) {
  console.log(`📊 Importing ${year} data with correct column positions...`);
  
  const csvPath = path.join(__dirname, '..', 'data', 'raw', 'results', year, 'england_ks2final.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log(`❌ ${year} CSV file not found: ${csvPath}`);
    return;
  }

  let schoolCount = 0;
  const batchSize = 1000;
  let schoolBatch = [];

  try {
    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const lines = fileContent.split('\n');
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = parseCSVLine(line);
      if (columns.length < 2) continue;

      const rectype = columns[COLUMN_MAPPING.rectype];
      
      if (rectype === '1') {
        // School data
        const schoolData = {
          urn: columns[COLUMN_MAPPING.urn] || null,
          school_name: columns[COLUMN_MAPPING.schoolName] || null,
          lea_code: parseInt(columns[COLUMN_MAPPING.lea]) || null,
        };

        // Add year-specific fields with correct data
        const yearFields = {
          [`reading_${year}`]: parseFloat(columns[COLUMN_MAPPING.readAverage]) || null,
          [`maths_${year}`]: parseFloat(columns[COLUMN_MAPPING.matAverage]) || null,
          [`gps_${year}`]: parseFloat(columns[COLUMN_MAPPING.gpsExp]) || null,
          [`rwm_exp_${year}`]: parsePercentage(columns[COLUMN_MAPPING.rwmExp]),
          [`rwm_high_${year}`]: parsePercentage(columns[COLUMN_MAPPING.rwmHigh]),
          [`gps_exp_${year}`]: parsePercentage(columns[COLUMN_MAPPING.gpsExp]),
          [`gps_high_${year}`]: parsePercentage(columns[COLUMN_MAPPING.gpsHigh])
        };

        schoolBatch.push({ ...schoolData, ...yearFields });

        if (schoolBatch.length >= batchSize) {
          await upsertSchools(schoolBatch);
          schoolCount += schoolBatch.length;
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
    // First try to update existing records
    for (const school of schools) {
      const { error: updateError } = await supabase
        .from('primary_results')
        .update(school)
        .eq('urn', school.urn);
      
      if (updateError && updateError.code === 'PGRST116') {
        // Record doesn't exist, insert it
        const { error: insertError } = await supabase
          .from('primary_results')
          .insert(school);
        
        if (insertError) {
          console.error('Error inserting school:', insertError);
        }
      } else if (updateError) {
        console.error('Error updating school:', updateError);
      }
    }
  } catch (err) {
    console.error('Error in upsertSchools:', err);
  }
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function parsePercentage(value) {
  if (!value || value === 'SUPP' || value === 'N/A' || value === '') return null;
  const cleaned = value.toString().replace('%', '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : Math.round(parsed);
}

async function main() {
  console.log('🚀 Starting corrected primary results import...');
  console.log('Using correct column positions for all years');
  
  // Import each year
  for (const year of YEARS) {
    await importYearData(year);
  }
  
  console.log('🎉 Corrected import completed!');
  console.log('Data should now match Locrating exactly');
}

main().catch(console.error);
