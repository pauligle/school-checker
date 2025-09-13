const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function createSlug(cityName) {
  return cityName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function loadExistingPostcodeMapping() {
  console.log('📖 Loading existing postcode-city mapping...');
  
  try {
    const mappingPath = path.join(__dirname, 'data', 'postcode-city-mapping.json');
    
    if (!fs.existsSync(mappingPath)) {
      console.log('❌ No existing mapping found. Please run postcode-to-city-mapper.js first.');
      return null;
    }
    
    const mappingData = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    const postcodeMap = new Map();
    
    mappingData.forEach(item => {
      postcodeMap.set(item.postcode, item);
    });
    
    console.log(`✅ Loaded ${postcodeMap.size} postcode mappings`);
    return postcodeMap;
  } catch (error) {
    console.error('❌ Error loading postcode mapping:', error);
    return null;
  }
}

async function getCitySchoolCounts(postcodeMap) {
  console.log('🏫 Getting school counts by city...');
  
  try {
    const cityCounts = new Map();
    
    // Get unique cities from our mapping
    const cities = [...new Set(Array.from(postcodeMap.values()).map(item => item.city))];
    console.log(`📊 Found ${cities.length} unique cities`);
    
    // For each city, count schools by querying postcodes
    for (const city of cities) {
      if (city === 'Unknown') continue;
      
      // Get postcodes for this city
      const cityPostcodes = Array.from(postcodeMap.values())
        .filter(item => item.city === city)
        .map(item => item.postcode);
      
      if (cityPostcodes.length === 0) continue;
      
      // Count schools for these postcodes
      const { count: totalSchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .in('postcode', cityPostcodes);
      
      // Count primary schools
      const { count: primarySchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .in('postcode', cityPostcodes)
        .in('phaseofeducation__name_', ['Primary', 'All-through']);
      
      // Count secondary schools
      const { count: secondarySchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .in('postcode', cityPostcodes)
        .in('phaseofeducation__name_', ['Secondary', 'All-through']);
      
      if (totalSchools > 0) {
        cityCounts.set(city, {
          city: city,
          county: postcodeMap.get(cityPostcodes[0])?.county || 'Unknown',
          region: postcodeMap.get(cityPostcodes[0])?.region || 'Unknown',
          country: postcodeMap.get(cityPostcodes[0])?.country || 'England',
          totalSchools: totalSchools || 0,
          primarySchools: primarySchools || 0,
          secondarySchools: secondarySchools || 0,
          postcodeCount: cityPostcodes.length,
          postcodes: cityPostcodes.slice(0, 10) // Show first 10 postcodes
        });
        
        console.log(`✅ ${city}: ${totalSchools} schools (${primarySchools} primary, ${secondarySchools} secondary)`);
      }
    }
    
    return Array.from(cityCounts.values());
  } catch (error) {
    console.error('❌ Error getting city school counts:', error);
    throw error;
  }
}

async function generateCityPageList(cities) {
  console.log('📋 Generating city page creation list...');
  
  try {
    // Filter cities with meaningful school counts
    const filteredCities = cities.filter(city => city.totalSchools >= 5);
    
    // Sort by school count
    filteredCities.sort((a, b) => b.totalSchools - a.totalSchools);
    
    const pageList = filteredCities.map(city => ({
      city: city.city,
      slug: createSlug(city.city),
      county: city.county,
      region: city.region,
      country: city.country,
      totalSchools: city.totalSchools,
      primarySchools: city.primarySchools,
      secondarySchools: city.secondarySchools,
      postcodeCount: city.postcodeCount,
      postcodes: city.postcodes,
      pagesToCreate: {
        primary: city.primarySchools >= 10,
        secondary: city.secondarySchools >= 10,
        all: city.totalSchools >= 20
      }
    }));
    
    // Save to file
    const outputPath = path.join(__dirname, 'city-pages-to-create.json');
    fs.writeFileSync(outputPath, JSON.stringify(pageList, null, 2));
    
    console.log(`📄 Saved city page list to: ${outputPath}`);
    console.log(`📊 Total cities with schools: ${pageList.length}`);
    console.log(`🏫 Cities with 100+ schools: ${pageList.filter(c => c.totalSchools >= 100).length}`);
    console.log(`🏫 Cities with 50-99 schools: ${pageList.filter(c => c.totalSchools >= 50 && c.totalSchools < 100).length}`);
    console.log(`🏫 Cities with 20-49 schools: ${pageList.filter(c => c.totalSchools >= 20 && c.totalSchools < 50).length}`);
    console.log(`🏫 Cities with 10-19 schools: ${pageList.filter(c => c.totalSchools >= 10 && c.totalSchools < 20).length}`);
    console.log(`🏫 Cities with 5-9 schools: ${pageList.filter(c => c.totalSchools >= 5 && c.totalSchools < 10).length}`);
    
    // Show top 20 cities
    console.log('\n🏆 Top 20 Cities by School Count:');
    pageList.slice(0, 20).forEach((city, index) => {
      console.log(`${index + 1}. ${city.city} (${city.county}) - ${city.totalSchools} schools (${city.primarySchools} primary, ${city.secondarySchools} secondary)`);
    });
    
    return pageList;
  } catch (error) {
    console.error('❌ Error generating city page list:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting quick city mapping...');
    console.log('');
    
    // Step 1: Load existing postcode mapping
    const postcodeMap = await loadExistingPostcodeMapping();
    if (!postcodeMap) {
      console.log('❌ Cannot proceed without postcode mapping');
      return;
    }
    
    // Step 2: Get school counts by city
    const cities = await getCitySchoolCounts(postcodeMap);
    
    // Step 3: Generate page list
    const pageList = await generateCityPageList(cities);
    
    console.log('\n🎉 Quick city mapping completed successfully!');
    console.log(`📊 Ready to create pages for ${pageList.length} cities`);
    
    // Show recommendations
    console.log('\n📋 Recommendations:');
    console.log('1. Start with cities having 50+ schools (high impact)');
    console.log('2. Focus on primary school pages first (more search volume)');
    console.log('3. Create pages for major cities: London, Birmingham, Manchester, Leeds, Liverpool');
    console.log('4. Use the Leeds page as a template for other cities');
    
  } catch (error) {
    console.error('💥 Quick city mapping failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  loadExistingPostcodeMapping,
  getCitySchoolCounts,
  generateCityPageList
};
