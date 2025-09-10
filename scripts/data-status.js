#!/usr/bin/env node

/**
 * Data Status Checker
 * Shows the current status of your school data
 */

const fs = require('fs-extra');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const DATA_DIR = path.join(__dirname, '..', 'data');
const RAW_DIR = path.join(DATA_DIR, 'raw');

async function checkDataStatus() {
  console.log('🔍 School Data Status Check\n');
  
  // Check local data files
  try {
    const files = await fs.readdir(RAW_DIR);
    const csvFiles = files.filter(file => file.endsWith('.csv'));
    
    if (csvFiles.length === 0) {
      console.log('❌ No CSV data files found');
      return;
    }
    
    console.log('📁 Local Data Files:');
    for (const file of csvFiles) {
      const filePath = path.join(RAW_DIR, file);
      const stats = await fs.stat(filePath);
      const daysSinceUpdate = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      const sizeKB = (stats.size / 1024).toFixed(1);
      
      console.log(`   📄 ${file}`);
      console.log(`      Size: ${sizeKB} KB`);
      console.log(`      Age: ${daysSinceUpdate.toFixed(1)} days`);
      console.log(`      Modified: ${stats.mtime.toISOString().split('T')[0]}`);
      console.log('');
    }
    
  } catch (error) {
    console.log('❌ Error checking local files:', error.message);
  }
  
  // Check database status
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('❌ Supabase credentials not found');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Count schools
    const { count: schoolsCount, error: schoolsError } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true });
    
    if (schoolsError) {
      console.log('❌ Error checking schools:', schoolsError.message);
    } else {
      console.log('🗄️  Database Status:');
      console.log(`   Schools: ${schoolsCount || 0} records`);
    }
    
    // Check a sample school for headteacher data
    const { data: sampleSchool, error: sampleError } = await supabase
      .from('schools')
      .select('name, headteacher_preferred_title, headteacher_first_name, headteacher_last_name')
      .limit(1)
      .single();
    
    if (sampleError) {
      console.log('❌ Error checking sample school:', sampleError.message);
    } else if (sampleSchool) {
      console.log('👨‍🏫 Sample School Data:');
      console.log(`   Name: ${sampleSchool.name}`);
      console.log(`   Headteacher: ${sampleSchool.headteacher_preferred_title || sampleSchool.headteacher_title} ${sampleSchool.headteacher_first_name} ${sampleSchool.headteacher_last_name}`);
    }
    
  } catch (error) {
    console.log('❌ Error checking database:', error.message);
  }
  
  console.log('\n🔄 Next Steps:');
  console.log('   • Run "npm run data:auto" to fetch fresh data');
  console.log('   • Run "npm run data:auto:setup" to set up monthly automation');
  console.log('   • Check logs/ directory for detailed logs');
}

checkDataStatus().catch(console.error);

