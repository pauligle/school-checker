-- Create Local Authority averages table
CREATE TABLE IF NOT EXISTS la_averages (
  id SERIAL PRIMARY KEY,
  lea_code INTEGER UNIQUE NOT NULL,
  lea_name TEXT,
  
  -- Key performance metrics
  rwm_expected_percentage DECIMAL(5,2),
  rwm_higher_percentage DECIMAL(5,2),
  reading_average_score DECIMAL(5,2),
  maths_average_score DECIMAL(5,2),
  gps_expected_percentage DECIMAL(5,2),
  gps_higher_percentage DECIMAL(5,2),
  
  data_year INTEGER DEFAULT 2024,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create England national averages table
CREATE TABLE IF NOT EXISTS england_averages (
  id SERIAL PRIMARY KEY,
  data_year INTEGER UNIQUE NOT NULL,
  
  -- Key performance metrics
  rwm_expected_percentage DECIMAL(5,2),
  rwm_higher_percentage DECIMAL(5,2),
  reading_average_score DECIMAL(5,2),
  maths_average_score DECIMAL(5,2),
  gps_expected_percentage DECIMAL(5,2),
  gps_higher_percentage DECIMAL(5,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_la_averages_lea_code ON la_averages(lea_code);
CREATE INDEX IF NOT EXISTS idx_la_averages_data_year ON la_averages(data_year);
CREATE INDEX IF NOT EXISTS idx_england_averages_data_year ON england_averages(data_year);

-- Add comments
COMMENT ON TABLE la_averages IS 'Local Authority averages for Key Stage 2 results';
COMMENT ON TABLE england_averages IS 'England national averages for Key Stage 2 results';


