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

async function getCitiesFromSchools() {
  console.log('🏙️  Extracting cities from school data...');
  
  try {
    // Get all unique local authorities from schools
    const { data: schoolData, error } = await supabase
      .from('schools')
      .select('la__name_')
      .not('la__name_', 'is', null)
      .limit(100000); // Increase limit to get all schools
    
    if (error) {
      console.error('❌ Error fetching school data:', error);
      throw error;
    }
    
    // Group by local authority
    const cityMap = new Map();
    
    schoolData.forEach(school => {
      const la = school.la__name_;
      if (!cityMap.has(la)) {
        cityMap.set(la, {
          city_name: la,
          local_authority: la,
          county: 'Unknown', // We don't have county data
          region: 'Unknown', // We don't have region data
          school_count: 0,
          primary_school_count: 0,
          secondary_school_count: 0
        });
      }
    });
    
    console.log(`📊 Found ${cityMap.size} unique local authorities`);
    return Array.from(cityMap.values());
    
  } catch (error) {
    console.error('❌ Error extracting cities:', error);
    throw error;
  }
}

async function countSchoolsByCity(cities) {
  console.log('🎓 Counting schools by city...');
  
  try {
    for (const city of cities) {
      // Count total schools
      const { count: totalSchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('la__name_', city.local_authority);
      
      // Count primary schools
      const { count: primarySchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('la__name_', city.local_authority)
        .in('phaseofeducation__name_', ['Primary', 'All-through']);
      
      // Count secondary schools
      const { count: secondarySchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('la__name_', city.local_authority)
        .in('phaseofeducation__name_', ['Secondary', 'All-through']);
      
      city.school_count = totalSchools || 0;
      city.primary_school_count = primarySchools || 0;
      city.secondary_school_count = secondarySchools || 0;
      
      console.log(`✅ ${city.city_name}: ${totalSchools} total, ${primarySchools} primary, ${secondarySchools} secondary schools`);
    }
    
    return cities;
  } catch (error) {
    console.error('❌ Error counting schools:', error);
    throw error;
  }
}

async function generateCityPageList(cities) {
  console.log('📋 Generating city page creation list...');
  
  try {
    // Filter cities with meaningful school counts
    const filteredCities = cities.filter(city => city.school_count >= 5);
    
    // Sort by school count
    filteredCities.sort((a, b) => b.school_count - a.school_count);
    
    const pageList = filteredCities.map(city => ({
      city: city.city_name,
      slug: createSlug(city.city_name),
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
    console.log('🚀 Starting city page generation...');
    
    // Step 1: Extract cities from school data
    const cities = await getCitiesFromSchools();
    
    // Step 2: Count schools by city
    const citiesWithCounts = await countSchoolsByCity(cities);
    
    // Step 3: Generate page list
    const pageList = await generateCityPageList(citiesWithCounts);
    
    console.log('🎉 City page generation completed successfully!');
    console.log(`📊 Ready to create pages for ${pageList.length} cities`);
    
    // Show recommendations
    console.log('\n📋 Recommendations:');
    console.log('1. Start with cities having 50+ schools (high impact)');
    console.log('2. Focus on primary school pages first (more search volume)');
    console.log('3. Create pages for major cities: London, Birmingham, Manchester, Leeds, Liverpool');
    console.log('4. Use the Leeds page as a template for other cities');
    
  } catch (error) {
    console.error('💥 City page generation failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  getCitiesFromSchools,
  countSchoolsByCity,
  generateCityPageList
};
