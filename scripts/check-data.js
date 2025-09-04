const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchoolsData() {
  try {
    console.log('🔍 Checking schools data...');
    
    // Check total count
    const { count, error: countError } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error getting count:', countError);
      return;
    }
    
    console.log(`📊 Total schools in database: ${count}`);
    
    if (count === 0) {
      console.log('❌ No schools found in database!');
      console.log('💡 You need to import your CSV data first.');
      console.log('   Run: node scripts/clean-csv.js schools your-csv-file.csv');
      console.log('   Then: node scripts/import-data.js schools cleaned-csv-file.csv');
      return;
    }
    
    // Get a sample of schools
    const { data, error } = await supabase
      .from('schools')
      .select('urn, name, lat, lon')
      .limit(5);
    
    if (error) {
      console.error('Error fetching sample data:', error);
      return;
    }
    
    console.log('✅ Sample schools:');
    data.forEach((school, index) => {
      console.log(`  ${index + 1}. ${school.name} (${school.urn}) - ${school.lat}, ${school.lon}`);
    });
    
    // Check if schools have valid coordinates
    const { data: validSchools, error: validError } = await supabase
      .from('schools')
      .select('urn')
      .not('lat', 'is', null)
      .not('lon', 'is', null)
      .limit(1);
    
    if (validError) {
      console.error('Error checking valid coordinates:', validError);
      return;
    }
    
    console.log(`📍 Schools with valid coordinates: ${validSchools.length > 0 ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkSchoolsData();
