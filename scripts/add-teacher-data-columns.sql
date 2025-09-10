-- Add teacher data columns to the schools table
-- These columns will store 2023/24 School Workforce Census data

-- Add teacher data columns
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS pupils_fte_2024 DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS qualified_teachers_fte_2024 DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS teachers_fte_2024 DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS pupil_to_qualified_teacher_ratio_2024 DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS pupil_to_all_teacher_ratio_2024 DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS pupil_to_adult_ratio_2024 DECIMAL(10,2);

-- Add comments to explain the columns
COMMENT ON COLUMN schools.pupils_fte_2024 IS 'Full-time equivalent pupils (2023/24 academic year)';
COMMENT ON COLUMN schools.qualified_teachers_fte_2024 IS 'Full-time equivalent qualified teachers (2023/24 academic year)';
COMMENT ON COLUMN schools.teachers_fte_2024 IS 'Full-time equivalent all teachers (2023/24 academic year)';
COMMENT ON COLUMN schools.pupil_to_qualified_teacher_ratio_2024 IS 'Pupil to qualified teacher ratio (2023/24 academic year)';
COMMENT ON COLUMN schools.pupil_to_all_teacher_ratio_2024 IS 'Pupil to all teachers ratio (2023/24 academic year)';
COMMENT ON COLUMN schools.pupil_to_adult_ratio_2024 IS 'Pupil to adult ratio (2023/24 academic year)';

-- Create index on URN for faster lookups
CREATE INDEX IF NOT EXISTS idx_schools_urn_teacher_data ON schools(urn);

-- Update the updated_at trigger to include new columns
DO $$ 
BEGIN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS update_schools_updated_at ON schools;
    
    -- Create new trigger
    CREATE TRIGGER update_schools_updated_at
        BEFORE UPDATE ON schools
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
END $$;
