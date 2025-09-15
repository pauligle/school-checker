require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to safely truncate strings
function safeTruncate(str, maxLength) {
  if (!str || str === 'z') return null;
  return str.length > maxLength ? str.substring(0, maxLength) : str;
}

// Helper function to safely parse numbers
function safeParseInt(str) {
  if (!str || str === 'z' || str === '') return 0;
  const parsed = parseInt(str);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper function to safely parse floats
function safeParseFloat(str) {
  if (!str || str === 'z' || str === '') return 0;
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

// Define the years and their corresponding CSV files
const yearsData = [
  {
    year: '2024',
    period: '202425',
    csvPath: 'data/raw/primary-secondary-admissions/2024/supporting-files/AppsandOffers_2024_SchoolLevel.csv'
  },
  {
    year: '2023',
    period: '202324',
    csvPath: 'data/raw/primary-secondary-admissions/2023/supporting-files/AppsandOffers_2023_SchoolLevel.csv'
  },
  {
    year: '2022',
    period: '202223',
    csvPath: 'data/raw/primary-secondary-admissions/2022/supporting-files/AppsandOffers_2022_SchoolLevel.csv'
  },
  {
    year: '2021',
    period: '202122',
    csvPath: 'data/raw/primary-secondary-admissions/2021/data/applicationsandoffers_2021.csv'
  },
  {
    year: '2020',
    period: '202021',
    csvPath: 'data/raw/primary-secondary-admissions/2020/data/appsandoffers2020.csv'
  }
];

async function importYearData(yearInfo) {
  try {
    console.log(`\n📅 Importing ${yearInfo.year} data...`);
    
    // Check if file exists
    if (!fs.existsSync(yearInfo.csvPath)) {
      console.log(`❌ File not found: ${yearInfo.csvPath}`);
      return 0;
    }

    // Read the CSV file as text
    const csvContent = fs.readFileSync(yearInfo.csvPath, 'utf8');
    
    // Split into lines and skip header
    const lines = csvContent.split('\n');
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    console.log(`📊 Found ${dataLines.length} data lines for ${yearInfo.year}`);
    
    // Process in batches of 500 (smaller batches for debugging)
    const batchSize = 500;
    let processed = 0;
    
    for (let i = 0; i < dataLines.length; i += batchSize) {
      const batch = dataLines.slice(i, i + batchSize);
      const admissionsData = [];
      
      for (const line of batch) {
        const columns = line.split(',');
        
        // Only process school-level data for the specific year
        if (columns.length > 20 && columns[2] === 'School' && columns[0] === yearInfo.period) {
          try {
            admissionsData.push({
              time_period: safeTruncate(columns[0], 10),
              la_code: safeTruncate(columns[8], 20),
              la_name: safeTruncate(columns[9], 255),
              school_phase: safeTruncate(columns[10], 50),
              school_urn: safeTruncate(columns[33], 20),
              school_name: safeTruncate(columns[13], 255),
              total_places_offered: safeParseInt(columns[14]),
              number_preferred_offers: safeParseInt(columns[15]),
              number_1st_preference_offers: safeParseInt(columns[16]),
              number_2nd_preference_offers: safeParseInt(columns[17]),
              number_3rd_preference_offers: safeParseInt(columns[18]),
              times_put_as_any_preferred_school: safeParseInt(columns[19]),
              times_put_as_1st_preference: safeParseInt(columns[20]),
              times_put_as_2nd_preference: safeParseInt(columns[21]),
              times_put_as_3rd_preference: safeParseInt(columns[22]),
              proportion_1stprefs_v_1stprefoffers: safeParseFloat(columns[23]),
              proportion_1stprefs_v_totaloffers: safeParseFloat(columns[24]),
              applications_from_another_la: safeParseInt(columns[25]),
              offers_to_another_la: safeParseInt(columns[26]),
              establishment_type: safeTruncate(columns[27], 255),
              denomination: safeTruncate(columns[28], 255),
              fsm_eligible_percent: columns[29] === 'z' ? null : safeParseFloat(columns[29]),
              admissions_policy: safeTruncate(columns[30], 255),
              urban_rural: safeTruncate(columns[31], 255),
              allthrough_school: safeTruncate(columns[32], 10)
            });
          } catch (err) {
            console.log(`⚠️ Skipping malformed line: ${line.substring(0, 100)}...`);
          }
        }
      }
      
      if (admissionsData.length > 0) {
        console.log(`📦 Inserting batch ${Math.floor(i/batchSize) + 1}: ${admissionsData.length} records`);
        
        const { error } = await supabase
          .from('admissions')
          .insert(admissionsData);
          
        if (error) {
          console.error(`❌ Error inserting batch for ${yearInfo.year}:`, error.message);
          // Try to insert one record at a time to identify the problematic record
          for (let j = 0; j < admissionsData.length; j++) {
            try {
              const { error: singleError } = await supabase
                .from('admissions')
                .insert([admissionsData[j]]);
              if (!singleError) {
                processed++;
              } else {
                console.log(`⚠️ Skipping problematic record: ${JSON.stringify(admissionsData[j]).substring(0, 100)}...`);
              }
            } catch (err) {
              console.log(`⚠️ Skipping problematic record: ${JSON.stringify(admissionsData[j]).substring(0, 100)}...`);
            }
          }
        } else {
          processed += admissionsData.length;
        }
        
        console.log(`✅ Processed ${processed} admissions records for ${yearInfo.year}`);
      }
    }
    
    console.log(`🎉 ${yearInfo.year} data import completed! Total: ${processed} records`);
    return processed;
    
  } catch (error) {
    console.error(`❌ Error importing ${yearInfo.year} data:`, error);
    return 0;
  }
}

async function importRemainingYears() {
  try {
    console.log('🚀 Starting import for remaining years (2020-2024)...');
    
    let totalRecords = 0;
    
    for (const yearInfo of yearsData) {
      const records = await importYearData(yearInfo);
      totalRecords += records;
    }
    
    console.log(`\n🎊 Remaining years import completed! Total new records: ${totalRecords}`);
    
    // Show summary by year
    console.log('\n📈 Summary by year:');
    const allPeriods = ['202526', '202425', '202324', '202223', '202122', '202021'];
    for (const period of allPeriods) {
      const { data, error } = await supabase
        .from('admissions')
        .select('id', { count: 'exact' })
        .eq('time_period', period);
      
      if (!error && data) {
        const year = period.substring(0, 4);
        console.log(`  ${year}: ${data.length} records`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in remaining years import:', error);
  }
}

importRemainingYears();
