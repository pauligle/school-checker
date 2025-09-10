-- Add spatial index for better geographic query performance
-- This will significantly improve the performance of bounding box queries

-- First, ensure PostGIS extension is available (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add a spatial column using PostGIS geometry
ALTER TABLE schools ADD COLUMN IF NOT EXISTS geom GEOMETRY(POINT, 4326);

-- Update the geometry column with lat/lon data
UPDATE schools 
SET geom = ST_SetSRID(ST_MakePoint(lon, lat), 4326)
WHERE lat IS NOT NULL AND lon IS NOT NULL;

-- Create spatial index for fast geographic queries
CREATE INDEX IF NOT EXISTS idx_schools_geom ON schools USING GIST (geom);

-- Create a function to get schools in bounding box using spatial index
CREATE OR REPLACE FUNCTION get_schools_in_bounds_spatial(
    min_lat DECIMAL(10,8),
    max_lat DECIMAL(10,8),
    min_lon DECIMAL(11,8),
    max_lon DECIMAL(11,8),
    limit_count INTEGER DEFAULT 100
)
RETURNS TABLE(
    urn TEXT,
    name TEXT,
    lat DECIMAL(10,8),
    lon DECIMAL(11,8)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.urn,
        s.name,
        s.lat,
        s.lon
    FROM schools s
    WHERE 
        s.geom && ST_MakeEnvelope(min_lon, min_lat, max_lon, max_lat, 4326)
        AND s.lat IS NOT NULL 
        AND s.lon IS NOT NULL
    ORDER BY s.urn
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create a more efficient bounding box query function
CREATE OR REPLACE FUNCTION get_schools_in_bounds_optimized(
    min_lat DECIMAL(10,8),
    max_lat DECIMAL(10,8),
    min_lon DECIMAL(11,8),
    max_lon DECIMAL(11,8),
    limit_count INTEGER DEFAULT 100
)
RETURNS TABLE(
    urn TEXT,
    name TEXT,
    lat DECIMAL(10,8),
    lon DECIMAL(11,8)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.urn,
        s.name,
        s.lat,
        s.lon
    FROM schools s
    WHERE 
        s.lat BETWEEN min_lat AND max_lat
        AND s.lon BETWEEN min_lon AND max_lon
        AND s.lat IS NOT NULL 
        AND s.lon IS NOT NULL
    ORDER BY s.urn
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON FUNCTION get_schools_in_bounds_spatial IS 'Get schools in bounding box using PostGIS spatial index for optimal performance';
COMMENT ON FUNCTION get_schools_in_bounds_optimized IS 'Get schools in bounding box using optimized lat/lon range queries';