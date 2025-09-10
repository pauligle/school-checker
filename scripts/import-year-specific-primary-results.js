const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Column mappings for each year (based on actual CSV structure analysis)
const yearMappings = {
  '2018': {
    rectype: 0,
    lea: 3,
    urn: 5,
    schoolName: 6,
    ptrwmExp: 49,
    ptrwmHigh: 50,
    readAverage: 66,
    matAverage: 74,
    ptgpsExp: 67,
    ptgpsHigh: 68,
    gpsAverage: 70
  },
  '2019': {
    rectype: 0,
    lea: 3,
    urn: 5,
    schoolName: 6,
    ptrwmExp: 49,
    ptrwmHigh: 50,
    readAverage: 66,
    matAverage: 74,
    ptgpsExp: 67,
    ptgpsHigh: 68,
    gpsAverage: 69
  },
  '2023': {
    rectype: 0,
    lea: 2,
    urn: 4,
    schoolName: 5,
    ptrwmExp: 47,
    ptrwmHigh: 48,
    readAverage: 64,  // Fixed position
    matAverage: 72,   // Fixed position
    ptgpsExp: 66,
    ptgpsHigh: 67,
    gpsAverage: 68    // Fixed position
  },
  '2024': {
    rectype: 0,
    lea: 2,
    urn: 4,
    schoolName: 5,
    ptrwmExp: 263,
    ptrwmHigh: 264,
    readAverage: 64,  // Fixed position
    matAverage: 72,   // Fixed position
    ptgpsExp: 66,
    ptgpsHigh: 67,
    gpsAverage: 68    // Fixed position
  }
};

async function importYearData(year) {
  console.log(`📊 Importing ${year} data...`);
  
  const csvPath = path.join(__dirname, '..', 'data', 'raw', 'results', year, 'england_ks2final.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log(`❌ ${year} CSV file not found: ${csvPath}`);
    return;
  }

  const colMap = yearMappings[year];
  if (!colMap) {
    console.log(`❌ No column mapping found for year ${year}`);
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

      const rectype = columns[0];
      
      if (rectype === '1') {
        // School data
        const schoolData = {
          urn: columns[colMap.urn] || null,
          school_name: columns[colMap.schoolName] || null,
          lea_code: parseInt(columns[colMap.lea]) || null,
        };

        // Add year-specific fields
        const yearFields = {
          [`reading_${year}`]: parseFloat(columns[colMap.readAverage]) || null,
          [`maths_${year}`]: parseFloat(columns[colMap.matAverage]) || null,
          [`gps_${year}`]: parseFloat(columns[colMap.gpsAverage]) || null,
          [`rwm_exp_${year}`]: parsePercentage(columns[colMap.ptrwmExp]),
          [`rwm_high_${year}`]: parsePercentage(columns[colMap.ptrwmHigh]),
          [`gps_exp_${year}`]: parsePercentage(columns[colMap.ptgpsExp]),
          [`gps_high_${year}`]: parsePercentage(columns[colMap.ptgpsHigh])
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

async function createSchema() {
  console.log('📋 Creating year-specific schema...');
  
  // First, let's try to create a simple test record to see if the table exists
  try {
    const { error } = await supabase
      .from('primary_results')
      .select('urn')
      .limit(1);
      
    if (error && error.code === 'PGRST116') {
      console.log('❌ Table does not exist. Please create the schema manually first.');
      console.log('Run the SQL in scripts/create-year-specific-primary-results.sql');
      return false;
    }
  } catch (err) {
    console.log('❌ Error checking table:', err.message);
    return false;
  }
  
  return true;
}

async function main() {
  console.log('🚀 Starting year-specific primary results import...');
  
  // Check if schema exists
  const schemaExists = await createSchema();
  if (!schemaExists) {
    return;
  }
  
  // Import each year
  const years = ['2018', '2019', '2023', '2024'];
  
  for (const year of years) {
    await importYearData(year);
  }
  
  console.log('🎉 Year-specific import completed!');
}

main().catch(console.error);
