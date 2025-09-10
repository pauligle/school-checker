const fs = require('fs');
const csv = require('csv-parser');
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

// Function to clean and convert data
function cleanData(row) {
  const cleanValue = (value) => {
    if (!value || value === 'SUPP' || value === 'NE' || value === '') {
      return null;
    }
    return parseFloat(value);
  };

  return {
    urn: parseInt(row.URN) || null,
    school_name: row.SCHNAME || null,
    lea_code: parseInt(row.LEA) || null,
    establishment_number: parseInt(row.ESTAB) || null,
    school_type: row.NFTYPE || null,
    age_range: row.AGERANGE || null,
    total_pupils: parseInt(row.TOTPUPS) || null,
    eligible_pupils: parseInt(row.TELIG) || null,
    
    // Reading, Writing and Maths combined
    rwm_expected_percentage: cleanValue(row.PTRWM_EXP),
    rwm_higher_percentage: cleanValue(row.PTRWM_HIGH),
    
    // Reading
    reading_expected_percentage: cleanValue(row.PTREAD_EXP),
    reading_higher_percentage: cleanValue(row.PTREAD_HIGH),
    reading_average_score: cleanValue(row.READ_AVERAGE),
    
    // Maths
    maths_expected_percentage: cleanValue(row.PTMAT_EXP),
    maths_higher_percentage: cleanValue(row.PTMAT_HIGH),
    maths_average_score: cleanValue(row.MAT_AVERAGE),
    
    // Grammar, Punctuation and Spelling
    gps_expected_percentage: cleanValue(row.PTGPS_EXP),
    gps_higher_percentage: cleanValue(row.PTGPS_HIGH),
    gps_average_score: cleanValue(row.GPS_AVERAGE),
    
    // Writing (Teacher Assessment)
    writing_expected_percentage: cleanValue(row.PTWRITTA_EXP),
    writing_higher_percentage: cleanValue(row.PTWRITTA_HIGH),
    
    // Science (Teacher Assessment)
    science_expected_percentage: cleanValue(row.PTSCITA_EXP),
    
    // Disadvantaged pupils performance
    disadvantaged_rwm_expected: cleanValue(row.PTRWM_EXP_FSM6CLA1A),
    disadvantaged_rwm_higher: cleanValue(row.PTRWM_HIGH_FSM6CLA1A),
    non_disadvantaged_rwm_expected: cleanValue(row.PTRWM_EXP_NotFSM6CLA1A),
    non_disadvantaged_rwm_higher: cleanValue(row.PTRWM_HIGH_NotFSM6CLA1A),
    
    // Gender breakdown
    boys_rwm_expected: cleanValue(row.PTRWM_EXP_B),
    boys_rwm_higher: cleanValue(row.PTRWM_HIGH_B),
    girls_rwm_expected: cleanValue(row.PTRWM_EXP_G),
    girls_rwm_higher: cleanValue(row.PTRWM_HIGH_G),
    
    // EAL pupils
    eal_rwm_expected: cleanValue(row.PTRWM_EXP_EAL),
    eal_rwm_higher: cleanValue(row.PTRWM_HIGH_EAL),
    
    data_year: 2024 // Current year data
  };
}

// Function to import Primary Results data
async function importPrimaryResultsData() {
  const csvFilePath = 'data/raw/england_ks2final.csv';
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`CSV file not found: ${csvFilePath}`);
    return;
  }

  console.log('Starting Primary Results data import...');
  
  const results = [];
  let processedCount = 0;
  let skippedCount = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Only process individual schools (RECTYPE = 1)
        if (row.RECTYPE === '1' && row.URN && row.SCHNAME) {
          const cleanedData = cleanData(row);
          
          // Only include schools with valid URN and some performance data
          if (cleanedData.urn && (
            cleanedData.rwm_expected_percentage !== null ||
            cleanedData.reading_average_score !== null ||
            cleanedData.maths_average_score !== null
          )) {
            results.push(cleanedData);
            processedCount++;
          } else {
            skippedCount++;
          }
        }
      })
      .on('end', async () => {
        console.log(`Processed ${processedCount} schools, skipped ${skippedCount}`);
        
        if (results.length === 0) {
          console.log('No valid data found to import');
          resolve();
          return;
        }

        try {
          // Import in batches of 1000
          const batchSize = 1000;
          const totalBatches = Math.ceil(results.length / batchSize);
          
          console.log(`Importing ${results.length} records in ${totalBatches} batches...`);
          
          for (let i = 0; i < totalBatches; i++) {
            const start = i * batchSize;
            const end = Math.min(start + batchSize, results.length);
            const batch = results.slice(start, end);
            
            console.log(`Importing batch ${i + 1}/${totalBatches} (${batch.length} records)...`);
            
            const { data, error } = await supabase
              .from('primary_results')
              .upsert(batch, { 
                onConflict: 'urn',
                ignoreDuplicates: false 
              });
            
            if (error) {
              console.error(`Error importing batch ${i + 1}:`, error.message);
              throw error;
            }
            
            console.log(`✓ Batch ${i + 1} imported successfully`);
          }
          
          console.log('✅ Primary Results data import completed successfully!');
          console.log(`📊 Total schools imported: ${results.length}`);
          
          // Show some sample data
          console.log('\n📋 Sample imported data:');
          const sampleData = results.slice(0, 3);
          sampleData.forEach(school => {
            console.log(`- ${school.school_name} (URN: ${school.urn})`);
            console.log(`  RWM Expected: ${school.rwm_expected_percentage}%`);
            console.log(`  Reading Score: ${school.reading_average_score}`);
            console.log(`  Maths Score: ${school.maths_average_score}`);
            console.log(`  GPS Expected: ${school.gps_expected_percentage}%`);
          });
          
          resolve();
        } catch (error) {
          console.error('Import failed:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      });
  });
}

// Function to create Local Authority and England averages table
async function createAveragesTable() {
  console.log('Creating Local Authority and England averages...');
  
  const csvFilePath = 'data/raw/england_ks2final.csv';
  const averages = {
    localAuthorities: [],
    england: null
  };

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Local Authority data (RECTYPE = 3)
        if (row.RECTYPE === '3' && row.LEA) {
          averages.localAuthorities.push({
            lea_code: parseInt(row.LEA),
            lea_name: row.SCHNAME,
            rwm_expected_percentage: parseFloat(row.PTRWM_EXP) || null,
            rwm_higher_percentage: parseFloat(row.PTRWM_HIGH) || null,
            reading_average_score: parseFloat(row.READ_AVERAGE) || null,
            maths_average_score: parseFloat(row.MAT_AVERAGE) || null,
            gps_expected_percentage: parseFloat(row.PTGPS_EXP) || null,
            gps_higher_percentage: parseFloat(row.PTGPS_HIGH) || null,
            data_year: 2024
          });
        }
        
        // England data (RECTYPE = 4)
        if (row.RECTYPE === '4') {
          averages.england = {
            rwm_expected_percentage: parseFloat(row.PTRWM_EXP) || null,
            rwm_higher_percentage: parseFloat(row.PTRWM_HIGH) || null,
            reading_average_score: parseFloat(row.READ_AVERAGE) || null,
            maths_average_score: parseFloat(row.MAT_AVERAGE) || null,
            gps_expected_percentage: parseFloat(row.PTGPS_EXP) || null,
            gps_higher_percentage: parseFloat(row.PTGPS_HIGH) || null,
            data_year: 2024
          };
        }
      })
      .on('end', async () => {
        try {
          // Create LA averages table
          const { error: laError } = await supabase
            .from('la_averages')
            .upsert(averages.localAuthorities, { 
              onConflict: 'lea_code',
              ignoreDuplicates: false 
            });
          
          if (laError) {
            console.error('Error importing LA averages:', laError.message);
          } else {
            console.log(`✓ Imported ${averages.localAuthorities.length} Local Authority averages`);
          }
          
          // Create England averages table
          if (averages.england) {
            const { error: englandError } = await supabase
              .from('england_averages')
              .upsert([averages.england], { 
                onConflict: 'data_year',
                ignoreDuplicates: false 
              });
            
            if (englandError) {
              console.error('Error importing England averages:', englandError.message);
            } else {
              console.log('✓ Imported England averages');
            }
          }
          
          resolve();
        } catch (error) {
          console.error('Error creating averages:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV for averages:', error);
        reject(error);
      });
  });
}

// Main execution
async function main() {
  try {
    await importPrimaryResultsData();
    await createAveragesTable();
    console.log('\n🎉 All Primary Results data imported successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { importPrimaryResultsData, createAveragesTable };
