-- Fresh CSV Schema - Generated from edubasealldata20250905.csv
-- This schema matches the CSV fields exactly for perfect 1:1 mapping

-- Drop existing schools table if it exists
DROP TABLE IF EXISTS schools CASCADE;

-- Create new schools table with CSV field names
CREATE TABLE schools (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  urn TEXT UNIQUE,
  la__code_ TEXT,
  la__name_ TEXT,
  establishmentnumber TEXT,
  establishmentname TEXT,
  typeofestablishment__code_ TEXT,
  typeofestablishment__name_ TEXT,
  establishmenttypegroup__code_ TEXT,
  establishmenttypegroup__name_ TEXT,
  establishmentstatus__code_ TEXT,
  establishmentstatus__name_ TEXT,
  reasonestablishmentopened__code_ TEXT,
  reasonestablishmentopened__name_ TEXT,
  opendate TEXT,
  reasonestablishmentclosed__code_ TEXT,
  reasonestablishmentclosed__name_ TEXT,
  closedate TEXT,
  phaseofeducation__code_ TEXT,
  phaseofeducation__name_ TEXT,
  statutorylowage TEXT,
  statutoryhighage TEXT,
  boarders__code_ TEXT,
  boarders__name_ TEXT,
  nurseryprovision__name_ TEXT,
  officialsixthform__code_ TEXT,
  officialsixthform__name_ TEXT,
  gender__code_ TEXT,
  gender__name_ TEXT,
  religiouscharacter__code_ TEXT,
  religiouscharacter__name_ TEXT,
  religiousethos__name_ TEXT,
  diocese__code_ TEXT,
  diocese__name_ TEXT,
  admissionspolicy__code_ TEXT,
  admissionspolicy__name_ TEXT,
  schoolcapacity TEXT,
  specialclasses__code_ TEXT,
  specialclasses__name_ TEXT,
  censusdate TEXT,
  numberofpupils TEXT,
  numberofboys TEXT,
  numberofgirls TEXT,
  percentagefsm TEXT,
  trustschoolflag__code_ TEXT,
  trustschoolflag__name_ TEXT,
  trusts__code_ TEXT,
  trusts__name_ TEXT,
  schoolsponsorflag__name_ TEXT,
  schoolsponsors__name_ TEXT,
  federationflag__name_ TEXT,
  federations__code_ TEXT,
  federations__name_ TEXT,
  ukprn TEXT,
  feheidentifier TEXT,
  furthereducationtype__name_ TEXT,
  lastchangeddate TEXT,
  street TEXT,
  locality TEXT,
  address3 TEXT,
  town TEXT,
  county__name_ TEXT,
  postcode TEXT,
  schoolwebsite TEXT,
  telephonenum TEXT,
  headtitle__name_ TEXT,
  headfirstname TEXT,
  headlastname TEXT,
  headpreferredjobtitle TEXT,
  bsoinspectoratename__name_ TEXT,
  inspectoratereport TEXT,
  dateoflastinspectionvisit TEXT,
  nextinspectionvisit TEXT,
  teenmoth__name_ TEXT,
  teenmothplaces TEXT,
  ccf__name_ TEXT,
  senpru__name_ TEXT,
  ebd__name_ TEXT,
  placespru TEXT,
  ftprov__name_ TEXT,
  edbyother__name_ TEXT,
  section41approved__name_ TEXT,
  sen1__name_ TEXT,
  sen2__name_ TEXT,
  sen3__name_ TEXT,
  sen4__name_ TEXT,
  sen5__name_ TEXT,
  sen6__name_ TEXT,
  sen7__name_ TEXT,
  sen8__name_ TEXT,
  sen9__name_ TEXT,
  sen10__name_ TEXT,
  sen11__name_ TEXT,
  sen12__name_ TEXT,
  sen13__name_ TEXT,
  typeofresourcedprovision__name_ TEXT,
  resourcedprovisiononroll TEXT,
  resourcedprovisioncapacity TEXT,
  senunitonroll TEXT,
  senunitcapacity TEXT,
  gor__code_ TEXT,
  gor__name_ TEXT,
  districtadministrative__code_ TEXT,
  districtadministrative__name_ TEXT,
  administrativeward__code_ TEXT,
  administrativeward__name_ TEXT,
  parliamentaryconstituency__code_ TEXT,
  parliamentaryconstituency__name_ TEXT,
  urbanrural__code_ TEXT,
  urbanrural__name_ TEXT,
  gsslacode__name_ TEXT,
  easting TEXT,
  northing TEXT,
  lat DECIMAL(10, 8),
  lon DECIMAL(11, 8),
  msoa__name_ TEXT,
  lsoa__name_ TEXT,
  inspectoratename__name_ TEXT,
  senstat TEXT,
  sennostat TEXT,
  boardingestablishment__name_ TEXT,
  propsname TEXT,
  previousla__code_ TEXT,
  previousla__name_ TEXT,
  previousestablishmentnumber TEXT,
  country__name_ TEXT,
  uprn TEXT,
  sitename TEXT,
  qabname__code_ TEXT,
  qabname__name_ TEXT,
  establishmentaccredited__code_ TEXT,
  establishmentaccredited__name_ TEXT,
  qabreport TEXT,
  chnumber TEXT,
  msoa__code_ TEXT,
  lsoa__code_ TEXT,
  fsm TEXT,
  accreditationexpirydate TEXT,
  -- Metadata fields
  import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_source TEXT DEFAULT 'edubasealldata20250905.csv'
);

-- Add indexes for common queries
CREATE INDEX idx_schools_urn ON schools(urn);
CREATE INDEX idx_schools_establishmentname ON schools(establishmentname);
CREATE INDEX idx_schools_la__name_ ON schools(la__name_);
CREATE INDEX idx_schools_typeofestablishment__name_ ON schools(typeofestablishment__name_);
CREATE INDEX idx_schools_phaseofeducation__name_ ON schools(phaseofeducation__name_);
CREATE INDEX idx_schools_gender__name_ ON schools(gender__name_);

-- Add RLS policies
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON schools
  FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access" ON schools
  FOR ALL USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_schools_updated_at 
  BEFORE UPDATE ON schools 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON schools TO postgres;
GRANT ALL ON schools TO anon;
GRANT ALL ON schools TO authenticated;
GRANT ALL ON schools TO service_role;

-- Create view for easy access to key fields
CREATE VIEW schools_summary AS
SELECT 
  id,
  urn,
  establishmentname as name,
  la__name_ as local_authority,
  typeofestablishment__name_ as school_type,
  phaseofeducation__name_ as phase,
  gender__name_ as gender,
  statutorylowage,
  statutoryhighage,
  numberofpupils,
  numberofboys,
  numberofgirls,
  schoolcapacity,
  percentagefsm,
  headtitle__name_ as headteacher_title,
  headfirstname as headteacher_first_name,
  headlastname as headteacher_last_name,
  headpreferredjobtitle as headteacher_preferred_title,
  street,
  town,
  postcode,
  schoolwebsite as website,
  telephonenum as telephone,
  created_at,
  updated_at
FROM schools;

-- Grant access to view
GRANT SELECT ON schools_summary TO anon;
GRANT SELECT ON schools_summary TO authenticated;
GRANT ALL ON schools_summary TO service_role;

COMMENT ON TABLE schools IS 'Schools data imported from edubasealldata20250905.csv with exact field mapping';
COMMENT ON VIEW schools_summary IS 'Simplified view of schools data with clean field names for frontend use';
