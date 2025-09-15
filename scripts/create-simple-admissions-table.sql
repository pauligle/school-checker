-- Simple admissions table creation
DROP TABLE IF EXISTS admissions;

CREATE TABLE admissions (
  id SERIAL PRIMARY KEY,
  time_period VARCHAR(10) NOT NULL,
  la_code VARCHAR(20) NOT NULL,
  la_name VARCHAR(255) NOT NULL,
  school_phase VARCHAR(50) NOT NULL,
  school_name VARCHAR(255) NOT NULL,
  school_urn VARCHAR(20),
  
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
  applications_from_another_la INTEGER DEFAULT 0,
  offers_to_another_la INTEGER DEFAULT 0,
  
  -- School details
  establishment_type VARCHAR(255),
  denomination VARCHAR(255),
  fsm_eligible_percent DECIMAL(5,2),
  admissions_policy VARCHAR(255),
  urban_rural VARCHAR(255),
  allthrough_school VARCHAR(10),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_admissions_school_urn ON admissions(school_urn);
CREATE INDEX idx_admissions_school_name ON admissions(school_name);
CREATE INDEX idx_admissions_time_period ON admissions(time_period);
CREATE INDEX idx_admissions_school_phase ON admissions(school_phase);
