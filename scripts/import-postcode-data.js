const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ONS Postcode Directory URLs
const ONS_DATA_URLS = {
  // Main postcode lookup file
  postcodeLookup: 'https://www.arcgis.com/sharing/rest/content/items/4b4a2b4b4b4b4b4b4b4b4b4b4b4b4b4b/data',
  // Alternative: Direct download from ONS
  postcodeDirectory: 'https://geoportal.statistics.gov.uk/datasets/ons-postcode-directory-may-2024/explore'
};

// Sample postcode data structure (we'll need to adapt based on actual ONS format)
const SAMPLE_POSTCODE_DATA = [
  {
    postcode: 'LS1 1AA',
    ward_name: 'City and Hunslet',
    local_authority: 'Leeds',
    county: 'West Yorkshire',
    region: 'Yorkshire and The Humber'
  },
  {
    postcode: 'M1 1AA',
    ward_name: 'City Centre',
    local_authority: 'Manchester',
    county: 'Greater Manchester',
    region: 'North West'
  }
];

async function downloadONSData() {
  console.log('📥 Downloading ONS postcode data...');
  
  try {
    // For now, we'll use a sample dataset
    // In production, you would download the actual ONS CSV file
    console.log('⚠️  Using sample data for now. In production, download actual ONS CSV.');
    
    return SAMPLE_POSTCODE_DATA;
  } catch (error) {
    console.error('❌ Error downloading ONS data:', error);
    throw error;
  }
}

async function processPostcodeData(postcodeData) {
  console.log('🔄 Processing postcode data...');
  
  const processedData = postcodeData.map(item => ({
    postcode: item.postcode?.toUpperCase().replace(/\s/g, ''),
    ward_name: item.ward_name,
    local_authority: item.local_authority,
    county: item.county,
    region: item.region,
    country: 'England'
  }));

  console.log(`✅ Processed ${processedData.length} postcodes`);
  return processedData;
}

async function importPostcodesToDatabase(postcodeData) {
  console.log('💾 Importing postcodes to database...');
  
  try {
    // Check if postcodes table exists, if not, create it by inserting first record
    const { error: checkError } = await supabase
      .from('postcodes')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('📝 Creating postcodes table...');
      // Try to insert first record to create table
      const { error: createError } = await supabase
        .from('postcodes')
        .insert([postcodeData[0]]);
      
      if (createError) {
        console.error('❌ Error creating postcodes table:', createError);
        throw createError;
      }
      console.log('✅ Postcodes table created');
    } else {
      // Clear existing data
      await supabase.from('postcodes').delete().neq('id', 0);
      console.log('🗑️  Cleared existing postcode data');
    }

    // Insert new data in batches
    const batchSize = 1000;
    const batches = [];
    
    for (let i = 0; i < postcodeData.length; i += batchSize) {
      batches.push(postcodeData.slice(i, i + batchSize));
    }

    console.log(`📦 Processing ${batches.length} batches of ${batchSize} records each`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const { error } = await supabase
        .from('postcodes')
        .insert(batch);

      if (error) {
        console.error(`❌ Error inserting batch ${i + 1}:`, error);
        throw error;
      }

      console.log(`✅ Inserted batch ${i + 1}/${batches.length} (${batch.length} records)`);
    }

    console.log('🎉 Successfully imported all postcode data');
  } catch (error) {
    console.error('❌ Error importing postcodes:', error);
    throw error;
  }
}

async function createCitiesFromPostcodes() {
  console.log('🏙️  Creating cities from postcodes...');
  
  try {
    // Check if cities table exists
    const { error: checkError } = await supabase
      .from('cities')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('📝 Cities table does not exist, will be created during insert');
    } else {
      // Clear existing cities
      await supabase.from('cities').delete().neq('id', 0);
      console.log('🗑️  Cleared existing city data');
    }

    // Create cities by aggregating postcodes
    const { data: cityData, error } = await supabase
      .from('postcodes')
      .select('local_authority, county, region')
      .not('local_authority', 'is', null);

    if (error) {
      console.error('❌ Error fetching postcode data:', error);
      throw error;
    }

    // Group by local authority
    const cityMap = new Map();
    
    cityData.forEach(item => {
      const key = item.local_authority;
      if (!cityMap.has(key)) {
        cityMap.set(key, {
          city_name: item.local_authority,
          local_authority: item.local_authority,
          county: item.county,
          region: item.region,
          postcode_count: 0
        });
      }
      cityMap.get(key).postcode_count++;
    });

    const cities = Array.from(cityMap.values()).map(city => ({
      ...city,
      slug: createSlug(city.city_name)
    }));

    // Insert cities
    const { error: insertError } = await supabase
      .from('cities')
      .insert(cities);

    if (insertError) {
      console.error('❌ Error inserting cities:', insertError);
      throw insertError;
    }

    console.log(`✅ Created ${cities.length} cities`);
  } catch (error) {
    console.error('❌ Error creating cities:', error);
    throw error;
  }
}

function createSlug(cityName) {
  return cityName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function mapSchoolsToCities() {
  console.log('🎓 Mapping schools to cities...');
  
  try {
    // Update school counts for each city
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, city_name, local_authority');

    if (citiesError) {
      console.error('❌ Error fetching cities:', citiesError);
      throw citiesError;
    }

    for (const city of cities) {
      // Count total schools
      const { count: totalSchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .in('postcode', 
          await supabase
            .from('postcodes')
            .select('postcode')
            .eq('local_authority', city.local_authority)
            .then(({ data }) => data?.map(p => p.postcode) || [])
        );

      // Count primary schools
      const { count: primarySchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .in('postcode', 
          await supabase
            .from('postcodes')
            .select('postcode')
            .eq('local_authority', city.local_authority)
            .then(({ data }) => data?.map(p => p.postcode) || [])
        )
        .in('phaseofeducation__name_', ['Primary', 'All-through']);

      // Count secondary schools
      const { count: secondarySchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .in('postcode', 
          await supabase
            .from('postcodes')
            .select('postcode')
            .eq('local_authority', city.local_authority)
            .then(({ data }) => data?.map(p => p.postcode) || [])
        )
        .in('phaseofeducation__name_', ['Secondary', 'All-through']);

      // Update city with school counts
      const { error: updateError } = await supabase
        .from('cities')
        .update({
          school_count: totalSchools || 0,
          primary_school_count: primarySchools || 0,
          secondary_school_count: secondarySchools || 0
        })
        .eq('id', city.id);

      if (updateError) {
        console.error(`❌ Error updating city ${city.city_name}:`, updateError);
      } else {
        console.log(`✅ Updated ${city.city_name}: ${totalSchools} total, ${primarySchools} primary, ${secondarySchools} secondary schools`);
      }
    }

    console.log('🎉 Successfully mapped all schools to cities');
  } catch (error) {
    console.error('❌ Error mapping schools to cities:', error);
    throw error;
  }
}

async function generateCityPageList() {
  console.log('📋 Generating city page creation list...');
  
  try {
    const { data: cities, error } = await supabase
      .from('cities')
      .select('*')
      .gte('school_count', 10) // Only cities with 10+ schools
      .order('school_count', { ascending: false });

    if (error) {
      console.error('❌ Error fetching cities:', error);
      throw error;
    }

    const pageList = cities.map(city => ({
      city: city.city_name,
      slug: city.slug,
      county: city.county,
      region: city.region,
      totalSchools: city.school_count,
      primarySchools: city.primary_school_count,
      secondarySchools: city.secondary_school_count,
      pagesToCreate: {
        primary: city.primary_school_count >= 10,
        secondary: city.secondary_school_count >= 10,
        all: city.school_count >= 20
      }
    }));

    // Save to file
    const outputPath = path.join(__dirname, 'city-pages-to-create.json');
    fs.writeFileSync(outputPath, JSON.stringify(pageList, null, 2));
    
    console.log(`📄 Saved city page list to: ${outputPath}`);
    console.log(`📊 Total cities with schools: ${pageList.length}`);
    console.log(`🏫 Cities with 50+ schools: ${pageList.filter(c => c.totalSchools >= 50).length}`);
    console.log(`🏫 Cities with 20-49 schools: ${pageList.filter(c => c.totalSchools >= 20 && c.totalSchools < 50).length}`);
    console.log(`🏫 Cities with 10-19 schools: ${pageList.filter(c => c.totalSchools >= 10 && c.totalSchools < 20).length}`);

    return pageList;
  } catch (error) {
    console.error('❌ Error generating city page list:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting postcode data import process...');
    
    // Step 1: Download ONS data
    const postcodeData = await downloadONSData();
    
    // Step 2: Process data
    const processedData = await processPostcodeData(postcodeData);
    
    // Step 3: Import to database
    await importPostcodesToDatabase(processedData);
    
    // Step 4: Create cities
    await createCitiesFromPostcodes();
    
    // Step 5: Map schools to cities
    await mapSchoolsToCities();
    
    // Step 6: Generate page list
    const pageList = await generateCityPageList();
    
    console.log('🎉 Postcode import process completed successfully!');
    console.log(`📊 Ready to create pages for ${pageList.length} cities`);
    
  } catch (error) {
    console.error('💥 Import process failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  downloadONSData,
  processPostcodeData,
  importPostcodesToDatabase,
  createCitiesFromPostcodes,
  mapSchoolsToCities,
  generateCityPageList
};
