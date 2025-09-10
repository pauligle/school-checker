-- Fix Coordinates Issue - Run this in Supabase SQL Editor
-- This script adds the missing easting/northing columns and updates the data

-- Step 1: Add the missing coordinate columns
ALTER TABLE schools ADD COLUMN IF NOT EXISTS easting DECIMAL(10,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS northing DECIMAL(10,2);

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schools_easting ON schools(easting);
CREATE INDEX IF NOT EXISTS idx_schools_northing ON schools(northing);
CREATE INDEX IF NOT EXISTS idx_schools_lat_lon ON schools(lat, lon);

-- Step 3: Check if we have any schools with coordinates
SELECT 
  COUNT(*) as total_schools,
  COUNT(lat) as schools_with_lat,
  COUNT(lon) as schools_with_lon,
  COUNT(easting) as schools_with_easting,
  COUNT(northing) as schools_with_northing
FROM schools;

-- Step 4: Show sample data to verify
SELECT 
  urn,
  name,
  lat,
  lon,
  easting,
  northing
FROM schools 
WHERE lat IS NOT NULL AND lon IS NOT NULL
LIMIT 5;

