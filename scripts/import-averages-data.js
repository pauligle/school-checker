const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

// Function to import averages data
async function importAveragesData() {
  const csvFilePath = 'data/raw/england_ks2final.csv';
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`CSV file not found: ${csvFilePath}`);
    return;
  }

  console.log('Starting averages data import...');
  
  const fileContent = fs.readFileSync(csvFilePath, 'utf8');
  const lines = fileContent.split('\n');
  
  const header = parseCSVLine(lines[0]);
  console.log(`Found ${header.length} columns in CSV`);
  
  const laAverages = [];
  let englandAverages = null;

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const row = parseCSVLine(lines[i]);
    
    // Local Authority data (RECTYPE = 3)
    if (row[0] === '3' && row[2]) { // RECTYPE, LEA
      const cleanValue = (value) => {
        if (!value || value === 'SUPP' || value === 'NE' || value === '') {
          return null;
        }
        return parseFloat(value);
      };

      const laData = {
        lea_code: parseInt(row[2]) || null,
        lea_name: row[5] || null,
        rwm_expected_percentage: cleanValue(row[47]), // PTRWM_EXP
        rwm_higher_percentage: cleanValue(row[48]),   // PTRWM_HIGH
        reading_average_score: cleanValue(row[64]),   // READ_AVERAGE
        maths_average_score: cleanValue(row[72]),     // MAT_AVERAGE
        gps_expected_percentage: cleanValue(row[66]),  // PTGPS_EXP
        gps_higher_percentage: cleanValue(row[67]),   // PTGPS_HIGH
        data_year: 2024
      };

      if (laData.lea_code) {
        laAverages.push(laData);
      }
    }
    
    // England data (RECTYPE = 4)
    if (row[0] === '4') {
      const cleanValue = (value) => {
        if (!value || value === 'SUPP' || value === 'NE' || value === '') {
          return null;
        }
        return parseFloat(value);
      };

      englandAverages = {
        data_year: 2024,
        rwm_expected_percentage: cleanValue(row[47]), // PTRWM_EXP
        rwm_higher_percentage: cleanValue(row[48]),   // PTRWM_HIGH
        reading_average_score: cleanValue(row[64]),    // READ_AVERAGE
        maths_average_score: cleanValue(row[72]),      // MAT_AVERAGE
        gps_expected_percentage: cleanValue(row[66]),  // PTGPS_EXP
        gps_higher_percentage: cleanValue(row[67]),   // PTGPS_HIGH
      };
    }
  }

  console.log(`Found ${laAverages.length} Local Authority averages`);
  console.log(`Found England averages:`, englandAverages ? 'Yes' : 'No');

  try {
    // Import LA averages
    if (laAverages.length > 0) {
      console.log('Importing Local Authority averages...');
      
      const { data, error } = await supabase
        .from('la_averages')
        .upsert(laAverages, { 
          onConflict: 'lea_code',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('Error importing LA averages:', error.message);
        throw error;
      }
      
      console.log(`✓ Imported ${laAverages.length} Local Authority averages`);
    }

    // Import England averages
    if (englandAverages) {
      console.log('Importing England averages...');
      
      const { data, error } = await supabase
        .from('england_averages')
        .upsert([englandAverages], { 
          onConflict: 'data_year',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('Error importing England averages:', error.message);
        throw error;
      }
      
      console.log('✓ Imported England averages');
    }
    
    console.log('✅ Averages data import completed successfully!');
    
    // Show sample data
    if (laAverages.length > 0) {
      console.log('\n📋 Sample LA averages:');
      laAverages.slice(0, 3).forEach(la => {
        console.log(`- ${la.lea_name} (${la.lea_code}): RWM ${la.rwm_expected_percentage}%, Reading ${la.reading_average_score}`);
      });
    }
    
    if (englandAverages) {
      console.log('\n📋 England averages:');
      console.log(`- RWM Expected: ${englandAverages.rwm_expected_percentage}%`);
      console.log(`- Reading Score: ${englandAverages.reading_average_score}`);
      console.log(`- Maths Score: ${englandAverages.maths_average_score}`);
    }
    
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await importAveragesData();
    console.log('\n🎉 Averages data import completed!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { importAveragesData };




