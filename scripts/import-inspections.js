#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importInspections() {
  console.log('🏆 Starting Ofsted Inspection Data Import...\n');
  
  // Get CSV file path from command line argument or use default
  const csvFile = process.argv[2] || 'data/raw/Management_information_-_state-funded_schools_-_latest_inspections_as_at_31_July_2025.csv';
  
  if (!fs.existsSync(csvFile)) {
    console.error('❌ Inspection CSV file not found:', csvFile);
    return;
  }
  
  console.log('📊 Reading inspection data...');
  
  const inspections = [];
  let rowCount = 0;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;
        
        // Clean and process the data
        const inspection = {
          urn: row.urn ? row.urn.trim() : null,
          school_name: row['School name'] ? row['School name'].trim() : null,
          ofsted_phase: row['Ofsted phase'] ? row['Ofsted phase'].trim() : null,
          type_of_education: row['Type of education'] ? row['Type of education'].trim() : null,
          local_authority: row['Local authority'] ? row['Local authority'].trim() : null,
          postcode: row.Postcode ? row.Postcode.trim() : null,
          total_pupils: row['Total number of pupils'] ? parseInt(row['Total number of pupils']) : null,
          statutory_low_age: row['Statutory lowest age'] ? parseInt(row['Statutory lowest age']) : null,
          statutory_high_age: row['Statutory highest age'] ? parseInt(row['Statutory highest age']) : null,
          
          // Latest graded inspection data
          latest_inspection_number: row['Inspection number of latest graded inspection'] ? row['Inspection number of latest graded inspection'].trim() : null,
          inspection_type: row['Inspection type'] ? row['Inspection type'].trim() : null,
          inspection_date: row.inspection_date ? row.inspection_date.trim() : null,
          publication_date: row['Publication date'] ? row['Publication date'].trim() : null,
          outcome: row.outcome ? parseInt(row.outcome) : null, // 1=Outstanding, 2=Good, 3=Requires improvement, 4=Inadequate
          category_of_concern: row['Category of concern'] ? row['Category of concern'].trim() : null,
          quality_of_education: row['Quality of education'] ? parseInt(row['Quality of education']) : null,
          behaviour_and_attitudes: row['Behaviour and attitudes'] ? parseInt(row['Behaviour and attitudes']) : null,
          personal_development: row['Personal development'] ? parseInt(row['Personal development']) : null,
          effectiveness_of_leadership: row['Effectiveness of leadership and management'] ? parseInt(row['Effectiveness of leadership and management']) : null,
          safeguarding_effective: row['Safeguarding is effective?'] ? row['Safeguarding is effective?'].trim() : null,
          early_years_provision: row['Early years provision (where applicable)'] ? parseInt(row['Early years provision (where applicable)']) : null,
          sixth_form_provision: row['Sixth form provision (where applicable)'] ? parseInt(row['Sixth form provision (where applicable)']) : null,
          
          // Previous inspection data
          previous_inspection_number: row['Previous graded inspection number'] ? row['Previous graded inspection number'].trim() : null,
          previous_inspection_date: row['Previous inspection start date'] ? row['Previous inspection start date'].trim() : null,
          previous_publication_date: row['Previous publication date'] ? row['Previous publication date'].trim() : null,
          previous_outcome: row['Previous graded inspection overall effectiveness'] ? parseInt(row['Previous graded inspection overall effectiveness']) : null,
          
          // Ungraded inspection data
          latest_ungraded_inspection_number: row['Latest ungraded inspection number since last graded inspection'] ? row['Latest ungraded inspection number since last graded inspection'].trim() : null,
          ungraded_inspection_date: row['Date of latest ungraded inspection'] ? row['Date of latest ungraded inspection'].trim() : null,
          ungraded_publication_date: row['Ungraded inspection publication date'] ? row['Ungraded inspection publication date'].trim() : null,
          ungraded_outcome: row['Ungraded inspection overall outcome'] ? row['Ungraded inspection overall outcome'].trim() : null,
          
          // Web link
          ofsted_report_url: row['Web link'] ? row['Web link'].trim() : null,
          
          // Import metadata
          import_date: new Date().toISOString(),
          data_source: 'Management_information_-_state-funded_schools_-_latest_inspections_as_at_31_July_2025.csv'
        };
        
        // Only add if we have a URN
        if (inspection.urn) {
          inspections.push(inspection);
        }
        
        if (rowCount % 1000 === 0) {
          console.log(`📊 Processed ${rowCount} rows...`);
        }
      })
      .on('end', async () => {
        console.log(`✅ Finished reading CSV. Total rows: ${rowCount}, Valid inspections: ${inspections.length}\n`);
        
        // Check if inspections table exists
        console.log('🏗️ Checking inspections table...');
        
        const { error: checkError } = await supabase
          .from('inspections')
          .select('id')
          .limit(1);
          
        if (checkError && checkError.code === 'PGRST116') {
          console.error('❌ Inspections table does not exist. Please run the SQL script first:');
          console.error('   Run: psql -h your-host -U postgres -d your-db -f scripts/create-inspections-table.sql');
          reject(new Error('Inspections table not found'));
          return;
        }
        
        console.log('✅ Inspections table exists\n');
        
        // Import data in batches
        console.log('📥 Importing inspection data...');
        
        const batchSize = 1000;
        let imported = 0;
        let errors = 0;
        
        for (let i = 0; i < inspections.length; i += batchSize) {
          const batch = inspections.slice(i, i + batchSize);
          
          const { error: insertError } = await supabase
            .from('inspections')
            .upsert(batch, { onConflict: 'urn' });
            
          if (insertError) {
            console.error(`❌ Error importing batch ${Math.floor(i/batchSize) + 1}:`, insertError);
            errors += batch.length;
          } else {
            imported += batch.length;
            console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(inspections.length/batchSize)} (${imported}/${inspections.length} inspections)`);
          }
        }
        
        console.log(`\n🎉 Import completed!`);
        console.log(`✅ Successfully imported: ${imported} inspections`);
        console.log(`❌ Errors: ${errors} inspections`);
        
        // Show summary of imported data
        console.log('\n📊 Inspection data summary:');
        
        const { data: summaryData, error: summaryError } = await supabase
          .from('inspections')
          .select('outcome')
          .not('outcome', 'is', null);
          
        if (!summaryError && summaryData) {
          const ratingCounts = {};
          summaryData.forEach(inspection => {
            const rating = inspection.outcome;
            const ratingName = rating === 1 ? 'Outstanding' : 
                             rating === 2 ? 'Good' : 
                             rating === 3 ? 'Requires improvement' : 
                             rating === 4 ? 'Inadequate' : 'Unknown';
            ratingCounts[ratingName] = (ratingCounts[ratingName] || 0) + 1;
          });
          
          console.log('📈 Ofsted Rating Distribution:');
          Object.entries(ratingCounts).forEach(([rating, count]) => {
            console.log(`   ${rating}: ${count} schools`);
          });
        }
        
        resolve();
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        reject(error);
      });
  });
}

// Run the import
importInspections()
  .then(() => {
    console.log('\n🏆 Ofsted inspection data import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });
