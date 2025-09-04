-- School Checker Database Schema
-- This file contains all the SQL commands to set up the database tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schools table - Main school information
CREATE TABLE IF NOT EXISTS schools (
    urn TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    lat DECIMAL(10,8),
    lon DECIMAL(11,8),
    school_type TEXT,
    phase TEXT,
    local_authority TEXT,
    total_pupils INTEGER,
    gender TEXT,
    age_range TEXT,
    capacity INTEGER,
    address TEXT,
    postcode TEXT,
    phone TEXT,
    website TEXT,
    headteacher TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspections table - Ofsted inspection results
CREATE TABLE IF NOT EXISTS inspections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    urn TEXT NOT NULL,
    inspection_date DATE NOT NULL,
    overall_rating TEXT,
    previous_rating TEXT,
    quality_of_education TEXT,
    behaviour_attitudes TEXT,
    personal_development TEXT,
    leadership_management TEXT,
    inspection_type TEXT,
    inspector_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(urn, inspection_date)
);

-- Performance table - School performance data
CREATE TABLE IF NOT EXISTS performance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    urn TEXT NOT NULL,
    school_name TEXT,
    progress_score DECIMAL(5,2),
    attainment_score DECIMAL(5,2),
    disadvantaged_progress DECIMAL(5,2),
    disadvantaged_attainment DECIMAL(5,2),
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(urn, year)
);

-- Database statistics table - Track data counts
CREATE TABLE IF NOT EXISTS database_stats (
    table_name TEXT PRIMARY KEY,
    schools_count INTEGER DEFAULT 0,
    inspections_count INTEGER DEFAULT 0,
    performance_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pipeline logs table - Track data pipeline runs
CREATE TABLE IF NOT EXISTS pipeline_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pipeline_type TEXT NOT NULL, -- 'fetch', 'process', 'import'
    data_source TEXT NOT NULL, -- 'schools', 'ofsted', 'performance', 'all'
    status TEXT NOT NULL, -- 'success', 'failed', 'partial'
    records_processed INTEGER DEFAULT 0,
    records_imported INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    error_details JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schools_location ON schools(lat, lon);
CREATE INDEX IF NOT EXISTS idx_schools_authority ON schools(local_authority);
CREATE INDEX IF NOT EXISTS idx_schools_type ON schools(school_type);
CREATE INDEX IF NOT EXISTS idx_schools_phase ON schools(phase);

CREATE INDEX IF NOT EXISTS idx_inspections_urn ON inspections(urn);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_inspections_rating ON inspections(overall_rating);

CREATE INDEX IF NOT EXISTS idx_performance_urn ON performance(urn);
CREATE INDEX IF NOT EXISTS idx_performance_year ON performance(year);

CREATE INDEX IF NOT EXISTS idx_pipeline_logs_type ON pipeline_logs(pipeline_type);
CREATE INDEX IF NOT EXISTS idx_pipeline_logs_source ON pipeline_logs(data_source);
CREATE INDEX IF NOT EXISTS idx_pipeline_logs_date ON pipeline_logs(started_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at columns
CREATE TRIGGER update_schools_updated_at 
    BEFORE UPDATE ON schools 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at 
    BEFORE UPDATE ON inspections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_updated_at 
    BEFORE UPDATE ON performance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial database stats record
INSERT INTO database_stats (table_name, schools_count, inspections_count, performance_count)
VALUES ('database_stats', 0, 0, 0)
ON CONFLICT (table_name) DO NOTHING;

-- Create views for common queries
CREATE OR REPLACE VIEW schools_with_latest_inspection AS
SELECT 
    s.*,
    i.inspection_date as latest_inspection_date,
    i.overall_rating as latest_rating,
    i.previous_rating as previous_rating
FROM schools s
LEFT JOIN LATERAL (
    SELECT inspection_date, overall_rating, previous_rating
    FROM inspections 
    WHERE urn = s.urn 
    ORDER BY inspection_date DESC 
    LIMIT 1
) i ON true;

CREATE OR REPLACE VIEW schools_with_performance AS
SELECT 
    s.*,
    p.progress_score,
    p.attainment_score,
    p.year as performance_year
FROM schools s
LEFT JOIN LATERAL (
    SELECT progress_score, attainment_score, year
    FROM performance 
    WHERE urn = s.urn 
    ORDER BY year DESC 
    LIMIT 1
) p ON true;

-- Row Level Security (RLS) policies
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to schools, inspections, and performance
CREATE POLICY "Allow public read access to schools" ON schools
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to inspections" ON inspections
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to performance" ON performance
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to database_stats" ON database_stats
    FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to schools" ON schools
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to inspections" ON inspections
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to performance" ON performance
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to database_stats" ON database_stats
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to pipeline_logs" ON pipeline_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE schools IS 'Main school information from Get Information about Schools (GIAS)';
COMMENT ON TABLE inspections IS 'Ofsted inspection results and ratings';
COMMENT ON TABLE performance IS 'School performance data from performance tables';
COMMENT ON TABLE database_stats IS 'Statistics about data counts in each table';
COMMENT ON TABLE pipeline_logs IS 'Logs of data pipeline execution runs';

COMMENT ON COLUMN schools.urn IS 'Unique Reference Number - primary identifier for schools';
COMMENT ON COLUMN schools.lat IS 'Latitude coordinate for map display';
COMMENT ON COLUMN schools.lon IS 'Longitude coordinate for map display';
COMMENT ON COLUMN inspections.overall_rating IS 'Overall Ofsted rating (Outstanding, Good, Requires Improvement, Inadequate)';
COMMENT ON COLUMN performance.progress_score IS 'Progress score from performance tables';
