const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function extract2023LAData() {
  console.log('Extracting LA data from 2023 CSV using simple method...');
  
  const csvFile = 'data/raw/results/2023/england_ks2final.csv';
  
  if (!fs.existsSync(csvFile)) {
    console.log('2023 CSV file not found at:', csvFile);
    return;
  }
  
  // Read the file and split by lines
  const fileContent = fs.readFileSync(csvFile, 'utf8');
  const lines = fileContent.split('\n');
  
  console.log(`Total lines in file: ${lines.length}`);
  
  const laData = new Map();
  let englandData = null;
  let processedRows = 0;
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const columns = line.split(',');
    if (columns.length < 3) continue;
    
    const rectype = columns[0];
    const lea = columns[2];
    const schname = columns[5];
    
    processedRows++;
    
    if (rectype === '3') {
      console.log(`Found RECTYPE=3 row ${i}: LEA=${lea}, SCHNAME=${schname}`);
      
      // Check if this is England data (no LEA code)
      if (!lea || lea === '' || lea === '0') {
        console.log('Found England data row');
        englandData = {
          rwm_expected_percentage: parseFloat(columns[47]) || 0, // PTRWM_EXP
          rwm_higher_percentage: parseFloat(columns[48]) || 0,   // PTRWM_HIGH
          gps_expected_percentage: parseFloat(columns[65]) || 0, // PTGPS_EXP
          gps_higher_percentage: parseFloat(columns[66]) || 0    // PTGPS_HIGH
        };
      } else {
        // This is LA data
        const laCode = parseInt(lea);
        if (!isNaN(laCode) && laCode > 0) {
          laData.set(laCode, {
            lea_code: laCode,
            lea_name: schname || `LA ${laCode}`,
            rwm_expected_percentage: parseFloat(columns[47]) || 0, // PTRWM_EXP
            rwm_higher_percentage: parseFloat(columns[48]) || 0,   // PTRWM_HIGH
            gps_expected_percentage: parseFloat(columns[65]) || 0, // PTGPS_EXP
            gps_higher_percentage: parseFloat(columns[66]) || 0    // PTGPS_HIGH
          });
        }
      }
    }
  }
  
  console.log(`\nProcessed ${processedRows} rows`);
  console.log('Found England data:', englandData);
  console.log(`Found LA data for ${laData.size} LAs`);
  
  // Show first 10 LA entries
  console.log('\nFirst 10 LA entries:');
  let count = 0;
  for (const [laCode, data] of laData) {
    if (count < 10) {
      console.log(`LA ${laCode}: RWM ${data.rwm_expected_percentage}%/${data.rwm_higher_percentage}%, GPS ${data.gps_expected_percentage}%/${data.gps_higher_percentage}%`);
      count++;
    }
  }
  
  // Update England data
  if (englandData) {
    console.log('\nUpdating England data...');
    const { error: englandError } = await supabase
      .from('england_averages')
      .update({
        rwm_expected_percentage: englandData.rwm_expected_percentage,
        rwm_higher_percentage: englandData.rwm_higher_percentage,
        gps_expected_percentage: englandData.gps_expected_percentage,
        gps_higher_percentage: englandData.gps_higher_percentage,
      })
      .eq('data_year', 2023);
    
    if (englandError) {
      console.error('Error updating England data:', englandError);
    } else {
      console.log('✅ England data updated successfully');
    }
  }
  
  // Update LA data
  console.log('\nUpdating LA data...');
  let successCount = 0;
  let errorCount = 0;
  
  for (const [laCode, data] of laData) {
    const { error: laError } = await supabase
      .from('la_averages')
      .update({
        rwm_expected_percentage: data.rwm_expected_percentage,
        rwm_higher_percentage: data.rwm_higher_percentage,
        gps_expected_percentage: data.gps_expected_percentage,
        gps_higher_percentage: data.gps_higher_percentage,
      })
      .eq('lea_code', laCode)
      .eq('data_year', 2023);
    
    if (laError) {
      console.error(`Error updating LA ${laCode}:`, laError);
      errorCount++;
    } else {
      successCount++;
    }
  }
  
  console.log(`\n✅ LA data update complete:`);
  console.log(`   - Successfully updated: ${successCount} LAs`);
  console.log(`   - Errors: ${errorCount} LAs`);
}

extract2023LAData().catch(console.error);
