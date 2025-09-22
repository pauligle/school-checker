const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runSQL() {
  try {
    console.log('Reading SQL file...');
    const sql = fs.readFileSync('create-gcse-results-table.sql', 'utf8');
    
    console.log('Executing SQL...');
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
    } else {
      console.log('GCSE tables created successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

runSQL();
