-- Fix LA averages constraints to allow multiple years per LA

-- Drop the problematic constraint that only allows one record per LA code
ALTER TABLE la_averages DROP CONSTRAINT IF EXISTS la_averages_lea_code_key;

-- Ensure we have the correct constraint for multiple years per LA
ALTER TABLE la_averages DROP CONSTRAINT IF EXISTS la_averages_lea_code_data_year_unique;
ALTER TABLE la_averages ADD CONSTRAINT la_averages_lea_code_data_year_unique UNIQUE (lea_code, data_year);

-- Show current constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'la_averages'::regclass;






