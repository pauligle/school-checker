const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Load London postcode districts mapping
const districtsMapping = JSON.parse(fs.readFileSync(path.join(__dirname, 'london-postcode-districts-mapping.json'), 'utf8'));

async function getSchoolCountsForDistrict(postcodePrefix) {
  try {
    // Get total schools
    const { count: totalCount, error: totalError } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .like('postcode', postcodePrefix + '%')
      .not('postcode', 'is', null);

    if (totalError) throw totalError;

    // Get primary schools
    const { count: primaryCount, error: primaryError } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .like('postcode', postcodePrefix + '%')
      .not('postcode', 'is', null)
      .in('phaseofeducation__name_', ['Primary', 'All-through']);

    if (primaryError) throw primaryError;

    // Get secondary schools
    const { count: secondaryCount, error: secondaryError } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .like('postcode', postcodePrefix + '%')
      .not('postcode', 'is', null)
      .in('phaseofeducation__name_', ['Secondary']);

    if (secondaryError) throw secondaryError;

    return {
      totalSchools: totalCount || 0,
      primarySchools: primaryCount || 0,
      secondarySchools: secondaryCount || 0
    };
  } catch (error) {
    console.error(`Error getting counts for ${postcodePrefix}:`, error.message);
    return { totalSchools: 0, primarySchools: 0, secondarySchools: 0 };
  }
}

async function generateLondonDistrictsPages() {
  console.log('🚀 Generating London postcode district pages...\n');

  const districtPages = [];

  for (const district of districtsMapping) {
    console.log(`📊 Processing ${district.name} (${district.postcode})...`);
    
    const counts = await getSchoolCountsForDistrict(district.postcode);
    
    const pageData = {
      postcode: district.postcode,
      name: district.name,
      area: district.area,
      areaPostcode: district.areaPostcode,
      description: district.description,
      ...counts
    };

    districtPages.push(pageData);
    
    console.log(`   ✅ ${district.name}: ${counts.totalSchools} total, ${counts.primarySchools} primary, ${counts.secondarySchools} secondary schools`);
  }

  // Save the data
  const outputPath = path.join(__dirname, 'london-districts-pages.json');
  fs.writeFileSync(outputPath, JSON.stringify(districtPages, null, 2));
  
  console.log(`\n📁 Saved London district data to: ${outputPath}`);
  console.log(`\n📋 Summary:`);
  
  // Group by area
  const areas = {};
  districtPages.forEach(page => {
    if (!areas[page.area]) {
      areas[page.area] = [];
    }
    areas[page.area].push(page);
  });

  Object.keys(areas).forEach(area => {
    console.log(`\n🏙️ ${area}:`);
    areas[area].forEach(page => {
      if (page.primarySchools > 0) {
        console.log(`   ${page.name} (${page.postcode}): ${page.primarySchools} primary schools`);
      }
    });
  });

  const totalPrimary = districtPages.reduce((sum, page) => sum + page.primarySchools, 0);
  const totalSchools = districtPages.reduce((sum, page) => sum + page.totalSchools, 0);
  const districtsWithSchools = districtPages.filter(page => page.primarySchools > 0).length;
  
  console.log(`\n🎯 Total: ${totalPrimary} primary schools across ${districtsWithSchools} London districts`);
  console.log(`🎯 Total: ${totalSchools} schools across all London districts`);
  console.log(`🎯 Districts with schools: ${districtsWithSchools}/${districtPages.length}`);
}

generateLondonDistrictsPages().catch(console.error);
