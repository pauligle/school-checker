-- Create new primary_results table with year-specific fields
-- This handles different CSV structures for each year (2018-2024)

-- Drop existing table if it exists
DROP TABLE IF EXISTS primary_results CASCADE;

-- Create new table with year-specific fields
CREATE TABLE primary_results (
    urn TEXT PRIMARY KEY,
    school_name TEXT,
    lea_code INTEGER,
    
    -- 2018 data
    reading_2018 DECIMAL(5,2),
    maths_2018 DECIMAL(5,2),
    gps_2018 DECIMAL(5,2),
    rwm_exp_2018 INTEGER,
    rwm_high_2018 INTEGER,
    gps_exp_2018 INTEGER,
    gps_high_2018 INTEGER,
    
    -- 2019 data
    reading_2019 DECIMAL(5,2),
    maths_2019 DECIMAL(5,2),
    gps_2019 DECIMAL(5,2),
    rwm_exp_2019 INTEGER,
    rwm_high_2019 INTEGER,
    gps_exp_2019 INTEGER,
    gps_high_2019 INTEGER,
    
    -- 2023 data
    reading_2023 DECIMAL(5,2),
    maths_2023 DECIMAL(5,2),
    gps_2023 DECIMAL(5,2),
    rwm_exp_2023 INTEGER,
    rwm_high_2023 INTEGER,
    gps_exp_2023 INTEGER,
    gps_high_2023 INTEGER,
    
    -- 2024 data
    reading_2024 DECIMAL(5,2),
    maths_2024 DECIMAL(5,2),
    gps_2024 DECIMAL(5,2),
    rwm_exp_2024 INTEGER,
    rwm_high_2024 INTEGER,
    gps_exp_2024 INTEGER,
    gps_high_2024 INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_primary_results_urn ON primary_results(urn);
CREATE INDEX idx_primary_results_lea_code ON primary_results(lea_code);
CREATE INDEX idx_primary_results_school_name ON primary_results(school_name);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_primary_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_primary_results_updated_at 
    BEFORE UPDATE ON primary_results 
    FOR EACH ROW 
    EXECUTE FUNCTION update_primary_results_updated_at();

-- Enable RLS
ALTER TABLE primary_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to primary_results" ON primary_results
    FOR SELECT USING (true);

CREATE POLICY "Allow service role full access to primary_results" ON primary_results
    FOR ALL USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON primary_results TO anon;
GRANT SELECT ON primary_results TO authenticated;
GRANT ALL ON primary_results TO service_role;

-- Add comments
COMMENT ON TABLE primary_results IS 'Primary school results with year-specific fields to handle different CSV structures';
COMMENT ON COLUMN primary_results.urn IS 'Unique Reference Number - primary identifier for schools';
COMMENT ON COLUMN primary_results.reading_2024 IS 'Reading average scaled score for 2024';
COMMENT ON COLUMN primary_results.maths_2024 IS 'Maths average scaled score for 2024';
COMMENT ON COLUMN primary_results.rwm_exp_2024 IS 'Percentage of pupils meeting expected standard in reading, writing and maths for 2024';
