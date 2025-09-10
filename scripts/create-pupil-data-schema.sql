-- =====================================================
-- PUPIL DATA SCHEMA CREATION SCRIPT
-- =====================================================
-- This script creates the database schema for pupil data
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PHASE 1: EXTEND SCHOOLS TABLE WITH 2024-25 DATA
-- =====================================================

-- Add 2024-25 pupil data columns to existing schools table
ALTER TABLE schools ADD COLUMN IF NOT EXISTS pupils_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS boys_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS girls_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS fte_pupils_202425 DECIMAL(8,1);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS fsm_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS fsm_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS english_first_language_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS english_first_language_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS other_language_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS other_language_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS unclassified_language_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS unclassified_language_percentage_202425 DECIMAL(5,2);

-- Add key ethnicity data (most common groups)
ALTER TABLE schools ADD COLUMN IF NOT EXISTS white_british_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS white_british_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS white_irish_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS white_irish_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS white_other_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS white_other_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS traveller_irish_heritage_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS traveller_irish_heritage_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS gypsy_roma_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS gypsy_roma_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS mixed_white_black_caribbean_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS mixed_white_black_caribbean_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS mixed_white_black_african_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS mixed_white_black_african_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS mixed_white_asian_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS mixed_white_asian_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS mixed_other_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS mixed_other_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS asian_indian_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS asian_indian_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS asian_pakistani_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS asian_pakistani_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS asian_bangladeshi_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS asian_bangladeshi_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS asian_other_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS asian_other_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS black_caribbean_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS black_caribbean_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS black_african_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS black_african_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS black_other_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS black_other_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS chinese_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS chinese_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS other_ethnicity_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS other_ethnicity_percentage_202425 DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS unclassified_ethnicity_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS unclassified_ethnicity_percentage_202425 DECIMAL(5,2);

-- Add boarding data
ALTER TABLE schools ADD COLUMN IF NOT EXISTS male_boarders_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS female_boarders_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS total_boarders_202425 INTEGER;

-- Add young carers data
ALTER TABLE schools ADD COLUMN IF NOT EXISTS young_carers_202425 INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS young_carers_percentage_202425 DECIMAL(5,2);

-- Add data source and update timestamp
ALTER TABLE schools ADD COLUMN IF NOT EXISTS pupil_data_source_202425 VARCHAR(50) DEFAULT 'DfE School Census 2024-25';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS pupil_data_updated_202425 TIMESTAMP DEFAULT NOW();

-- =====================================================
-- PHASE 2: CREATE DETAILED BREAKDOWN TABLES
-- =====================================================

-- 1. PUPIL COHORTS TABLE (Year Group Breakdowns)
CREATE TABLE IF NOT EXISTS pupil_cohorts (
    id SERIAL PRIMARY KEY,
    school_urn TEXT NOT NULL,
    academic_year VARCHAR(7) NOT NULL, -- '202425', '202324', etc.
    year_group VARCHAR(20) NOT NULL, -- 'nursery1', 'nursery2', 'reception', 'year1', etc.
    boys_count INTEGER DEFAULT 0,
    girls_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    full_time_count INTEGER DEFAULT 0,
    part_time_count INTEGER DEFAULT 0,
    fte_count DECIMAL(8,1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_pupil_cohorts_school_urn 
        FOREIGN KEY (school_urn) REFERENCES schools(urn) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicates
    CONSTRAINT uk_pupil_cohorts_unique 
        UNIQUE (school_urn, academic_year, year_group)
);

-- 2. PUPIL ETHNICITIES TABLE (Detailed Ethnicity Breakdown)
CREATE TABLE IF NOT EXISTS pupil_ethnicities (
    id SERIAL PRIMARY KEY,
    school_urn TEXT NOT NULL,
    academic_year VARCHAR(7) NOT NULL,
    ethnicity_code VARCHAR(10), -- DfE ethnicity codes
    ethnicity_name VARCHAR(100) NOT NULL,
    pupil_count INTEGER DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_pupil_ethnicities_school_urn 
        FOREIGN KEY (school_urn) REFERENCES schools(urn) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicates
    CONSTRAINT uk_pupil_ethnicities_unique 
        UNIQUE (school_urn, academic_year, ethnicity_name)
);

-- 3. CLASS SIZES TABLE
CREATE TABLE IF NOT EXISTS class_sizes (
    id SERIAL PRIMARY KEY,
    school_urn TEXT NOT NULL,
    academic_year VARCHAR(7) NOT NULL,
    class_type VARCHAR(50) NOT NULL, -- 'infant', 'junior', 'mixed', etc.
    size_range VARCHAR(20), -- '1 to 30', '31 to 35', '36 plus', 'Total'
    number_of_classes INTEGER DEFAULT 0,
    number_of_pupils INTEGER DEFAULT 0,
    average_class_size DECIMAL(4,1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_class_sizes_school_urn 
        FOREIGN KEY (school_urn) REFERENCES schools(urn) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicates
    CONSTRAINT uk_class_sizes_unique 
        UNIQUE (school_urn, academic_year, class_type, size_range)
);

-- 4. PUPIL CHARACTERISTICS TABLE (Additional Characteristics)
CREATE TABLE IF NOT EXISTS pupil_characteristics (
    id SERIAL PRIMARY KEY,
    school_urn INTEGER NOT NULL,
    academic_year VARCHAR(7) NOT NULL,
    characteristic_type VARCHAR(50) NOT NULL, -- 'fsm', 'language', 'young_carers', etc.
    characteristic_name VARCHAR(100) NOT NULL,
    pupil_count INTEGER DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_pupil_characteristics_school_urn 
        FOREIGN KEY (school_urn) REFERENCES schools(urn) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicates
    CONSTRAINT uk_pupil_characteristics_unique 
        UNIQUE (school_urn, academic_year, characteristic_type, characteristic_name)
);

-- =====================================================
-- PHASE 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for pupil_cohorts table
CREATE INDEX IF NOT EXISTS idx_pupil_cohorts_school_urn ON pupil_cohorts(school_urn);
CREATE INDEX IF NOT EXISTS idx_pupil_cohorts_academic_year ON pupil_cohorts(academic_year);
CREATE INDEX IF NOT EXISTS idx_pupil_cohorts_year_group ON pupil_cohorts(year_group);
CREATE INDEX IF NOT EXISTS idx_pupil_cohorts_composite ON pupil_cohorts(school_urn, academic_year);

-- Indexes for pupil_ethnicities table
CREATE INDEX IF NOT EXISTS idx_pupil_ethnicities_school_urn ON pupil_ethnicities(school_urn);
CREATE INDEX IF NOT EXISTS idx_pupil_ethnicities_academic_year ON pupil_ethnicities(academic_year);
CREATE INDEX IF NOT EXISTS idx_pupil_ethnicities_ethnicity_name ON pupil_ethnicities(ethnicity_name);
CREATE INDEX IF NOT EXISTS idx_pupil_ethnicities_composite ON pupil_ethnicities(school_urn, academic_year);

-- Indexes for class_sizes table
CREATE INDEX IF NOT EXISTS idx_class_sizes_school_urn ON class_sizes(school_urn);
CREATE INDEX IF NOT EXISTS idx_class_sizes_academic_year ON class_sizes(academic_year);
CREATE INDEX IF NOT EXISTS idx_class_sizes_class_type ON class_sizes(class_type);
CREATE INDEX IF NOT EXISTS idx_class_sizes_composite ON class_sizes(school_urn, academic_year);

-- Indexes for pupil_characteristics table
CREATE INDEX IF NOT EXISTS idx_pupil_characteristics_school_urn ON pupil_characteristics(school_urn);
CREATE INDEX IF NOT EXISTS idx_pupil_characteristics_academic_year ON pupil_characteristics(academic_year);
CREATE INDEX IF NOT EXISTS idx_pupil_characteristics_type ON pupil_characteristics(characteristic_type);
CREATE INDEX IF NOT EXISTS idx_pupil_characteristics_composite ON pupil_characteristics(school_urn, academic_year);

-- =====================================================
-- PHASE 4: CREATE UPDATED_AT TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pupil_cohorts_updated_at') THEN
        CREATE TRIGGER update_pupil_cohorts_updated_at 
            BEFORE UPDATE ON pupil_cohorts 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pupil_ethnicities_updated_at') THEN
        CREATE TRIGGER update_pupil_ethnicities_updated_at 
            BEFORE UPDATE ON pupil_ethnicities 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_class_sizes_updated_at') THEN
        CREATE TRIGGER update_class_sizes_updated_at 
            BEFORE UPDATE ON class_sizes 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pupil_characteristics_updated_at') THEN
        CREATE TRIGGER update_pupil_characteristics_updated_at 
            BEFORE UPDATE ON pupil_characteristics 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- PHASE 5: CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for school pupil summary (2024-25)
CREATE OR REPLACE VIEW school_pupil_summary_202425 AS
SELECT 
    s.urn,
    s.establishmentname as school_name,
    s.la__name_ as local_authority,
    s.phaseofeducation__name_ as phase,
    s.pupils_202425 as total_pupils,
    s.boys_202425 as boys,
    s.girls_202425 as girls,
    s.fte_pupils_202425 as fte_pupils,
    s.fsm_202425 as fsm_count,
    s.fsm_percentage_202425 as fsm_percentage,
    s.english_first_language_202425 as english_first_language,
    s.english_first_language_percentage_202425 as english_first_language_percentage,
    s.white_british_202425 as white_british,
    s.white_british_percentage_202425 as white_british_percentage,
    s.asian_indian_202425 as asian_indian,
    s.asian_indian_percentage_202425 as asian_indian_percentage,
    s.asian_pakistani_202425 as asian_pakistani,
    s.asian_pakistani_percentage_202425 as asian_pakistani_percentage,
    s.black_african_202425 as black_african,
    s.black_african_percentage_202425 as black_african_percentage,
    s.mixed_202425 as mixed,
    s.mixed_percentage_202425 as mixed_percentage,
    s.total_boarders_202425 as boarders,
    s.young_carers_202425 as young_carers,
    s.young_carers_percentage_202425 as young_carers_percentage,
    s.pupil_data_updated_202425 as data_updated
FROM schools s
WHERE s.pupils_202425 IS NOT NULL;

-- View for year group breakdowns
CREATE OR REPLACE VIEW school_year_groups_202425 AS
SELECT 
    s.urn,
    s.establishmentname as school_name,
    pc.year_group,
    pc.boys_count,
    pc.girls_count,
    pc.total_count,
    pc.fte_count
FROM schools s
JOIN pupil_cohorts pc ON s.urn = pc.school_urn
WHERE pc.academic_year = '202425'
ORDER BY s.urn, pc.year_group;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This will show a success message when the script completes
DO $$
BEGIN
    RAISE NOTICE '✅ PUPIL DATA SCHEMA CREATION COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '📊 Added 2024-25 columns to schools table';
    RAISE NOTICE '🗄️ Created 4 new detailed tables:';
    RAISE NOTICE '   - pupil_cohorts (year group breakdowns)';
    RAISE NOTICE '   - pupil_ethnicities (detailed ethnicity data)';
    RAISE NOTICE '   - class_sizes (class size information)';
    RAISE NOTICE '   - pupil_characteristics (additional characteristics)';
    RAISE NOTICE '🚀 Created performance indexes and views';
    RAISE NOTICE '⏰ Added updated_at triggers';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 NEXT STEPS:';
    RAISE NOTICE '1. Run the data import script';
    RAISE NOTICE '2. Test the new API endpoints';
    RAISE NOTICE '3. Update the frontend Pupils Data tab';
END $$;
