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

async function updateYearData(year) {
  console.log(`📊 Updating ${year} data with SQL...`);
  
  const csvPath = path.join(__dirname, '..', 'data', 'raw', 'results', year, 'england_ks2final.csv');
  if (!fs.existsSync(csvPath)) {
    console.log(`❌ ${year} CSV file not found`);
    return;
  }

  const columnMap = COLUMN_MAPPINGS[year];
  const updates = [];
  
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
        const urn = columns[columnMap.urn];
        const reading = parseFloat(columns[columnMap.readAverage]) || null;
        const maths = parseFloat(columns[columnMap.matAverage]) || null;
        const gps = parseFloat(columns[columnMap.gpsExp]) || null;
        const rwmExp = parsePercentage(columns[columnMap.rwmExp]);
        const rwmHigh = parsePercentage(columns[columnMap.rwmHigh]);
        const gpsExp = parsePercentage(columns[columnMap.gpsExp]);
        const gpsHigh = parsePercentage(columns[columnMap.gpsHigh]);
        
        updates.push({
          urn,
          reading,
          maths,
          gps,
          rwmExp,
          rwmHigh,
          gpsExp,
          gpsHigh
        });
      }
    }

    console.log(`Found ${updates.length} schools for ${year}`);
    
    // Create SQL update statement
    const sql = `
      UPDATE primary_results 
      SET 
        reading_${year} = CASE urn
          ${updates.map(u => `WHEN '${u.urn}' THEN ${u.reading || 'NULL'}`).join(' ')}
        END,
        maths_${year} = CASE urn
          ${updates.map(u => `WHEN '${u.urn}' THEN ${u.maths || 'NULL'}`).join(' ')}
        END,
        gps_${year} = CASE urn
          ${updates.map(u => `WHEN '${u.urn}' THEN ${u.gps || 'NULL'}`).join(' ')}
        END,
        rwm_exp_${year} = CASE urn
          ${updates.map(u => `WHEN '${u.urn}' THEN ${u.rwmExp || 'NULL'}`).join(' ')}
        END,
        rwm_high_${year} = CASE urn
          ${updates.map(u => `WHEN '${u.urn}' THEN ${u.rwmHigh || 'NULL'}`).join(' ')}
        END,
        gps_exp_${year} = CASE urn
          ${updates.map(u => `WHEN '${u.urn}' THEN ${u.gpsExp || 'NULL'}`).join(' ')}
        END,
        gps_high_${year} = CASE urn
          ${updates.map(u => `WHEN '${u.urn}' THEN ${u.gpsHigh || 'NULL'}`).join(' ')}
        END
      WHERE urn IN (${updates.map(u => `'${u.urn}'`).join(', ')})
      AND data_year = ${parseInt(year)};
    `;
    
    // Execute SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`Error updating ${year} data:`, error);
    } else {
      console.log(`✅ ${year} completed: ${updates.length} schools updated`);
    }

  } catch (error) {
    console.error(`❌ Error updating ${year}:`, error);
  }
}

async function main() {
  console.log('🚀 Starting SQL bulk update...');
  console.log('Using single SQL queries for maximum speed');
  
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
