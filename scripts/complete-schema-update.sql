-- Complete Schema Update for All DfE Fields
-- This script adds all 139 fields from the DfE dataset to the schools table

-- =====================================================
-- BASIC SCHOOL INFORMATION
-- =====================================================
ALTER TABLE schools ADD COLUMN IF NOT EXISTS establishment_number TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS establishment_type_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS establishment_type_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS establishment_type_group_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS establishment_type_group_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS establishment_status_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS establishment_status_name TEXT;

-- =====================================================
-- OPENING/CLOSING INFORMATION
-- =====================================================
ALTER TABLE schools ADD COLUMN IF NOT EXISTS reason_establishment_opened_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS reason_establishment_opened_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS open_date DATE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS reason_establishment_closed_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS reason_establishment_closed_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS close_date DATE;

-- =====================================================
-- EDUCATIONAL PHASE & AGE RANGE
-- =====================================================
ALTER TABLE schools ADD COLUMN IF NOT EXISTS phase_of_education_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS phase_of_education_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS statutory_low_age INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS statutory_high_age INTEGER;

-- =====================================================
-- SCHOOL FEATURES
-- =====================================================
ALTER TABLE schools ADD COLUMN IF NOT EXISTS boarders_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS boarders_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS nursery_provision_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS official_sixth_form_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS official_sixth_form_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS gender_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS gender_name TEXT;

-- =====================================================
-- RELIGIOUS CHARACTER
-- =====================================================
ALTER TABLE schools ADD COLUMN IF NOT EXISTS religious_character_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS religious_character_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS religious_ethos_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS diocese_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS diocese_name TEXT;

-- =====================================================
-- ADMISSIONS & CAPACITY
-- =====================================================
ALTER TABLE schools ADD COLUMN IF NOT EXISTS admissions_policy_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS admissions_policy_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS school_capacity INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS special_classes_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS special_classes_name TEXT;

-- =====================================================
-- PUPIL DATA
-- =====================================================
ALTER TABLE schools ADD COLUMN IF NOT EXISTS census_date DATE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS number_of_pupils INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS percentage_fsm DECIMAL(5,2);
ALTER TABLE schools ADD COLUMN IF NOT EXISTS fsm INTEGER;

-- =====================================================
-- TRUST & FEDERATION INFORMATION
-- =====================================================
ALTER TABLE schools ADD COLUMN IF NOT EXISTS trust_school_flag_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS trust_school_flag_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS trusts_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS trusts_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS school_sponsor_flag_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS school_sponsors_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS federation_flag_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS federations_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS federations_name TEXT;

-- =====================================================
-- SPECIAL EDUCATIONAL NEEDS (SEN)
-- =====================================================
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen1_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen2_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen3_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen4_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen5_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen6_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen7_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen8_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen9_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen10_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen11_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen12_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen13_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS type_of_resourced_provision_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS resourced_provision_on_roll INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS resourced_provision_capacity INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen_unit_on_roll INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen_unit_capacity INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS senpru_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen_stat INTEGER;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS sen_no_stat INTEGER;

-- =====================================================
-- GEOGRAPHIC & ADMINISTRATIVE
-- =====================================================
ALTER TABLE schools ADD COLUMN IF NOT EXISTS gor_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS gor_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS district_administrative_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS district_administrative_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS administrative_ward_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS administrative_ward_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS parliamentary_constituency_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS parliamentary_constituency_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS urban_rural_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS urban_rural_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS gssla_code_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS msoa_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS lsoa_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS msoa_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS lsoa_code TEXT;

-- =====================================================
-- OFSTED & INSPECTION
-- =====================================================
ALTER TABLE schools ADD COLUMN IF NOT EXISTS inspectorate_name_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS ofsted_rating_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS ofsted_last_insp DATE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS ofsted_special_measures_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS ofsted_special_measures_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS date_of_last_inspection_visit DATE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS next_inspection_visit DATE;

-- =====================================================
-- ADDITIONAL INFORMATION
-- =====================================================
ALTER TABLE schools ADD COLUMN IF NOT EXISTS boarding_establishment_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS props_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS previous_la_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS previous_la_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS previous_establishment_number TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS country_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS uprn TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS site_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS qab_name_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS qab_name_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS establishment_accredited_code TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS establishment_accredited_name TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS qab_report TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS ch_number TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS accreditation_expiry_date DATE;

-- =====================================================
-- TIMESTAMPS & METADATA
-- =====================================================
ALTER TABLE schools ADD COLUMN IF NOT EXISTS last_changed_date DATE;

-- =====================================================
-- CREATE INDEXES FOR FREQUENTLY QUERIED FIELDS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_schools_ofsted_rating ON schools(ofsted_rating_name);
CREATE INDEX IF NOT EXISTS idx_schools_religious_character ON schools(religious_character_name);
CREATE INDEX IF NOT EXISTS idx_schools_trust_flag ON schools(trust_school_flag_name);
CREATE INDEX IF NOT EXISTS idx_schools_federation_flag ON schools(federation_flag_name);
CREATE INDEX IF NOT EXISTS idx_schools_phase_of_education ON schools(phase_of_education_name);
CREATE INDEX IF NOT EXISTS idx_schools_gender ON schools(gender_name);
CREATE INDEX IF NOT EXISTS idx_schools_urban_rural ON schools(urban_rural_name);
CREATE INDEX IF NOT EXISTS idx_schools_parliamentary_constituency ON schools(parliamentary_constituency_name);
CREATE INDEX IF NOT EXISTS idx_schools_gor ON schools(gor_name);
CREATE INDEX IF NOT EXISTS idx_schools_percentage_fsm ON schools(percentage_fsm);
CREATE INDEX IF NOT EXISTS idx_schools_open_date ON schools(open_date);
CREATE INDEX IF NOT EXISTS idx_schools_census_date ON schools(census_date);

-- =====================================================
-- UPDATE DATABASE STATISTICS
-- =====================================================
INSERT INTO database_stats (table_name, schools_count, last_updated)
VALUES ('schools', (SELECT COUNT(*) FROM schools), NOW())
ON CONFLICT (table_name) 
DO UPDATE SET 
  schools_count = EXCLUDED.schools_count,
  last_updated = EXCLUDED.last_updated;

-- =====================================================
-- LOG THE SCHEMA UPDATE
-- =====================================================
INSERT INTO pipeline_logs (pipeline_type, data_source, status, records_processed, records_imported, error_details)
VALUES (
  'schema_update', 
  'schools', 
  'completed', 
  (SELECT COUNT(*) FROM schools), 
  (SELECT COUNT(*) FROM schools), 
  '{"message": "Added all 139 DfE fields to schools table"}'
);
