-- Add unique constraints for upsert operations

-- For primary_results table - allow multiple years per URN
ALTER TABLE primary_results DROP CONSTRAINT IF EXISTS primary_results_urn_key;
ALTER TABLE primary_results ADD CONSTRAINT primary_results_urn_data_year_unique UNIQUE (urn, data_year);

-- For la_averages table - allow multiple years per LA
ALTER TABLE la_averages ADD CONSTRAINT la_averages_lea_code_data_year_unique UNIQUE (lea_code, data_year);

-- For england_averages table - one record per year
ALTER TABLE england_averages ADD CONSTRAINT england_averages_data_year_unique UNIQUE (data_year);

