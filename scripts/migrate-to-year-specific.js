const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateToYearSpecific() {
  console.log('🔄 Starting migration to year-specific primary results...');
  
  try {
    // Step 1: Create new schema
    console.log('📋 Creating new year-specific schema...');
    const schemaSQL = fs.readFileSync('scripts/create-year-specific-primary-results.sql', 'utf8');
    
    const { error: schemaError } = await supabase.rpc('exec_sql', { 
      sql_query: schemaSQL 
    });
    
    if (schemaError) {
      console.error('❌ Error creating schema:', schemaError);
      return;
    }
    
    console.log('✅ New schema created successfully');
    
    // Step 2: Import data with year-specific fields
    console.log('📊 Importing data with year-specific fields...');
    
    // Run the import script
    const { spawn } = require('child_process');
    const child = spawn('node', ['scripts/import-year-specific-primary-results.js'], { 
      stdio: 'inherit' 
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Migration completed successfully!');
        console.log('🎉 Primary results now use year-specific fields');
      } else {
        console.error('❌ Migration failed with code:', code);
      }
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

migrateToYearSpecific();
