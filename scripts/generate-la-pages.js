const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to convert LA name to slug
function createLASlug(laName) {
  return laName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

async function getLocalAuthorities() {
  const { data, error } = await supabase
    .from('schools')
    .select('la__name_')
    .not('la__name_', 'is', null)
    .in('phaseofeducation__name_', ['Primary', 'All-through'])
    .order('la__name_');
    
  if (error) {
    console.error('Error fetching Local Authorities:', error);
    return [];
  }
  
  const uniqueLAs = [...new Set(data.map(s => s.la__name_))];
  return uniqueLAs;
}

async function generateLAPages() {
  console.log('🚀 Starting Local Authority page generation...');
  
  const localAuthorities = await getLocalAuthorities();
  console.log(`📊 Found ${localAuthorities.length} Local Authorities with Primary Schools`);
  
  const pagesData = [];
  
  for (const laName of localAuthorities) {
    const slug = createLASlug(laName);
    const pageData = {
      laName,
      slug,
      url: `/local-authority/${slug}`,
      title: `Best Primary Schools in ${laName}`,
      description: `Find the best primary schools in ${laName}. Compare primary schools with Ofsted ratings, pupil numbers, and detailed reviews.`
    };
    
    pagesData.push(pageData);
    console.log(`✅ Generated page data for: ${laName} (${slug})`);
  }
  
  // Save the pages data to a JSON file for reference
  const outputPath = path.join(__dirname, 'la-pages.json');
  fs.writeFileSync(outputPath, JSON.stringify(pagesData, null, 2));
  console.log(`💾 Saved pages data to: ${outputPath}`);
  
  console.log('\n📋 Generated Local Authority Pages:');
  pagesData.forEach((page, index) => {
    console.log(`${index + 1}. ${page.laName}`);
    console.log(`   URL: ${page.url}`);
    console.log(`   Slug: ${page.slug}`);
    console.log('');
  });
  
  console.log('🎉 Local Authority page generation completed!');
  console.log(`📝 Total pages: ${pagesData.length}`);
  console.log(`🔗 All pages follow the pattern: /local-authority/[slug]`);
  
  return pagesData;
}

// Run the generation
generateLAPages().catch(console.error);
