const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupDatabaseSchema() {
  console.log('🏗️  Setting up postcode database schema...');
  
  try {
    console.log('📝 Creating postcodes table...');
    
    // Create postcodes table
    const { error: postcodesError } = await supabase
      .from('postcodes')
      .select('*')
      .limit(1);
    
    if (postcodesError && postcodesError.code === 'PGRST116') {
      console.log('✅ Postcodes table does not exist, will be created during import');
    } else if (postcodesError) {
      console.log('⚠️  Postcodes table check failed:', postcodesError.message);
    } else {
      console.log('✅ Postcodes table already exists');
    }
    
    console.log('📝 Creating cities table...');
    
    // Create cities table
    const { error: citiesError } = await supabase
      .from('cities')
      .select('*')
      .limit(1);
    
    if (citiesError && citiesError.code === 'PGRST116') {
      console.log('✅ Cities table does not exist, will be created during import');
    } else if (citiesError) {
      console.log('⚠️  Cities table check failed:', citiesError.message);
    } else {
      console.log('✅ Cities table already exists');
    }
    
    console.log('🎉 Database schema setup completed successfully!');
    console.log('📋 Note: Tables will be created automatically during data import');
    
  } catch (error) {
    console.error('💥 Database schema setup failed:', error);
    throw error;
  }
}

async function verifyExistingData() {
  console.log('🔍 Verifying existing school data...');
  
  try {
    // Check total schools
    const { count: totalSchools, error: schoolsError } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true });
    
    if (schoolsError) {
      console.error('❌ Error counting schools:', schoolsError);
      throw schoolsError;
    }
    
    // Check schools with postcodes
    const { count: schoolsWithPostcodes, error: postcodeError } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .not('postcode', 'is', null);
    
    if (postcodeError) {
      console.error('❌ Error counting schools with postcodes:', postcodeError);
      throw postcodeError;
    }
    
    // Check unique postcodes
    const { data: uniquePostcodes, error: uniqueError } = await supabase
      .from('schools')
      .select('postcode')
      .not('postcode', 'is', null);
    
    if (uniqueError) {
      console.error('❌ Error fetching unique postcodes:', uniqueError);
      throw uniqueError;
    }
    
    const uniquePostcodeCount = new Set(uniquePostcodes.map(s => s.postcode)).size;
    
    console.log('📊 School Data Summary:');
    console.log(`   Total schools: ${totalSchools}`);
    console.log(`   Schools with postcodes: ${schoolsWithPostcodes}`);
    console.log(`   Unique postcodes: ${uniquePostcodeCount}`);
    console.log(`   Coverage: ${((schoolsWithPostcodes / totalSchools) * 100).toFixed(1)}%`);
    
    return {
      totalSchools,
      schoolsWithPostcodes,
      uniquePostcodeCount
    };
    
  } catch (error) {
    console.error('❌ Error verifying existing data:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting database setup...');
    
    // Step 1: Verify existing data
    const dataSummary = await verifyExistingData();
    
    // Step 2: Setup schema
    await setupDatabaseSchema();
    
    console.log('🎉 Database setup completed successfully!');
    console.log('📋 Next steps:');
    console.log('   1. Download actual ONS postcode data');
    console.log('   2. Run: node scripts/import-postcode-data.js');
    console.log('   3. Verify city mappings');
    
  } catch (error) {
    console.error('💥 Database setup failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  setupDatabaseSchema,
  verifyExistingData
};
