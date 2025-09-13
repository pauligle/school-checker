-- Add performance indexes to prevent query timeouts
-- Run this in Supabase SQL Editor

-- Index for lat/lon queries (most important for map performance)
CREATE INDEX IF NOT EXISTS idx_schools_lat_lon ON schools (lat, lon);

-- Index for URN lookups
CREATE INDEX IF NOT EXISTS idx_schools_urn ON schools (urn);

-- Index for establishment name searches
CREATE INDEX IF NOT EXISTS idx_schools_establishmentname ON schools (establishmentname);

-- Index for inspections table URN lookups
CREATE INDEX IF NOT EXISTS idx_inspections_urn ON inspections (urn);

-- Index for inspection dates
CREATE INDEX IF NOT EXISTS idx_inspections_inspection_date ON inspections (inspection_date);

-- Composite index for map bounds queries (lat, lon, establishmentname)
CREATE INDEX IF NOT EXISTS idx_schools_map_query ON schools (lat, lon, establishmentname) 
WHERE lat IS NOT NULL AND lon IS NOT NULL;

-- Index for schools with valid coordinates only
CREATE INDEX IF NOT EXISTS idx_schools_valid_coords ON schools (lat, lon) 
WHERE lat IS NOT NULL AND lon IS NOT NULL AND lat != 0 AND lon != 0;

-- Show index usage statistics
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
ORDER BY idx_scan DESC;



