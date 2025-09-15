require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdmissionsTable() {
  console.log('Creating admissions table...');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('scripts/create-admissions-table.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error('Error executing statement:', error);
          console.log('Statement:', statement);
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    }
    
    console.log('✅ Admissions table created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating admissions table:', error);
    process.exit(1);
  }
}

// Run the table creation
createAdmissionsTable();
