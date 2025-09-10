-- Add coordinate columns to schools table
ALTER TABLE schools ADD COLUMN IF NOT EXISTS easting DECIMAL(10,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS northing DECIMAL(10,2);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schools_easting ON schools(easting);
CREATE INDEX IF NOT EXISTS idx_schools_northing ON schools(northing);
CREATE INDEX IF NOT EXISTS idx_schools_lat_lon ON schools(lat, lon);

-- Update database stats
INSERT INTO database_stats (table_name, schools_count, last_updated)
VALUES ('schools', (SELECT COUNT(*) FROM schools), NOW())
ON CONFLICT (table_name)
DO UPDATE SET
  schools_count = EXCLUDED.schools_count,
  last_updated = EXCLUDED.last_updated;

