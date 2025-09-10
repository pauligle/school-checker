const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importSenDataFromCensus() {
  console.log('🚀 Importing SEN data from census files...');
  
  const censusFile = 'data/raw/results/2024/england_census.csv';
  
  if (!fs.existsSync(censusFile)) {
    console.error('❌ Census file not found:', censusFile);
    return;
  }
  
  const schools = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(censusFile)
      .pipe(csv())
      .on('data', (row) => {
        const urn = row.URN;
        const senWithStatements = parseInt(row.TSENELSE) || 0;
        const senWithStatementsPercentage = parseFloat(row.PSENELSE?.replace('%', '')) || 0;
        const senWithSupport = parseInt(row.TSENELK) || 0;
        const senWithSupportPercentage = parseFloat(row.PSENELK?.replace('%', '')) || 0;
        
        if (urn === '139703') {
          console.log('Harris Academy Chobham data:', {
            urn,
            senWithStatements,
            senWithStatementsPercentage,
            senWithSupport,
            senWithSupportPercentage
          });
        }
        
        if (urn) {
          schools.push({
            urn: urn,
            senstat: senWithStatements,
            sennostat: senWithSupport - senWithStatements, // SEN support minus those with statements
            sen_with_statements_percentage: senWithStatementsPercentage,
            sen_with_support_percentage: senWithSupportPercentage
          });
        }
      })
      .on('end', async () => {
        try {
          console.log(`📊 Found ${schools.length} schools with SEN data`);
          
          let updated = 0;
          for (const school of schools) {
            const { error } = await supabase
              .from('schools')
              .update({
                senstat: school.senstat,
                sennostat: school.sennostat,
                sen_with_statements_percentage: school.sen_with_statements_percentage,
                sen_with_support_percentage: school.sen_with_support_percentage,
                updated_at: new Date().toISOString()
              })
              .eq('urn', school.urn);
            
            if (error) {
              console.error(`❌ Error updating school ${school.urn}:`, error);
            } else {
              updated++;
            }
          }
          
          console.log(`✅ Updated ${updated} schools with SEN data`);
          resolve();
        } catch (error) {
          console.error('❌ Error:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        reject(error);
      });
  });
}

// Run the import
importSenDataFromCensus()
  .then(() => {
    console.log('🎉 SEN data import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });
