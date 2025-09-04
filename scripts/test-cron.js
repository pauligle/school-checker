const { runDataPipeline, triggerManualUpdate } = require('./setup-cron');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testCronSetup() {
  console.log('🧪 Testing cron setup...');
  console.log('=' * 40);
  
  try {
    // Test 1: Manual pipeline execution
    console.log('Test 1: Manual pipeline execution');
    await triggerManualUpdate('schools');
    console.log('✅ Test 1 passed\n');
    
    // Test 2: Check if data files were created
    console.log('Test 2: Data file creation');
    const fs = require('fs-extra');
    const path = require('path');
    
    const dataDir = path.join(__dirname, '../data');
    const processedDir = path.join(__dirname, '../data/processed');
    
    const dataExists = await fs.pathExists(dataDir);
    const processedExists = await fs.pathExists(processedDir);
    
    if (dataExists && processedExists) {
      console.log('✅ Test 2 passed - Directories created');
    } else {
      console.log('❌ Test 2 failed - Directories not created');
    }
    console.log('');
    
    // Test 3: Check log files
    console.log('Test 3: Log file creation');
    const logDir = path.join(__dirname, '../logs');
    const logExists = await fs.pathExists(logDir);
    
    if (logExists) {
      console.log('✅ Test 3 passed - Log directory created');
    } else {
      console.log('❌ Test 3 failed - Log directory not created');
    }
    console.log('');
    
    // Test 4: Database connectivity
    console.log('Test 4: Database connectivity');
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('count', { count: 'exact', head: true });
        
        if (!error) {
          console.log('✅ Test 4 passed - Database connection successful');
        } else {
          console.log('❌ Test 4 failed - Database query error:', error.message);
        }
      } catch (dbError) {
        console.log('❌ Test 4 failed - Database connection error:', dbError.message);
      }
    } else {
      console.log('❌ Test 4 failed - Missing Supabase environment variables');
    }
    console.log('');
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'pipeline':
      console.log('🧪 Testing full data pipeline...');
      await runDataPipeline();
      break;
    case 'manual':
      const type = args[1] || 'schools';
      console.log(`🧪 Testing manual ${type} update...`);
      await triggerManualUpdate(type);
      break;
    case 'all':
      await testCronSetup();
      break;
    default:
      console.log('Usage: node test-cron.js <command>');
      console.log('Commands:');
      console.log('  pipeline  - Test full data pipeline');
      console.log('  manual    - Test manual update (with optional type)');
      console.log('  all       - Run all tests');
      console.log('');
      console.log('Examples:');
      console.log('  node test-cron.js pipeline');
      console.log('  node test-cron.js manual schools');
      console.log('  node test-cron.js all');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
