-- Create GCSE Results table
-- This table stores GCSE performance data for schools

CREATE TABLE IF NOT EXISTS gcse_results (
    id SERIAL PRIMARY KEY,
    urn VARCHAR(20) NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    academic_year VARCHAR(9) NOT NULL, -- e.g., '2023-24'
    
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
    grade5_eng_maths_percent DECIMAL(5,2), -- Grade 5+ in English and Maths
    grade4_eng_maths_percent DECIMAL(5,2), -- Grade 4+ in English and Maths
    five_gcses_grade4_percent DECIMAL(5,2), -- 5+ GCSEs at grade 9-4
    five_gcses_grade5_percent DECIMAL(5,2), -- 5+ GCSEs at grade 9-5
    
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
    progress8_banding VARCHAR(50), -- e.g., 'Well above average', 'Average', 'Below average'
    
    -- Additional Metrics
    average_ebacc_fill DECIMAL(5,2),
    average_open_fill DECIMAL(5,2),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(urn, academic_year)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gcse_results_urn ON gcse_results(urn);
CREATE INDEX IF NOT EXISTS idx_gcse_results_academic_year ON gcse_results(academic_year);
CREATE INDEX IF NOT EXISTS idx_gcse_results_attainment8 ON gcse_results(attainment8_score);
CREATE INDEX IF NOT EXISTS idx_gcse_results_progress8 ON gcse_results(progress8_score);
CREATE INDEX IF NOT EXISTS idx_gcse_results_grade5_eng_maths ON gcse_results(grade5_eng_maths_percent);

-- Create GCSE Rankings table for school comparisons
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

-- Create indexes for rankings
CREATE INDEX IF NOT EXISTS idx_gcse_rankings_urn ON gcse_rankings(urn);
CREATE INDEX IF NOT EXISTS idx_gcse_rankings_academic_year ON gcse_rankings(academic_year);
CREATE INDEX IF NOT EXISTS idx_gcse_rankings_attainment8_rank ON gcse_rankings(attainment8_rank);
CREATE INDEX IF NOT EXISTS idx_gcse_rankings_progress8_rank ON gcse_rankings(progress8_rank);

-- Create GCSE Local Authority Averages table
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

-- Create indexes for LA averages
CREATE INDEX IF NOT EXISTS idx_gcse_la_averages_la_code ON gcse_la_averages(la_code);
CREATE INDEX IF NOT EXISTS idx_gcse_la_averages_academic_year ON gcse_la_averages(academic_year);

-- Create GCSE England Averages table
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

-- Create indexes for England averages
CREATE INDEX IF NOT EXISTS idx_gcse_england_averages_academic_year ON gcse_england_averages(academic_year);

-- Add comments for documentation
COMMENT ON TABLE gcse_results IS 'GCSE performance data for individual schools';
COMMENT ON TABLE gcse_rankings IS 'Rankings and percentiles for GCSE performance metrics';
COMMENT ON TABLE gcse_la_averages IS 'Local Authority averages for GCSE performance metrics';
COMMENT ON TABLE gcse_england_averages IS 'England-wide averages for GCSE performance metrics';
