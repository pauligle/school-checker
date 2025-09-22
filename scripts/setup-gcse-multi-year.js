require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTables() {
  console.log('🏗️  Creating multi-year GCSE tables...');
  
  const sqlPath = path.join(__dirname, 'create-gcse-multi-year-tables.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  
  // Split SQL into individual statements
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
  
  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      if (error) {
        console.error('❌ Error executing SQL:', error);
        console.log('Statement:', statement.substring(0, 100) + '...');
      } else {
        console.log('✅ SQL statement executed successfully');
      }
    } catch (err) {
      console.error('❌ Error executing SQL statement:', err);
    }
  }
}

async function checkTablesExist() {
  console.log('🔍 Checking if tables exist...');
  
  const tables = [
    'gcse_results_multi_year',
    'gcse_rankings_multi_year', 
    'gcse_averages_multi_year'
  ];
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ Table ${table} does not exist or has issues:`, error.message);
      return false;
    } else {
      console.log(`✅ Table ${table} exists`);
    }
  }
  
  return true;
}

async function main() {
  console.log('🚀 Setting up multi-year GCSE results system...\n');
  
  try {
    // Check if tables already exist
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist) {
      console.log('\n📋 Tables need to be created. Please run the SQL script manually in Supabase dashboard:');
      console.log('📁 File: scripts/create-gcse-multi-year-tables.sql');
      console.log('\nAfter creating the tables, run this script again to import data.');
      return;
    }
    
    console.log('\n✅ All tables exist. You can now run the import script:');
    console.log('📝 Command: node scripts/import-gcse-multi-year.js');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
