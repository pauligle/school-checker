-- Create Primary Results (KS2) table
-- This table stores Key Stage 2 (Year 6) SATs results for primary schools

CREATE TABLE IF NOT EXISTS primary_results (
  id SERIAL PRIMARY KEY,
  
  -- School identification
  urn INTEGER UNIQUE NOT NULL,
  school_name TEXT,
  lea_code INTEGER,
  establishment_number INTEGER,
  
  -- Basic school info
  school_type TEXT,
  age_range TEXT,
  total_pupils INTEGER,
  eligible_pupils INTEGER,
  
  -- Reading, Writing and Maths combined
  rwm_expected_percentage DECIMAL(5,2), -- PTRWM_EXP
  rwm_higher_percentage DECIMAL(5,2),   -- PTRWM_HIGH
  
  -- Reading
  reading_expected_percentage DECIMAL(5,2), -- PTREAD_EXP
  reading_higher_percentage DECIMAL(5,2),   -- PTREAD_HIGH
  reading_average_score DECIMAL(5,2),        -- READ_AVERAGE
  
  -- Maths
  maths_expected_percentage DECIMAL(5,2),    -- PTMAT_EXP
  maths_higher_percentage DECIMAL(5,2),      -- PTMAT_HIGH
  maths_average_score DECIMAL(5,2),          -- MAT_AVERAGE
  
  -- Grammar, Punctuation and Spelling
  gps_expected_percentage DECIMAL(5,2),      -- PTGPS_EXP
  gps_higher_percentage DECIMAL(5,2),        -- PTGPS_HIGH
  gps_average_score DECIMAL(5,2),            -- GPS_AVERAGE
  
  -- Writing (Teacher Assessment)
  writing_expected_percentage DECIMAL(5,2),  -- PTWRITTA_EXP
  writing_higher_percentage DECIMAL(5,2),     -- PTWRITTA_HIGH
  
  -- Science (Teacher Assessment)
  science_expected_percentage DECIMAL(5,2),  -- PTSCITA_EXP
  
  -- Disadvantaged pupils performance
  disadvantaged_rwm_expected DECIMAL(5,2),    -- PTRWM_EXP_FSM6CLA1A
  disadvantaged_rwm_higher DECIMAL(5,2),      -- PTRWM_HIGH_FSM6CLA1A
  non_disadvantaged_rwm_expected DECIMAL(5,2), -- PTRWM_EXP_NotFSM6CLA1A
  non_disadvantaged_rwm_higher DECIMAL(5,2),   -- PTRWM_HIGH_NotFSM6CLA1A
  
  -- Gender breakdown
  boys_rwm_expected DECIMAL(5,2),             -- PTRWM_EXP_B
  boys_rwm_higher DECIMAL(5,2),              -- PTRWM_HIGH_B
  girls_rwm_expected DECIMAL(5,2),           -- PTRWM_EXP_G
  girls_rwm_higher DECIMAL(5,2),             -- PTRWM_HIGH_G
  
  -- EAL pupils
  eal_rwm_expected DECIMAL(5,2),             -- PTRWM_EXP_EAL
  eal_rwm_higher DECIMAL(5,2),               -- PTRWM_HIGH_EAL
  
  -- Data year (extracted from filename or added manually)
  data_year INTEGER DEFAULT 2024,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_primary_results_urn ON primary_results(urn);
CREATE INDEX IF NOT EXISTS idx_primary_results_school_name ON primary_results(school_name);
CREATE INDEX IF NOT EXISTS idx_primary_results_data_year ON primary_results(data_year);
CREATE INDEX IF NOT EXISTS idx_primary_results_rwm_expected ON primary_results(rwm_expected_percentage);

-- Create a view for easy access to key metrics
CREATE OR REPLACE VIEW primary_results_summary AS
SELECT 
  urn,
  school_name,
  data_year,
  rwm_expected_percentage,
  rwm_higher_percentage,
  reading_average_score,
  maths_average_score,
  gps_expected_percentage,
  gps_higher_percentage,
  writing_expected_percentage,
  writing_higher_percentage,
  science_expected_percentage
FROM primary_results
WHERE rwm_expected_percentage IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE primary_results IS 'Key Stage 2 (Year 6) SATs results for primary schools';
COMMENT ON COLUMN primary_results.urn IS 'Unique Reference Number - links to schools table';
COMMENT ON COLUMN primary_results.rwm_expected_percentage IS 'Percentage reaching expected standard in Reading, Writing and Maths combined';
COMMENT ON COLUMN primary_results.rwm_higher_percentage IS 'Percentage achieving higher standard in Reading, Writing and Maths combined';
COMMENT ON COLUMN primary_results.reading_average_score IS 'Average scaled score in Reading (100 = expected standard)';
COMMENT ON COLUMN primary_results.maths_average_score IS 'Average scaled score in Maths (100 = expected standard)';
COMMENT ON COLUMN primary_results.gps_expected_percentage IS 'Percentage reaching expected standard in Grammar, Punctuation and Spelling';
COMMENT ON COLUMN primary_results.gps_higher_percentage IS 'Percentage achieving higher standard in Grammar, Punctuation and Spelling';

