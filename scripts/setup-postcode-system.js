#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Setting up complete postcode-to-city mapping system...');
console.log('');

async function runScript(scriptName, description) {
  console.log(`📋 ${description}...`);
  console.log(`⚡ Running: node ${scriptName}`);
  console.log('');
  
  try {
    execSync(`node ${scriptName}`, { 
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log(`✅ ${description} completed successfully!`);
    console.log('');
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🎯 This script will:');
    console.log('   1. Download ONS postcode data');
    console.log('   2. Setup database schema');
    console.log('   3. Import postcode data');
    console.log('   4. Map schools to cities');
    console.log('   5. Generate city page list');
    console.log('');
    
    // Step 1: Download ONS data
    await runScript(
      'download-ons-data.js',
      'Downloading ONS postcode data'
    );
    
    // Step 2: Setup database schema
    await runScript(
      'setup-postcode-database.js',
      'Setting up database schema'
    );
    
    // Step 3: Import postcode data
    await runScript(
      'import-postcode-data.js',
      'Importing postcode data and mapping schools to cities'
    );
    
    console.log('🎉 Complete postcode system setup finished!');
    console.log('');
    console.log('📊 Summary:');
    console.log('   ✅ Database schema created');
    console.log('   ✅ Postcode data imported');
    console.log('   ✅ Cities created from postcodes');
    console.log('   ✅ Schools mapped to cities');
    console.log('   ✅ City page list generated');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Review city-pages-to-create.json');
    console.log('   2. Create dynamic page templates');
    console.log('   3. Generate pages for high-priority cities');
    console.log('   4. Test and deploy');
    
  } catch (error) {
    console.error('💥 Setup failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   - Check your .env.local file has correct Supabase credentials');
    console.log('   - Ensure you have the required Node.js packages installed');
    console.log('   - Verify your Supabase database is accessible');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}
