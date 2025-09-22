const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTables() {
  try {
    console.log('Creating GCSE results table...');
    
    // Create GCSE Results table
    const { error: gcseError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS gcse_results (
          id SERIAL PRIMARY KEY,
          urn VARCHAR(20) NOT NULL,
          school_name VARCHAR(255) NOT NULL,
          academic_year VARCHAR(9) NOT NULL,
          
          -- School Information
          lea_code VARCHAR(10),
          estab_code VARCHAR(10),
          school_type VARCHAR(50),
          gender VARCHAR(20),
          age_range VARCHAR(20),
          
          -- Cohort Information
          total_pupils INTEGER,
          cohort_size INTEGER,
          boys_count INTEGER,
          girls_count INTEGER,
          
          -- Attainment 8 Scores
          attainment8_score DECIMAL(5,2),
          attainment8_eng_score DECIMAL(5,2),
          attainment8_mat_score DECIMAL(5,2),
          attainment8_ebacc_score DECIMAL(5,2),
          attainment8_open_score DECIMAL(5,2),
          
          -- Progress 8 Scores
          progress8_score DECIMAL(5,2),
          progress8_eng_score DECIMAL(5,2),
          progress8_mat_score DECIMAL(5,2),
          progress8_ebacc_score DECIMAL(5,2),
          progress8_open_score DECIMAL(5,2),
          
          -- Progress 8 Confidence Intervals
          progress8_lower_bound DECIMAL(5,2),
          progress8_upper_bound DECIMAL(5,2),
          
          -- Percentage Achievements
          grade5_eng_maths_percent DECIMAL(5,2),
          grade4_eng_maths_percent DECIMAL(5,2),
          five_gcses_grade4_percent DECIMAL(5,2),
          five_gcses_grade5_percent DECIMAL(5,2),
          
          -- EBacc Information
          entering_ebacc_percent DECIMAL(5,2),
          ebacc_average_point_score DECIMAL(5,2),
          ebacc_grade4_percent DECIMAL(5,2),
          ebacc_grade5_percent DECIMAL(5,2),
          
          -- Subject Group Scores
          ebacc_eng_score DECIMAL(5,2),
          ebacc_mat_score DECIMAL(5,2),
          ebacc_sci_score DECIMAL(5,2),
          ebacc_hum_score DECIMAL(5,2),
          ebacc_lan_score DECIMAL(5,2),
          
          -- Progress 8 Banding
          progress8_banding VARCHAR(50),
          
          -- Additional Metrics
          average_ebacc_fill DECIMAL(5,2),
          average_open_fill DECIMAL(5,2),
          
          -- Timestamps
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          -- Constraints
          UNIQUE(urn, academic_year)
        );
      `
    });
    
    if (gcseError) {
      console.error('Error creating GCSE results table:', gcseError);
    } else {
      console.log('GCSE results table created successfully!');
    }
    
    // Create GCSE Rankings table
    console.log('Creating GCSE rankings table...');
    const { error: rankingsError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS gcse_rankings (
          id SERIAL PRIMARY KEY,
          urn VARCHAR(20) NOT NULL,
          academic_year VARCHAR(9) NOT NULL,
          
          -- Rankings
          attainment8_rank INTEGER,
          attainment8_total_schools INTEGER,
          attainment8_percentile DECIMAL(5,2),
          
          progress8_rank INTEGER,
          progress8_total_schools INTEGER,
          progress8_percentile DECIMAL(5,2),
          
          grade5_eng_maths_rank INTEGER,
          grade5_eng_maths_total_schools INTEGER,
          grade5_eng_maths_percentile DECIMAL(5,2),
          
          ebacc_rank INTEGER,
          ebacc_total_schools INTEGER,
          ebacc_percentile DECIMAL(5,2),
          
          -- Timestamps
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          -- Constraints
          UNIQUE(urn, academic_year)
        );
      `
    });
    
    if (rankingsError) {
      console.error('Error creating GCSE rankings table:', rankingsError);
    } else {
      console.log('GCSE rankings table created successfully!');
    }
    
    // Create GCSE LA Averages table
    console.log('Creating GCSE LA averages table...');
    const { error: laError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS gcse_la_averages (
          id SERIAL PRIMARY KEY,
          la_code VARCHAR(10) NOT NULL,
          la_name VARCHAR(255) NOT NULL,
          academic_year VARCHAR(9) NOT NULL,
          
          -- LA Averages
          attainment8_avg DECIMAL(5,2),
          progress8_avg DECIMAL(5,2),
          grade5_eng_maths_avg DECIMAL(5,2),
          grade4_eng_maths_avg DECIMAL(5,2),
          five_gcses_grade4_avg DECIMAL(5,2),
          five_gcses_grade5_avg DECIMAL(5,2),
          entering_ebacc_avg DECIMAL(5,2),
          ebacc_avg_point_score DECIMAL(5,2),
          
          -- School Counts
          total_schools INTEGER,
          schools_with_data INTEGER,
          
          -- Timestamps
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          -- Constraints
          UNIQUE(la_code, academic_year)
        );
      `
    });
    
    if (laError) {
      console.error('Error creating GCSE LA averages table:', laError);
    } else {
      console.log('GCSE LA averages table created successfully!');
    }
    
    // Create GCSE England Averages table
    console.log('Creating GCSE England averages table...');
    const { error: englandError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS gcse_england_averages (
          id SERIAL PRIMARY KEY,
          academic_year VARCHAR(9) NOT NULL,
          
          -- England Averages
          attainment8_avg DECIMAL(5,2),
          progress8_avg DECIMAL(5,2),
          grade5_eng_maths_avg DECIMAL(5,2),
          grade4_eng_maths_avg DECIMAL(5,2),
          five_gcses_grade4_avg DECIMAL(5,2),
          five_gcses_grade5_avg DECIMAL(5,2),
          entering_ebacc_avg DECIMAL(5,2),
          ebacc_avg_point_score DECIMAL(5,2),
          
          -- School Counts
          total_schools INTEGER,
          schools_with_data INTEGER,
          
          -- Timestamps
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          -- Constraints
          UNIQUE(academic_year)
        );
      `
    });
    
    if (englandError) {
      console.error('Error creating GCSE England averages table:', englandError);
    } else {
      console.log('GCSE England averages table created successfully!');
    }
    
    console.log('All GCSE tables created successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTables();
