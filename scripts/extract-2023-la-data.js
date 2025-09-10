const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function extract2023LAData() {
  console.log('Extracting LA data from 2023 CSV...');
  
  const csvFile = 'data/raw/results/2023/england_ks2final.csv';
  
  if (!fs.existsSync(csvFile)) {
    console.log('2023 CSV file not found at:', csvFile);
    return;
  }
  
  const laData = new Map();
  let englandData = null;
  let rowCount = 0;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;
        
        // Debug: Check first few RECTYPE = 3 rows
        if (row['RECTYPE'] === '3' && rowCount < 10) {
          console.log(`Row ${rowCount}: RECTYPE=${row['RECTYPE']}, LEA=${row['LEA']}, SCHNAME=${row['SCHNAME']}`);
        }
        
        // Debug: Check if we're finding any RECTYPE = 3 rows (limit output)
        if (row['RECTYPE'] === '3' && laData.size < 5) {
          console.log(`Found RECTYPE=3 row ${rowCount}: LEA=${row['LEA']}, SCHNAME=${row['SCHNAME']}`);
        }
        
        // Look for England summary data (RECTYPE = 3, no LEA code, empty LEA field)
        if (row['RECTYPE'] === '3' && (!row['LEA'] || row['LEA'] === '' || row['LEA'] === '0')) {
          console.log('Found England data row:', {
            rwm_expected: row['PTRWM_EXP'],
            rwm_higher: row['PTRWM_HIGH'],
            gps_expected: row['PTGPS_EXP'],
            gps_higher: row['PTGPS_HIGH']
          });
          englandData = {
            rwm_expected_percentage: parseFloat(row['PTRWM_EXP']) || 0,
            rwm_higher_percentage: parseFloat(row['PTRWM_HIGH']) || 0,
            gps_expected_percentage: parseFloat(row['PTGPS_EXP']) || 0,
            gps_higher_percentage: parseFloat(row['PTGPS_HIGH']) || 0
          };
        }
        
        // Look for LA summary data (RECTYPE = 3, with LEA code)
        if (row['RECTYPE'] === '3' && row['LEA'] && row['LEA'] !== '' && row['LEA'] !== '0') {
          const laCode = parseInt(row['LEA']);
          if (!isNaN(laCode) && laCode > 0) {
            console.log(`Found LA ${laCode}: ${row['SCHNAME']} - RWM: ${row['PTRWM_EXP']}%/${row['PTRWM_HIGH']}%, GPS: ${row['PTGPS_EXP']}%/${row['PTGPS_HIGH']}%`);
            laData.set(laCode, {
              lea_code: laCode,
              lea_name: row['SCHNAME'] || `LA ${laCode}`,
              rwm_expected_percentage: parseFloat(row['PTRWM_EXP']) || 0,
              rwm_higher_percentage: parseFloat(row['PTRWM_HIGH']) || 0,
              gps_expected_percentage: parseFloat(row['PTGPS_EXP']) || 0,
              gps_higher_percentage: parseFloat(row['PTGPS_HIGH']) || 0
            });
          }
        }
      })
      .on('end', async () => {
        console.log(`\nProcessed ${rowCount} rows`);
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
        
        resolve();
      })
      .on('error', reject);
  });
}

extract2023LAData().catch(console.error);
