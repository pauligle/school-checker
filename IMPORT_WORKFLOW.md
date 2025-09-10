# 🏫 School Data Import Workflow

## 📋 **Simple 2-Step Process**

### Step 1: Download CSV Files
1. **School Data**: Go to https://get-information-schools.service.gov.uk/Downloads
   - Download the latest CSV file (e.g., `edubasealldata20250905.csv`)
2. **Inspection Data**: Go to https://www.gov.uk/government/statistical-data-sets/schools-inspections
   - Download the latest inspection data (e.g., `Management_information_-_state-funded_schools_-_latest_inspections_as_at_31_July_2025.csv`)
3. Place both files in: `data/raw/`

### Step 2: Run Import
```bash
node scripts/import-schools.js
```

**That's it!** The system will automatically:
- ✅ Detect file types (school data vs inspection data)
- ✅ Pre-process school CSV (convert coordinates, clean fields)
- ✅ Import all schools to Supabase
- ✅ Import inspection data to Supabase
- ✅ Update schools with Ofsted ratings
- ✅ Create timestamped backups
- ✅ Clean up temporary files

## 📁 **Folder Structure**
```
data/
├── raw/           # Put your downloaded CSV files here
├── processed/     # Cleaned CSV files (auto-generated)
└── backup/        # Timestamped backups (auto-generated)
```

## 🔧 **What Happens Automatically**

1. **File Detection**: 
   - Automatically detects school data vs inspection data
   - Processes each file type appropriately

2. **School Data Pre-processing**: 
   - Converts Easting/Northing coordinates to lat/lon
   - Cleans field names (removes spaces, special characters)
   - Handles data validation

3. **Inspection Data Processing**: 
   - Imports Ofsted ratings (Outstanding, Good, Requires improvement, Inadequate)
   - Links inspection data to schools by URN
   - Updates schools table with ratings

4. **Import**: 
   - Uses robust importer with 100% success rate
   - Handles duplicates with upsert
   - Processes in batches for efficiency

5. **Backup**: 
   - Creates timestamped backup of original files
   - Stores in `data/backup/` folder

6. **Cleanup**: 
   - Removes original files from `data/raw/`
   - Keeps processed files for reference

## 🚀 **Available Commands**

```bash
# Main import command (recommended)
node scripts/import-schools.js

# Direct workflow command
node scripts/auto-import-workflow.js

# Manual CSV processing only
node scripts/csv-processor.js data/raw/yourfile.csv data/processed/schools-clean.csv

# Manual Supabase import only
node scripts/robust-importer.js data/processed/schools-clean.csv

# Check database status
node scripts/check-db.js
```

## 📊 **Expected Results**

- **Total Schools**: ~52,000 schools
- **Fields**: 142 fields (all CSV data)
- **Success Rate**: 100% with robust importer
- **Processing Time**: ~5-10 minutes for full dataset

## 🔍 **Troubleshooting**

### No CSV files found
- Make sure you downloaded the CSV from the government website
- Place it in `data/raw/` folder
- Check the filename ends with `.csv`

### Import errors
- Check your `.env.local` file has correct Supabase credentials
- Ensure Supabase database is accessible
- Run `node scripts/check-db.js` to verify connection

### Coordinate issues
- The system automatically converts British National Grid to lat/lon
- Schools without coordinates will have `null` values
- This is normal for some schools

## 📈 **Monitoring Progress**

The import process shows real-time progress:
```
📦 Processing batch 1/53 (1000 schools)
✅ Batch 1 imported successfully
📈 Progress: 1000/52015 (2%)
```

## 🎯 **Next Steps After Import**

1. **Fix Frontend**: Update field names in components
2. **Test App**: Verify schools display correctly
3. **Deploy**: Push changes to production

---

**Need Help?** Run `node scripts/check-db.js` to verify your database status!
