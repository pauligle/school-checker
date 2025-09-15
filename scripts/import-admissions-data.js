require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importAdmissionsData() {
  console.log('Starting admissions data import...');
  
  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'data/raw/primary-secondary-admissions/2025-2026/supporting-files/AppsandOffers_2025_SchoolLevel18062025.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }

    console.log(`Reading CSV file: ${csvPath}`);
    
    const admissionsData = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          // Only process school-level data for 2025
          if (row.geographic_level === 'School' && row.time_period === '202526') {
            admissionsData.push({
              time_period: row.time_period,
              la_code: row.new_la_code,
              la_name: row.la_name,
              school_phase: row.school_phase,
              school_laestab: row.school_laestab_as_used,
              school_name: row.school_name,
              school_urn: row.school_urn,
              entry_year: row.entry_year,
              
              // Application data
              total_places_offered: parseInt(row.total_number_places_offered) || 0,
              number_preferred_offers: parseInt(row.number_preferred_offers) || 0,
              number_1st_preference_offers: parseInt(row.number_1st_preference_offers) || 0,
              number_2nd_preference_offers: parseInt(row.number_2nd_preference_offers) || 0,
              number_3rd_preference_offers: parseInt(row.number_3rd_preference_offers) || 0,
              
              // Preference data
              times_put_as_any_preferred_school: parseInt(row.times_put_as_any_preferred_school) || 0,
              times_put_as_1st_preference: parseInt(row.times_put_as_1st_preference) || 0,
              times_put_as_2nd_preference: parseInt(row.times_put_as_2nd_preference) || 0,
              times_put_as_3rd_preference: parseInt(row.times_put_as_3rd_preference) || 0,
              
              // Proportions
              proportion_1stprefs_v_1stprefoffers: parseFloat(row.proportion_1stprefs_v_1stprefoffers) || 0,
              proportion_1stprefs_v_totaloffers: parseFloat(row.proportion_1stprefs_v_totaloffers) || 0,
              
              // Cross-LA data
              all_applications_from_another_LA: parseInt(row.all_applications_from_another_LA) || 0,
              offers_to_applicants_from_another_LA: parseInt(row.offers_to_applicants_from_another_LA) || 0,
              
              // School details
              establishment_type: row.establishment_type || null,
              denomination: row.denomination || null,
              fsm_eligible_percent: parseFloat(row.FSM_eligible_percent) || null,
              admissions_policy: row.admissions_policy || null,
              urban_rural: row.urban_rural || null,
              allthrough_school: row.allthrough_school || null
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Processed ${admissionsData.length} admissions records`);

    // Create the admissions table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS admissions (
        id SERIAL PRIMARY KEY,
        time_period VARCHAR(10) NOT NULL,
        la_code VARCHAR(20) NOT NULL,
        la_name VARCHAR(255) NOT NULL,
        school_phase VARCHAR(50) NOT NULL,
        school_laestab VARCHAR(20) NOT NULL,
        school_name VARCHAR(255) NOT NULL,
        school_urn VARCHAR(20),
        entry_year VARCHAR(10),
        
        -- Application data
        total_places_offered INTEGER DEFAULT 0,
        number_preferred_offers INTEGER DEFAULT 0,
        number_1st_preference_offers INTEGER DEFAULT 0,
        number_2nd_preference_offers INTEGER DEFAULT 0,
        number_3rd_preference_offers INTEGER DEFAULT 0,
        
        -- Preference data
        times_put_as_any_preferred_school INTEGER DEFAULT 0,
        times_put_as_1st_preference INTEGER DEFAULT 0,
        times_put_as_2nd_preference INTEGER DEFAULT 0,
        times_put_as_3rd_preference INTEGER DEFAULT 0,
        
        -- Proportions
        proportion_1stprefs_v_1stprefoffers DECIMAL(10,6) DEFAULT 0,
        proportion_1stprefs_v_totaloffers DECIMAL(10,6) DEFAULT 0,
        
        -- Cross-LA data
        all_applications_from_another_LA INTEGER DEFAULT 0,
        offers_to_applicants_from_another_LA INTEGER DEFAULT 0,
        
        -- School details
        establishment_type VARCHAR(255),
        denomination VARCHAR(255),
        fsm_eligible_percent DECIMAL(5,2),
        admissions_policy VARCHAR(255),
        urban_rural VARCHAR(255),
        allthrough_school VARCHAR(10),
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    if (createError) {
      console.log('Table might already exist or error creating:', createError);
    } else {
      console.log('✅ Admissions table created successfully');
    }

    // Clear existing data for 2025
    const { error: deleteError } = await supabase
      .from('admissions')
      .delete()
      .eq('time_period', '202526');

    if (deleteError) {
      console.error('Error clearing existing data:', deleteError);
    } else {
      console.log('Cleared existing 2025 admissions data');
    }

    // Insert new data in batches
    const batchSize = 1000;
    for (let i = 0; i < admissionsData.length; i += batchSize) {
      const batch = admissionsData.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from('admissions')
        .insert(batch);

      if (insertError) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, insertError);
      } else {
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)`);
      }
    }

    console.log('✅ Admissions data import completed successfully!');
    
    // Show some sample data
    const { data: sampleData } = await supabase
      .from('admissions')
      .select('*')
      .eq('school_name', 'Harris Academy Chobham')
      .eq('school_phase', 'Primary')
      .limit(1);

    if (sampleData && sampleData.length > 0) {
      console.log('\n📊 Sample data for Harris Academy Chobham (Primary):');
      console.log(`Total Applications: ${sampleData[0].times_put_as_any_preferred_school}`);
      console.log(`Total Offers: ${sampleData[0].total_places_offered}`);
      console.log(`1st Preference Applications: ${sampleData[0].times_put_as_1st_preference}`);
      console.log(`1st Preference Offers: ${sampleData[0].number_1st_preference_offers}`);
      console.log(`Oversubscribed: ${sampleData[0].times_put_as_1st_preference > sampleData[0].number_1st_preference_offers ? 'Yes' : 'No'}`);
    }

  } catch (error) {
    console.error('❌ Error importing admissions data:', error);
    process.exit(1);
  }
}

// Run the import
importAdmissionsData();
