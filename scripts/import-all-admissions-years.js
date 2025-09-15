require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Define the years and their corresponding CSV files
const yearsData = [
  {
    year: '2025',
    period: '202526',
    csvPath: 'data/raw/primary-secondary-admissions/2025/supporting-files/AppsandOffers_2025_SchoolLevel18062025.csv'
  },
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
    
    // Process in batches of 1000
    const batchSize = 1000;
    let processed = 0;
    
    for (let i = 0; i < dataLines.length; i += batchSize) {
      const batch = dataLines.slice(i, i + batchSize);
      const admissionsData = [];
      
      for (const line of batch) {
        const columns = line.split(',');
        
        // Only process school-level data for the specific year
        if (columns[2] === 'School' && columns[0] === yearInfo.period) {
          admissionsData.push({
            time_period: columns[0],
            la_code: columns[8],
            la_name: columns[9],
            school_phase: columns[10],
            school_urn: columns[33] === 'z' ? null : columns[33],
            school_name: columns[13],
            total_places_offered: parseInt(columns[14]) || 0,
            number_preferred_offers: parseInt(columns[15]) || 0,
            number_1st_preference_offers: parseInt(columns[16]) || 0,
            number_2nd_preference_offers: parseInt(columns[17]) || 0,
            number_3rd_preference_offers: parseInt(columns[18]) || 0,
            times_put_as_any_preferred_school: parseInt(columns[19]) || 0,
            times_put_as_1st_preference: parseInt(columns[20]) || 0,
            times_put_as_2nd_preference: parseInt(columns[21]) || 0,
            times_put_as_3rd_preference: parseInt(columns[22]) || 0,
            proportion_1stprefs_v_1stprefoffers: parseFloat(columns[23]) || 0,
            proportion_1stprefs_v_totaloffers: parseFloat(columns[24]) || 0,
            applications_from_another_la: parseInt(columns[25]) || 0,
            offers_to_another_la: parseInt(columns[26]) || 0,
            establishment_type: columns[27] === 'z' ? null : columns[27],
            denomination: columns[28] === 'z' ? null : columns[28],
            fsm_eligible_percent: columns[29] === 'z' ? null : parseFloat(columns[29]),
            admissions_policy: columns[30] === 'z' ? null : columns[30],
            urban_rural: columns[31] === 'z' ? null : columns[31],
            allthrough_school: columns[32] === 'z' ? null : columns[32]
          });
        }
      }
      
      if (admissionsData.length > 0) {
        console.log(`📦 Inserting batch ${Math.floor(i/batchSize) + 1}: ${admissionsData.length} records`);
        
        const { error } = await supabase
          .from('admissions')
          .insert(admissionsData);
          
        if (error) {
          console.error(`❌ Error inserting batch for ${yearInfo.year}:`, error);
          return processed;
        }
        
        processed += admissionsData.length;
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

async function importAllYears() {
  try {
    console.log('🚀 Starting comprehensive admissions data import for all years...');
    
    let totalRecords = 0;
    
    for (const yearInfo of yearsData) {
      const records = await importYearData(yearInfo);
      totalRecords += records;
    }
    
    console.log(`\n🎊 All years import completed! Total records across all years: ${totalRecords}`);
    
    // Show summary by year
    console.log('\n📈 Summary by year:');
    for (const yearInfo of yearsData) {
      const { data, error } = await supabase
        .from('admissions')
        .select('id', { count: 'exact' })
        .eq('time_period', yearInfo.period);
      
      if (!error && data) {
        console.log(`  ${yearInfo.year}: ${data.length} records`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in comprehensive import:', error);
  }
}

importAllYears();
