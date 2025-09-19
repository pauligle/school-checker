#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function main() {
  console.log('🏫 School Data Import Tool');
  console.log('==========================\n');
  
  console.log('This tool will automatically:');
  console.log('1. 📁 Look for CSV files in data/raw/');
  console.log('2. 🔧 Pre-process them (convert coordinates, clean fields)');
  console.log('3. 📊 Import to Supabase');
  console.log('4. 💾 Create backups');
  console.log('5. 🧹 Clean up\n');
  
  try {
    const { stdout, stderr } = await execAsync('node scripts/auto-import-workflow.js');
    
    console.log(stdout);
    if (stderr && !stderr.includes('warning')) {
      console.log(stderr);
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();






