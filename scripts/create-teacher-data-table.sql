-- Create a separate table for teacher data
CREATE TABLE IF NOT EXISTS teacher_data (
  id SERIAL PRIMARY KEY,
  school_urn TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  pupils_fte DECIMAL(10,2),
  qualified_teachers_fte DECIMAL(10,2),
  teachers_fte DECIMAL(10,2),
  pupil_to_qualified_teacher_ratio DECIMAL(10,2),
  pupil_to_all_teacher_ratio DECIMAL(10,2),
  pupil_to_adult_ratio DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_urn, academic_year)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_teacher_data_urn ON teacher_data(school_urn);
CREATE INDEX IF NOT EXISTS idx_teacher_data_year ON teacher_data(academic_year);

-- Add foreign key constraint
ALTER TABLE teacher_data 
ADD CONSTRAINT fk_teacher_data_school_urn 
FOREIGN KEY (school_urn) REFERENCES schools(urn) ON DELETE CASCADE;

-- Create trigger for updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_teacher_data_updated_at') THEN
        CREATE TRIGGER update_teacher_data_updated_at
            BEFORE UPDATE ON teacher_data
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
