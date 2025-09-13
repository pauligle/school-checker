-- Create postcodes table
CREATE TABLE IF NOT EXISTS postcodes (
  id SERIAL PRIMARY KEY,
  postcode VARCHAR(10) UNIQUE NOT NULL,
  ward_name VARCHAR(255),
  local_authority VARCHAR(255),
  county VARCHAR(255),
  region VARCHAR(255),
  country VARCHAR(50) DEFAULT 'England',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create cities table (derived from postcodes)
CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  city_name VARCHAR(255) UNIQUE NOT NULL,
  local_authority VARCHAR(255),
  county VARCHAR(255),
  region VARCHAR(255),
  postcode_count INTEGER DEFAULT 0,
  school_count INTEGER DEFAULT 0,
  primary_school_count INTEGER DEFAULT 0,
  secondary_school_count INTEGER DEFAULT 0,
  slug VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_postcodes_postcode ON postcodes(postcode);
CREATE INDEX IF NOT EXISTS idx_postcodes_local_authority ON postcodes(local_authority);
CREATE INDEX IF NOT EXISTS idx_postcodes_county ON postcodes(county);
CREATE INDEX IF NOT EXISTS idx_cities_city_name ON cities(city_name);
CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_school_count ON cities(school_count);

-- Create a view for easy querying of schools by city
CREATE OR REPLACE VIEW schools_by_city AS
SELECT 
  c.city_name,
  c.county,
  c.region,
  c.school_count,
  c.primary_school_count,
  c.secondary_school_count,
  s.establishmentname,
  s.urn,
  s.postcode,
  s.phaseofeducation__name_,
  s.typeofestablishment__name_
FROM cities c
JOIN postcodes p ON c.local_authority = p.local_authority
JOIN schools s ON s.postcode = p.postcode
WHERE s.postcode IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE postcodes IS 'UK postcode directory with ward, local authority, county, and region mappings';
COMMENT ON TABLE cities IS 'Cities/towns derived from postcodes with school counts and metadata';
COMMENT ON VIEW schools_by_city IS 'View joining schools with their cities for easy querying';
