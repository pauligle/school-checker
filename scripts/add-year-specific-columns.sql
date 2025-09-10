-- Add year-specific columns to existing primary_results table
-- This approach keeps existing data and adds new year-specific fields

-- Add 2018 columns
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS reading_2018 DECIMAL(5,2);
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS maths_2018 DECIMAL(5,2);
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS gps_2018 DECIMAL(5,2);
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS rwm_exp_2018 INTEGER;
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS rwm_high_2018 INTEGER;
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS gps_exp_2018 INTEGER;
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS gps_high_2018 INTEGER;

-- Add 2019 columns
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS reading_2019 DECIMAL(5,2);
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS maths_2019 DECIMAL(5,2);
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS gps_2019 DECIMAL(5,2);
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS rwm_exp_2019 INTEGER;
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS rwm_high_2019 INTEGER;
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS gps_exp_2019 INTEGER;
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS gps_high_2019 INTEGER;

-- Add 2023 columns
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS reading_2023 DECIMAL(5,2);
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS maths_2023 DECIMAL(5,2);
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS gps_2023 DECIMAL(5,2);
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS rwm_exp_2023 INTEGER;
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS rwm_high_2023 INTEGER;
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS gps_exp_2023 INTEGER;
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS gps_high_2023 INTEGER;

-- Add 2024 columns
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS reading_2024 DECIMAL(5,2);
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS maths_2024 DECIMAL(5,2);
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS gps_2024 DECIMAL(5,2);
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS rwm_exp_2024 INTEGER;
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS rwm_high_2024 INTEGER;
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS gps_exp_2024 INTEGER;
ALTER TABLE primary_results ADD COLUMN IF NOT EXISTS gps_high_2024 INTEGER;

-- Add comments
COMMENT ON COLUMN primary_results.reading_2024 IS 'Reading average scaled score for 2024';
COMMENT ON COLUMN primary_results.maths_2024 IS 'Maths average scaled score for 2024';
COMMENT ON COLUMN primary_results.rwm_exp_2024 IS 'Percentage of pupils meeting expected standard in reading, writing and maths for 2024';
