-- Update existing schools table to add missing columns
-- Run this in your Supabase SQL Editor

-- Add missing columns to schools table (safe with IF NOT EXISTS)
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS number_of_boys INTEGER,
ADD COLUMN IF NOT EXISTS number_of_girls INTEGER;

-- Add new headteacher columns (safe with IF NOT EXISTS)
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS headteacher_title TEXT,
ADD COLUMN IF NOT EXISTS headteacher_first_name TEXT,
ADD COLUMN IF NOT EXISTS headteacher_last_name TEXT,
ADD COLUMN IF NOT EXISTS headteacher_preferred_title TEXT;

-- Update existing headteacher data to headteacher_title (only if needed)
UPDATE schools 
SET headteacher_title = headteacher 
WHERE headteacher IS NOT NULL AND headteacher_title IS NULL;

-- Drop dependent views first (if they exist)
DROP VIEW IF EXISTS schools_with_latest_inspection CASCADE;
DROP VIEW IF EXISTS schools_with_performance CASCADE;

-- Drop the old headteacher column (safe with IF EXISTS)
ALTER TABLE schools DROP COLUMN IF EXISTS headteacher;

-- Recreate the views with the new headteacher_title column
CREATE OR REPLACE VIEW schools_with_latest_inspection AS
SELECT 
    s.*,
    i.inspection_date,
    i.overall_rating,
    i.previous_rating,
    i.quality_of_education,
    i.behaviour_attitudes,
    i.personal_development,
    i.leadership_management
FROM schools s
LEFT JOIN LATERAL (
    SELECT *
    FROM inspections
    WHERE urn = s.urn
    ORDER BY inspection_date DESC
    LIMIT 1
) i ON true
WHERE s.lat IS NOT NULL 
    AND s.lon IS NOT NULL;

CREATE OR REPLACE VIEW schools_with_performance AS
SELECT 
    s.*,
    p.progress_score,
    p.attainment_score,
    p.disadvantaged_progress,
    p.disadvantaged_attainment,
    p.year
FROM schools s
LEFT JOIN LATERAL (
    SELECT *
    FROM performance
    WHERE urn = s.urn
    ORDER BY year DESC
    LIMIT 1
) p ON true
WHERE s.lat IS NOT NULL 
    AND s.lon IS NOT NULL;

-- Create indexes for new columns (safe with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_schools_boys ON schools(number_of_boys);
CREATE INDEX IF NOT EXISTS idx_schools_girls ON schools(number_of_girls);
CREATE INDEX IF NOT EXISTS idx_schools_headteacher ON schools(headteacher_last_name);

-- Update database statistics
INSERT INTO database_stats (table_name, schools_count, last_updated)
VALUES ('schools', (SELECT COUNT(*) FROM schools), NOW())
ON CONFLICT (table_name) 
DO UPDATE SET 
  schools_count = (SELECT COUNT(*) FROM schools),
  last_updated = NOW();
