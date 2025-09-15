-- Run this in Supabase SQL Editor to create the admissions table

CREATE TABLE IF NOT EXISTS admissions (
  id SERIAL PRIMARY KEY,
  time_period VARCHAR(10) NOT NULL,
  la_code VARCHAR(20) NOT NULL,
  la_name VARCHAR(255) NOT NULL,
  school_phase VARCHAR(50) NOT NULL,
  school_laestab VARCHAR(20) NOT NULL,
  school_name VARCHAR(255) NOT NULL,
  school_urn VARCHAR(20),
  entry_year VARCHAR(10),
  
  -- Application data
  total_places_offered INTEGER DEFAULT 0,
  number_preferred_offers INTEGER DEFAULT 0,
  number_1st_preference_offers INTEGER DEFAULT 0,
  number_2nd_preference_offers INTEGER DEFAULT 0,
  number_3rd_preference_offers INTEGER DEFAULT 0,
  
  -- Preference data
  times_put_as_any_preferred_school INTEGER DEFAULT 0,
  times_put_as_1st_preference INTEGER DEFAULT 0,
  times_put_as_2nd_preference INTEGER DEFAULT 0,
  times_put_as_3rd_preference INTEGER DEFAULT 0,
  
  -- Proportions
  proportion_1stprefs_v_1stprefoffers DECIMAL(10,6) DEFAULT 0,
  proportion_1stprefs_v_totaloffers DECIMAL(10,6) DEFAULT 0,
  
  -- Cross-LA data
  all_applications_from_another_LA INTEGER DEFAULT 0,
  offers_to_applicants_from_another_LA INTEGER DEFAULT 0,
  
  -- School details
  establishment_type VARCHAR(255),
  denomination VARCHAR(255),
  fsm_eligible_percent DECIMAL(5,2),
  admissions_policy VARCHAR(255),
  urban_rural VARCHAR(255),
  allthrough_school VARCHAR(10),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admissions_school_urn ON admissions(school_urn);
CREATE INDEX IF NOT EXISTS idx_admissions_school_name ON admissions(school_name);
CREATE INDEX IF NOT EXISTS idx_admissions_time_period ON admissions(time_period);
CREATE INDEX IF NOT EXISTS idx_admissions_school_phase ON admissions(school_phase);
CREATE INDEX IF NOT EXISTS idx_admissions_la_code ON admissions(la_code);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_admissions_urn_phase_period ON admissions(school_urn, school_phase, time_period);

-- Add comments for documentation
COMMENT ON TABLE admissions IS 'School admissions data from DfE applications and offers statistics';
COMMENT ON COLUMN admissions.time_period IS 'Academic year period (e.g., 202526 for 2025/26)';
COMMENT ON COLUMN admissions.school_phase IS 'Primary or Secondary';
COMMENT ON COLUMN admissions.total_places_offered IS 'Total number of places offered by the school';
COMMENT ON COLUMN admissions.times_put_as_any_preferred_school IS 'Total applications received';
COMMENT ON COLUMN admissions.times_put_as_1st_preference IS 'Applications as first preference';
COMMENT ON COLUMN admissions.number_1st_preference_offers IS 'Offers made to first preference applicants';
COMMENT ON COLUMN admissions.all_applications_from_another_LA IS 'Applications from outside the school''s local authority';
COMMENT ON COLUMN admissions.offers_to_applicants_from_another_LA IS 'Offers made to applicants from outside the school''s local authority';
