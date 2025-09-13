const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Load London postcode mapping
const londonMapping = JSON.parse(fs.readFileSync(path.join(__dirname, 'london-postcode-mapping.json'), 'utf8'));

async function getSchoolCountsForPostcode(postcodePrefix) {
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

async function generateLondonPostcodePages() {
  console.log('🚀 Generating London postcode pages...\n');

  const londonPages = [];

  for (const area of londonMapping) {
    console.log(`📊 Processing ${area.name} (${area.postcode})...`);
    
    const counts = await getSchoolCountsForPostcode(area.postcode);
    
    const pageData = {
      postcode: area.postcode,
      name: area.name,
      description: area.description,
      ...counts
    };

    londonPages.push(pageData);
    
    console.log(`   ✅ ${area.name}: ${counts.totalSchools} total, ${counts.primarySchools} primary, ${counts.secondarySchools} secondary schools`);
  }

  // Save the data
  const outputPath = path.join(__dirname, 'london-postcode-pages.json');
  fs.writeFileSync(outputPath, JSON.stringify(londonPages, null, 2));
  
  console.log(`\n📁 Saved London postcode data to: ${outputPath}`);
  console.log(`\n📋 Summary:`);
  
  londonPages.forEach(page => {
    console.log(`   ${page.name} (${page.postcode}): ${page.primarySchools} primary schools`);
  });

  const totalPrimary = londonPages.reduce((sum, page) => sum + page.primarySchools, 0);
  const totalSchools = londonPages.reduce((sum, page) => sum + page.totalSchools, 0);
  
  console.log(`\n🎯 Total: ${totalPrimary} primary schools across ${londonPages.length} London postcode areas`);
  console.log(`🎯 Total: ${totalSchools} schools across all London postcode areas`);
}

generateLondonPostcodePages().catch(console.error);
