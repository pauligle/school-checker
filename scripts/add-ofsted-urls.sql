-- Add Ofsted Report URL fields
ALTER TABLE schools ADD COLUMN IF NOT EXISTS ofsted_report_url TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS ofsted_report_alternative_url TEXT;

-- Update Ofsted report URLs for schools with Ofsted ratings
UPDATE schools 
SET 
    ofsted_report_url = CASE 
        WHEN ofsted_rating_name IS NOT NULL AND ofsted_rating_name != '' 
        THEN 'https://reports.ofsted.gov.uk/inspection-reports/find-inspection-report/provider/EDU/' || urn
        ELSE NULL
    END,
    ofsted_report_alternative_url = CASE 
        WHEN ofsted_rating_name IS NOT NULL AND ofsted_rating_name != '' 
        THEN 'https://reports.ofsted.gov.uk/provider/21/' || urn
        ELSE NULL
    END
WHERE ofsted_rating_name IS NOT NULL AND ofsted_rating_name != '';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schools_ofsted_url ON schools(ofsted_report_url);
CREATE INDEX IF NOT EXISTS idx_schools_ofsted_alt_url ON schools(ofsted_report_alternative_url);

-- Update database stats
INSERT INTO database_stats (table_name, schools_count, last_updated)
VALUES ('schools', (SELECT COUNT(*) FROM schools), NOW())
ON CONFLICT (table_name) 
DO UPDATE SET 
  schools_count = EXCLUDED.schools_count,
  last_updated = EXCLUDED.last_updated;

