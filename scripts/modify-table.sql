-- Option 2: Modify table to allow NULL URNs (NOT RECOMMENDED)
-- This will allow the import to work but may cause issues with your application

-- First, drop the NOT NULL constraint on urn column
ALTER TABLE schools ALTER COLUMN urn DROP NOT NULL;

-- If you have a unique constraint on urn, you might need to drop that too
-- ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_urn_key;

-- Note: This is not recommended because:
-- 1. Your application expects URN to be unique identifier
-- 2. You'll need to handle NULL URNs in your code
-- 3. It may cause issues with foreign key relationships

-- Better approach: Clean your CSV data first using the clean-csv.js script
