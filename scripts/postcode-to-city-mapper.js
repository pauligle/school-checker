const fs = require('fs');
const path = require('path');
const https = require('https');
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

async function extractAllPostcodes() {
  console.log('📮 Extracting all unique postcodes from schools database...');
  
  try {
    // Get all unique postcodes from schools using pagination
    let allPostcodes = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const { data: schoolData, error } = await supabase
        .from('schools')
        .select('postcode')
        .not('postcode', 'is', null)
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (error) {
        console.error('❌ Error fetching postcodes:', error);
        throw error;
      }
      
      if (schoolData && schoolData.length > 0) {
        allPostcodes = allPostcodes.concat(schoolData.map(school => school.postcode));
        page++;
        console.log(`📦 Fetched page ${page} (${schoolData.length} schools)`);
      } else {
        hasMore = false;
      }
    }
    
    // Extract unique postcodes
    const uniquePostcodes = [...new Set(allPostcodes)];
    
    console.log(`📊 Found ${uniquePostcodes.length} unique postcodes`);
    console.log(`📊 Total schools with postcodes: ${allPostcodes.length}`);
    
    return uniquePostcodes;
  } catch (error) {
    console.error('❌ Error extracting postcodes:', error);
    throw error;
  }
}

async function lookupPostcodeCity(postcode) {
  return new Promise((resolve, reject) => {
    const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`;
    
    https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (result.status === 200 && result.result) {
            resolve({
              postcode: postcode,
              city: result.result.admin_district || result.result.admin_ward || 'Unknown',
              county: result.result.admin_county || 'Unknown',
              region: result.result.region || 'Unknown',
              country: result.result.country || 'England'
            });
          } else {
            resolve({
              postcode: postcode,
              city: 'Unknown',
              county: 'Unknown',
              region: 'Unknown',
              country: 'England'
            });
          }
        } catch (parseError) {
          resolve({
            postcode: postcode,
            city: 'Unknown',
            county: 'Unknown',
            region: 'Unknown',
            country: 'England'
          });
        }
      });
    }).on('error', (error) => {
      resolve({
        postcode: postcode,
        city: 'Unknown',
        county: 'Unknown',
        region: 'Unknown',
        country: 'England'
      });
    });
  });
}

async function mapPostcodesToCities(postcodes) {
  console.log('🗺️  Mapping postcodes to cities using postcodes.io API...');
  
  const postcodeCityMap = new Map();
  const batchSize = 10; // Rate limit friendly
  const delay = 100; // 100ms delay between batches
  
  try {
    for (let i = 0; i < postcodes.length; i += batchSize) {
      const batch = postcodes.slice(i, i + batchSize);
      
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(postcodes.length / batchSize)} (${batch.length} postcodes)`);
      
      // Process batch in parallel
      const promises = batch.map(postcode => lookupPostcodeCity(postcode));
      const results = await Promise.all(promises);
      
      // Store results
      results.forEach(result => {
        postcodeCityMap.set(result.postcode, result);
      });
      
      // Rate limiting delay
      if (i + batchSize < postcodes.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.log(`✅ Successfully mapped ${postcodeCityMap.size} postcodes to cities`);
    
    // Save mapping to file
    const mappingData = Array.from(postcodeCityMap.values());
    const outputPath = path.join(__dirname, 'data', 'postcode-city-mapping.json');
    
    // Ensure data directory exists
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(mappingData, null, 2));
    console.log(`💾 Saved postcode-city mapping to: ${outputPath}`);
    
    return postcodeCityMap;
  } catch (error) {
    console.error('❌ Error mapping postcodes to cities:', error);
    throw error;
  }
}

async function groupSchoolsByCity(postcodeCityMap) {
  console.log('🏫 Grouping schools by city...');
  
  try {
    // Get all schools with postcodes using pagination
    let allSchools = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const { data: schools, error } = await supabase
        .from('schools')
        .select('id, establishmentname, urn, postcode, phaseofeducation__name_, numberofpupils')
        .not('postcode', 'is', null)
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (error) {
        console.error('❌ Error fetching schools:', error);
        throw error;
      }
      
      if (schools && schools.length > 0) {
        allSchools = allSchools.concat(schools);
        page++;
        console.log(`📦 Fetched schools page ${page} (${schools.length} schools)`);
      } else {
        hasMore = false;
      }
    }
    
    console.log(`📊 Total schools fetched: ${allSchools.length}`);
    
    // Group schools by city
    const cityMap = new Map();
    
    allSchools.forEach(school => {
      const postcodeData = postcodeCityMap.get(school.postcode);
      
      if (postcodeData && postcodeData.city !== 'Unknown') {
        const cityKey = postcodeData.city;
        
        if (!cityMap.has(cityKey)) {
          cityMap.set(cityKey, {
            city: cityKey,
            county: postcodeData.county,
            region: postcodeData.region,
            country: postcodeData.country,
            schools: [],
            totalSchools: 0,
            primarySchools: 0,
            secondarySchools: 0,
            postcodes: new Set()
          });
        }
        
        const cityData = cityMap.get(cityKey);
        cityData.schools.push(school);
        cityData.totalSchools++;
        cityData.postcodes.add(school.postcode);
        
        // Count by phase
        if (school.phaseofeducation__name_ === 'Primary' || school.phaseofeducation__name_ === 'All-through') {
          cityData.primarySchools++;
        }
        if (school.phaseofeducation__name_ === 'Secondary' || school.phaseofeducation__name_ === 'All-through') {
          cityData.secondarySchools++;
        }
      }
    });
    
    // Convert Set to Array for JSON serialization
    const cities = Array.from(cityMap.values()).map(city => ({
      ...city,
      postcodes: Array.from(city.postcodes),
      postcodeCount: city.postcodes.size
    }));
    
    console.log(`✅ Grouped schools into ${cities.length} cities`);
    
    return cities;
  } catch (error) {
    console.error('❌ Error grouping schools by city:', error);
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
      postcodes: city.postcodes.slice(0, 10), // Show first 10 postcodes
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
    console.log('🚀 Starting postcode-to-city mapping process...');
    console.log('');
    
    // Step 1: Extract all postcodes
    const postcodes = await extractAllPostcodes();
    
    // Step 2: Map postcodes to cities
    const postcodeCityMap = await mapPostcodesToCities(postcodes);
    
    // Step 3: Group schools by city
    const cities = await groupSchoolsByCity(postcodeCityMap);
    
    // Step 4: Generate page list
    const pageList = await generateCityPageList(cities);
    
    console.log('\n🎉 Postcode-to-city mapping completed successfully!');
    console.log(`📊 Ready to create pages for ${pageList.length} cities`);
    
    // Show recommendations
    console.log('\n📋 Recommendations:');
    console.log('1. Start with cities having 50+ schools (high impact)');
    console.log('2. Focus on primary school pages first (more search volume)');
    console.log('3. Create pages for major cities: London, Birmingham, Manchester, Leeds, Liverpool');
    console.log('4. Use the Leeds page as a template for other cities');
    console.log('5. Consider postcode patterns for accurate city coverage');
    
  } catch (error) {
    console.error('💥 Postcode-to-city mapping failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  extractAllPostcodes,
  mapPostcodesToCities,
  groupSchoolsByCity,
  generateCityPageList
};
