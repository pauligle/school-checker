const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Define the years and their corresponding data years
// Note: Database years map to academic years as follows:
// 2024 = Academic year 2023-2024
// 2023 = Academic year 2022-2023  
// 2022 = Academic year 2020/2022 (COVID-19 period)
// 2018 = Academic year 2018-2019
// 2017 = Academic year 2016-2017
const yearMappings = {
  '2018': 2018,
  '2019': 2019,
  '2023': 2023,
  '2024': 2024
};

// Column mappings for different years (CSV structure changes over time)
const columnMappings = {
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
    gpsAverage: 70
  },
  '2023': {
    rectype: 0,
    lea: 2,
    urn: 4,
    schoolName: 5,
    ptrwmExp: 47,
    ptrwmHigh: 48,
    readAverage: 64,
    matAverage: 72,
    ptgpsExp: 66,
    ptgpsHigh: 67,
    gpsAverage: 68
  },
  '2024': {
    rectype: 0,
    lea: 2,
    urn: 4,
    schoolName: 5,
    ptrwmExp: 263,
    ptrwmHigh: 264,
    readAverage: 64,
    matAverage: 72,
    ptgpsExp: 66,
    ptgpsHigh: 67,
    gpsAverage: 68
  }
};

async function importYearData(yearFolder, dataYear) {
  const csvPath = path.join(__dirname, '..', 'data', 'raw', 'results', yearFolder, 'england_ks2final.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log(`❌ File not found: ${csvPath}`);
    return;
  }

  // Get column mappings for this year
  const colMap = columnMappings[yearFolder];
  if (!colMap) {
    console.error(`❌ No column mapping found for ${yearFolder}`);
    return;
  }

  console.log(`📊 Processing ${yearFolder} (data_year: ${dataYear}) with column mapping...`);
  
  let schoolCount = 0;
  let laCount = 0;
  let englandCount = 0;
  const batchSize = 1000;
  let schoolBatch = [];
  let laBatch = [];
  let englandBatch = [];

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
        // School data - using dynamic column mapping
        const schoolData = {
          urn: columns[colMap.urn] || null,
          school_name: columns[colMap.schoolName] || null,
          lea_code: columns[colMap.lea] || null,
          data_year: dataYear,
          rwm_expected_percentage: parsePercentage(columns[colMap.ptrwmExp]),
          rwm_higher_percentage: parsePercentage(columns[colMap.ptrwmHigh]),
          reading_average_score: parseScore(columns[colMap.readAverage]),
          maths_average_score: parseScore(columns[colMap.matAverage]),
          gps_expected_percentage: parsePercentage(columns[colMap.ptgpsExp]),
          gps_higher_percentage: parsePercentage(columns[colMap.ptgpsHigh])
        };

        schoolBatch.push(schoolData);
        schoolCount++;

        if (schoolBatch.length >= batchSize) {
          await upsertBatch('primary_results', schoolBatch);
          schoolBatch = [];
        }
      } else if (rectype === '3') {
        // LA averages - only process if lea_code is valid
        const leaCode = columns[colMap.lea];
        if (leaCode && leaCode !== '' && leaCode !== 'null') {
          const laData = {
            lea_code: parseInt(leaCode),
            lea_name: columns[1] || null, // ALPHAIND might be LA name
            data_year: dataYear,
            rwm_expected_percentage: parsePercentage(columns[colMap.ptrwmExp]),
            rwm_higher_percentage: parsePercentage(columns[colMap.ptrwmHigh]),
            reading_average_score: parseScore(columns[colMap.readAverage]),
            maths_average_score: parseScore(columns[colMap.matAverage]),
            gps_expected_percentage: parsePercentage(columns[colMap.ptgpsExp]),
            gps_higher_percentage: parsePercentage(columns[colMap.ptgpsHigh])
          };

          laBatch.push(laData);
          laCount++;

          if (laBatch.length >= batchSize) {
            await upsertBatch('la_averages', laBatch);
            laBatch = [];
          }
        }
      } else if (rectype === '4') {
        // England averages
        const englandData = {
          data_year: dataYear,
          rwm_expected_percentage: parsePercentage(columns[colMap.ptrwmExp]),
          rwm_higher_percentage: parsePercentage(columns[colMap.ptrwmHigh]),
          reading_average_score: parseScore(columns[colMap.readAverage]),
          maths_average_score: parseScore(columns[colMap.matAverage]),
          gps_expected_percentage: parsePercentage(columns[colMap.ptgpsExp]),
          gps_higher_percentage: parsePercentage(columns[colMap.ptgpsHigh])
        };

        englandBatch.push(englandData);
        englandCount++;
      }
    }

    // Process remaining batches
    if (schoolBatch.length > 0) {
      await upsertBatch('primary_results', schoolBatch);
    }
    if (laBatch.length > 0) {
      await upsertBatch('la_averages', laBatch);
    }
    if (englandBatch.length > 0) {
      await upsertBatch('england_averages', englandBatch);
    }

    console.log(`✅ ${yearFolder} completed:`);
    console.log(`   - Schools: ${schoolCount}`);
    console.log(`   - LA averages: ${laCount}`);
    console.log(`   - England averages: ${englandCount}`);

  } catch (error) {
    console.error(`❌ Error processing ${yearFolder}:`, error);
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
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return null;
  // Cap at 999.99 to prevent overflow
  return Math.min(parsed, 999.99);
}

function parseScore(value) {
  if (!value || value === 'SUPP' || value === 'N/A' || value === '') return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

async function upsertBatch(tableName, batch) {
  try {
    let conflictColumns;
    if (tableName === 'primary_results') {
      conflictColumns = 'urn,data_year';
    } else if (tableName === 'la_averages') {
      conflictColumns = 'lea_code,data_year';
    } else if (tableName === 'england_averages') {
      conflictColumns = 'data_year';
    }

    const { error } = await supabase
      .from(tableName)
      .upsert(batch, { 
        onConflict: conflictColumns
      });
    
    if (error) {
      console.error(`Error upserting to ${tableName}:`, error);
    }
  } catch (error) {
    console.error(`Error upserting to ${tableName}:`, error);
  }
}

async function main() {
  console.log('🚀 Starting historical primary results import...');
  
  for (const [yearFolder, dataYear] of Object.entries(yearMappings)) {
    await importYearData(yearFolder, dataYear);
  }
  
  console.log('🎉 Historical import completed!');
}

main().catch(console.error);
