-- Create GCSE Results table for multiple years (2018-2024)
CREATE TABLE IF NOT EXISTS gcse_results_multi_year (
    id SERIAL PRIMARY KEY,
    urn INTEGER NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    lea_code INTEGER,
    academic_year INTEGER NOT NULL,
    
    -- Attainment 8 Score
    attainment8_score DECIMAL(5,2),
    
    -- Grade 5 or above in English and maths
    grade5_eng_maths_percent DECIMAL(5,2),
    
    -- 5 or more GCSEs at grade 9-4 (or A-C)
    five_gcses_grade4_percent DECIMAL(5,2),
    
    -- Entering EBacc
    entering_ebacc_percent DECIMAL(5,2),
    
    -- EBacc average point score
    ebacc_avg_point_score DECIMAL(5,2),
    
    -- Progress 8
    progress8_score DECIMAL(5,2),
    progress8_banding VARCHAR(50),
    
    -- Additional fields for different years
    -- Some years may have different column names or structures
    raw_data JSONB, -- Store original CSV row for flexibility
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(urn, academic_year)
);

-- Create GCSE Rankings table for multiple years
CREATE TABLE IF NOT EXISTS gcse_rankings_multi_year (
    id SERIAL PRIMARY KEY,
    urn INTEGER NOT NULL,
    school_name VARCHAR(255) NOT NULL,
    lea_code INTEGER,
    academic_year INTEGER NOT NULL,
    
    -- Rankings (matching the import script column names)
    attainment8_rank INTEGER,
    grade5_eng_maths_percent_rank INTEGER,
    five_gcses_grade4_percent_rank INTEGER,
    entering_ebacc_percent_rank INTEGER,
    ebacc_avg_point_score_rank INTEGER,
    progress8_score_rank INTEGER,
    
    -- Total schools in ranking
    total_schools INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(urn, academic_year)
);

-- Create GCSE Averages table for multiple years
CREATE TABLE IF NOT EXISTS gcse_averages_multi_year (
    id SERIAL PRIMARY KEY,
    academic_year INTEGER NOT NULL,
    lea_code INTEGER,
    lea_name VARCHAR(255),
    
    -- LA Averages
    attainment8_la_avg DECIMAL(5,2),
    grade5_eng_maths_la_avg DECIMAL(5,2),
    five_gcses_grade4_la_avg DECIMAL(5,2),
    entering_ebacc_la_avg DECIMAL(5,2),
    ebacc_avg_point_score_la_avg DECIMAL(5,2),
    progress8_la_avg DECIMAL(5,2),
    
    -- England Averages
    attainment8_england_avg DECIMAL(5,2),
    grade5_eng_maths_england_avg DECIMAL(5,2),
    five_gcses_grade4_england_avg DECIMAL(5,2),
    entering_ebacc_england_avg DECIMAL(5,2),
    ebacc_avg_point_score_england_avg DECIMAL(5,2),
    progress8_england_avg DECIMAL(5,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(academic_year, lea_code)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gcse_results_multi_year_urn_year ON gcse_results_multi_year(urn, academic_year);
CREATE INDEX IF NOT EXISTS idx_gcse_results_multi_year_year ON gcse_results_multi_year(academic_year);
CREATE INDEX IF NOT EXISTS idx_gcse_results_multi_year_lea ON gcse_results_multi_year(lea_code);

CREATE INDEX IF NOT EXISTS idx_gcse_rankings_multi_year_urn_year ON gcse_rankings_multi_year(urn, academic_year);
CREATE INDEX IF NOT EXISTS idx_gcse_rankings_multi_year_year ON gcse_rankings_multi_year(academic_year);

CREATE INDEX IF NOT EXISTS idx_gcse_averages_multi_year_year_lea ON gcse_averages_multi_year(academic_year, lea_code);
CREATE INDEX IF NOT EXISTS idx_gcse_averages_multi_year_year ON gcse_averages_multi_year(academic_year);
