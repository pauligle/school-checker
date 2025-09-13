-- Create inspections table for Ofsted inspection data
DROP TABLE IF EXISTS inspections CASCADE;

CREATE TABLE inspections (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- School identification
  urn TEXT UNIQUE,
  school_name TEXT,
  ofsted_phase TEXT,
  type_of_education TEXT,
  local_authority TEXT,
  postcode TEXT,
  total_pupils INTEGER,
  statutory_low_age INTEGER,
  statutory_high_age INTEGER,
  
  -- Latest graded inspection
  latest_inspection_number TEXT,
  inspection_type TEXT,
  inspection_date TEXT,
  publication_date TEXT,
  outcome INTEGER, -- 1=Outstanding, 2=Good, 3=Requires improvement, 4=Inadequate
  category_of_concern TEXT,
  quality_of_education INTEGER,
  behaviour_and_attitudes INTEGER,
  personal_development INTEGER,
  effectiveness_of_leadership INTEGER,
  safeguarding_effective TEXT,
  early_years_provision INTEGER,
  sixth_form_provision INTEGER,
  
  -- Previous inspection
  previous_inspection_number TEXT,
  previous_inspection_date TEXT,
  previous_publication_date TEXT,
  previous_outcome INTEGER,
  
  -- Ungraded inspection
  latest_ungraded_inspection_number TEXT,
  ungraded_inspection_date TEXT,
  ungraded_publication_date TEXT,
  ungraded_outcome TEXT,
  
  -- Links
  ofsted_report_url TEXT,
  
  -- Import metadata
  import_date TIMESTAMP WITH TIME ZONE,
  data_source TEXT
);

-- Create indexes
CREATE INDEX idx_inspections_urn ON inspections(urn);
CREATE INDEX idx_inspections_outcome ON inspections(outcome);
CREATE INDEX idx_inspections_date ON inspections(inspection_date);
CREATE INDEX idx_inspections_local_authority ON inspections(local_authority);

-- Enable RLS
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON inspections
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for service role" ON inspections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for service role" ON inspections
  FOR UPDATE USING (true);

-- Grant permissions
GRANT ALL ON inspections TO postgres;
GRANT ALL ON inspections TO anon;
GRANT ALL ON inspections TO authenticated;
GRANT ALL ON inspections TO service_role;



