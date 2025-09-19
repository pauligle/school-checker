#!/usr/bin/env node

/**
 * Import Ofsted Parent View Data from Excel files
 * 
 * This script processes Excel files from the ofsted-parentview-data folder
 * and imports them into the parent_view_data table in Supabase.
 * 
 * This handles the newer Excel format with "School Level Data" sheets.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Install required Python packages if not available
async function ensurePythonPackages() {
  const { spawn } = require('child_process');
  
  return new Promise((resolve, reject) => {
    console.log('📦 Ensuring Python packages are installed...');
    const pip = spawn('pip3', ['install', 'pandas', 'openpyxl'], { stdio: 'inherit' });
    
    pip.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Python packages ready');
        resolve();
      } else {
        reject(new Error(`Failed to install Python packages (exit code ${code})`));
      }
    });
  });
}

// Helper function to parse percentage string to integer
function parsePercentage(percentStr) {
  if (!percentStr || percentStr === '' || percentStr === 'null' || percentStr === null || percentStr === undefined) return 0;
  const cleaned = percentStr.toString().replace('%', '').trim();
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper function to parse date from filename
function parseDateFromFilename(filename) {
  // Extract date patterns like "7_April_2025" or "6_January_2025"
  const dateMatch = filename.match(/(\d+)_([A-Za-z]+)_(\d{4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    const monthMap = {
      'January': '01', 'Jan': '01',
      'February': '02', 'Feb': '02',
      'March': '03', 'Mar': '03',
      'April': '04', 'Apr': '04',
      'May': '05',
      'June': '06', 'Jun': '06',
      'July': '07', 'Jul': '07',
      'August': '08', 'Aug': '08',
      'September': '09', 'Sep': '09',
      'October': '10', 'Oct': '10',
      'November': '11', 'Nov': '11',
      'December': '12', 'Dec': '12'
    };
    const monthNum = monthMap[month] || '01';
    return `${year}-${monthNum}-${day.padStart(2, '0')}`;
  }
  return '2024-01-01'; // Default date
}

// Process Excel file using Python pandas
async function processExcelFile(filePath) {
  const { spawn } = require('child_process');
  const filename = path.basename(filePath);
  const dataDate = parseDateFromFilename(filename);
  
  console.log(`📁 Processing: ${filename}`);
  console.log(`📅 Data date: ${dataDate}`);
  
  return new Promise((resolve, reject) => {
    const pythonScript = `
import pandas as pd
import json
import sys

try:
    # Read the Excel file
    file_path = "${filePath.replace(/\\/g, '\\\\')}"
    
    # Read the School Level Data sheet with skiprows=1 to handle the title row
    df = pd.read_excel(file_path, sheet_name='School Level Data', skiprows=1)
    
    print(f"📊 Found {len(df)} schools in Excel file", file=sys.stderr)
    
    # Convert to records and output as JSON
    records = []
    
    for idx, row in df.iterrows():
        try:
            # Only process rows with valid URN and submissions
            if pd.isna(row['URN']) or pd.isna(row.get('Submissions', 0)):
                continue
                
            submissions = 0
            try:
                submissions = int(row.get('Submissions', 0))
            except:
                continue
                
            if submissions == 0:
                continue
            
            record = {
                'urn': str(int(row['URN'])),
                'school_name': str(row.get('School Name', '')),
                'local_authority': str(row.get('Local Authority', '')),
                'ofsted_region': str(row.get('Ofsted Region', '')),
                'ofsted_phase': str(row.get('Ofsted Phase or Type of Education', '')),
                'submissions': submissions,
                'response_rate': str(row.get('Response Rate', '')),
                'data_date': '${dataDate}',
                
                # Q1: My child is happy at this school
                'q1_strongly_agree': ${parsePercentage}(row.get('Q1. My child is happy at this school. Strongly Agree', 0)),
                'q1_agree': ${parsePercentage}(row.get('Q1. My child is happy at this school. Agree', 0)),
                'q1_disagree': ${parsePercentage}(row.get('Q1. My child is happy at this school. Disagree', 0)),
                'q1_strongly_disagree': ${parsePercentage}(row.get('Q1. My child is happy at this school. Strongly Disagree', 0)),
                'q1_dont_know': ${parsePercentage}(row.get('Q1. My child is happy at this school. Don\\'t Know', 0)),
                
                # Q2: My child feels safe at this school
                'q2_strongly_agree': ${parsePercentage}(row.get('Q2. My child feels safe at this school. Strongly Agree', 0)),
                'q2_agree': ${parsePercentage}(row.get('Q2. My child feels safe at this school. Agree', 0)),
                'q2_disagree': ${parsePercentage}(row.get('Q2. My child feels safe at this school. Disagree', 0)),
                'q2_strongly_disagree': ${parsePercentage}(row.get('Q2. My child feels safe at this school. Strongly Disagree', 0)),
                'q2_dont_know': ${parsePercentage}(row.get('Q2. My child feels safe at this school. Don\\'t Know', 0)),
                
                # Q3: The school makes sure its pupils are well behaved
                'q3_strongly_agree': ${parsePercentage}(row.get('Q3. The school makes sure its pupils are well behaved. Strongly Agree', 0)),
                'q3_agree': ${parsePercentage}(row.get('Q3. The school makes sure its pupils are well behaved. Agree', 0)),
                'q3_disagree': ${parsePercentage}(row.get('Q3. The school makes sure its pupils are well behaved. Disagree', 0)),
                'q3_strongly_disagree': ${parsePercentage}(row.get('Q3. The school makes sure its pupils are well behaved. Strongly Disagree', 0)),
                'q3_dont_know': ${parsePercentage}(row.get('Q3. The school makes sure its pupils are well behaved. Don\\'t Know', 0)),
                
                # Q4: Bullying handling
                'q4_strongly_agree': ${parsePercentage}(row.get('Q4. My child has been bullied and the school dealt with the bullying effectively. Strongly Agree', 0)),
                'q4_agree': ${parsePercentage}(row.get('Q4. My child has been bullied and the school dealt with the bullying effectively. Agree', 0)),
                'q4_disagree': ${parsePercentage}(row.get('Q4. My child has been bullied and the school dealt with the bullying effectively. Disagree', 0)),
                'q4_strongly_disagree': ${parsePercentage}(row.get('Q4. My child has been bullied and the school dealt with the bullying effectively. Strongly Disagree', 0)),
                'q4_dont_know': ${parsePercentage}(row.get('Q4. My child has been bullied and the school dealt with the bullying effectively. Don\\'t Know', 0)),
                'q4_not_applicable': ${parsePercentage}(row.get('Q4. My child has been bullied and the school dealt with the bullying effectively. My child has not been bullied', 0)),
                
                # Add other questions following the same pattern...
                # For now, let's focus on the main 4 questions to match Locrating
                
                # Set other questions to 0 for now
                'q5_strongly_agree': 0, 'q5_agree': 0, 'q5_disagree': 0, 'q5_strongly_disagree': 0, 'q5_dont_know': 0,
                'q6_strongly_agree': 0, 'q6_agree': 0, 'q6_disagree': 0, 'q6_strongly_disagree': 0, 'q6_dont_know': 0, 'q6_not_applicable': 0,
                'q8_strongly_agree': 0, 'q8_agree': 0, 'q8_disagree': 0, 'q8_strongly_disagree': 0, 'q8_dont_know': 0,
                'q9_strongly_agree': 0, 'q9_agree': 0, 'q9_disagree': 0, 'q9_strongly_disagree': 0, 'q9_dont_know': 0,
                'q10_strongly_agree': 0, 'q10_agree': 0, 'q10_disagree': 0, 'q10_strongly_disagree': 0, 'q10_dont_know': 0,
                'q11_strongly_agree': 0, 'q11_agree': 0, 'q11_disagree': 0, 'q11_strongly_disagree': 0, 'q11_dont_know': 0,
                'q12_strongly_agree': 0, 'q12_agree': 0, 'q12_disagree': 0, 'q12_strongly_disagree': 0, 'q12_dont_know': 0,
                'q13_strongly_agree': 0, 'q13_agree': 0, 'q13_disagree': 0, 'q13_strongly_disagree': 0, 'q13_dont_know': 0,
                'q14_yes': 0, 'q14_no': 0
            }
            
            records.append(record)
            
        except Exception as e:
            print(f"Error processing row {idx}: {str(e)}", file=sys.stderr)
            continue
    
    print(f"✅ Processed {len(records)} valid records", file=sys.stderr)
    print(json.dumps(records))
    
except Exception as e:
    print(f"Error processing Excel file: {str(e)}", file=sys.stderr)
    sys.exit(1)
`;

    const python = spawn('python3', ['-c', pythonScript], { 
      stdio: ['pipe', 'pipe', 'inherit'],
      maxBuffer: 50 * 1024 * 1024 // 50MB buffer for large datasets
    });
    
    let output = '';
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        try {
          const records = JSON.parse(output);
          resolve(records);
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${error.message}`));
        }
      } else {
        reject(new Error(`Python script failed with exit code ${code}`));
      }
    });
  });
}

async function importExcelData(filePath) {
  try {
    const records = await processExcelFile(filePath);
    
    if (records.length === 0) {
      console.log('⚠️  No valid records to import');
      return 0;
    }
    
    // Import in batches to avoid timeout
    const batchSize = 100;
    let totalInserted = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      console.log(`📥 Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)} (${batch.length} records)`);
      
      const { data, error } = await supabase
        .from('parent_view_data')
        .upsert(batch, { 
          onConflict: 'urn,data_date',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('❌ Error inserting batch:', error);
        throw error;
      }
      
      totalInserted += batch.length;
      console.log(`✅ Inserted batch successfully`);
    }
    
    console.log(`🎉 Successfully imported ${totalInserted} records from ${path.basename(filePath)}`);
    return totalInserted;
    
  } catch (error) {
    console.error(`❌ Failed to import ${path.basename(filePath)}:`, error.message);
    throw error;
  }
}

async function main() {
  try {
    // Ensure Python packages are installed
    await ensurePythonPackages();
    
    const excelDir = path.join(__dirname, '..', 'data', 'raw', 'ofsted-parentview-data');
    
    if (!fs.existsSync(excelDir)) {
      console.error(`❌ Directory not found: ${excelDir}`);
      process.exit(1);
    }
    
    // Get all Excel files, prioritizing the most recent ones
    const excelFiles = fs.readdirSync(excelDir)
      .filter(file => file.endsWith('.xlsx') && file.includes('Parent_View_Management_Information'))
      .sort((a, b) => {
        // Sort by date in filename (most recent first)
        const dateA = parseDateFromFilename(a);
        const dateB = parseDateFromFilename(b);
        return dateB.localeCompare(dateA);
      });
    
    if (excelFiles.length === 0) {
      console.error('❌ No Excel files found in the directory');
      process.exit(1);
    }
    
    console.log(`🔍 Found ${excelFiles.length} Excel files:`);
    excelFiles.forEach((file, index) => {
      const date = parseDateFromFilename(file);
      console.log(`  ${index + 1}. 📄 ${file} (${date})`);
    });
    console.log('');
    
    let totalRecords = 0;
    
    // Process the most recent files first
    for (const excelFile of excelFiles.slice(0, 5)) { // Process top 5 most recent files
      try {
        const filePath = path.join(excelDir, excelFile);
        console.log(`\n🚀 Processing: ${excelFile}`);
        
        const recordCount = await importExcelData(filePath);
        totalRecords += recordCount;
        
      } catch (error) {
        console.error(`❌ Failed to process ${excelFile}:`, error.message);
        // Continue with other files
      }
    }
    
    console.log(`\n🎯 Import complete! Total records imported: ${totalRecords}`);
    
    // Test Harris Academy Chobham
    console.log('\n🔍 Testing Harris Academy Chobham (URN 139703)...');
    const { data: harrisTest, error: harrisError } = await supabase
      .from('parent_view_data')
      .select('*')
      .eq('urn', '139703')
      .order('data_date', { ascending: false })
      .limit(1);
      
    if (harrisError) {
      console.error('❌ Error testing Harris Academy Chobham:', harrisError);
    } else if (harrisTest && harrisTest.length > 0) {
      console.log('✅ Harris Academy Chobham found in database!');
      console.log(`   📊 Submissions: ${harrisTest[0].submissions}`);
      console.log(`   📅 Data date: ${harrisTest[0].data_date}`);
      console.log(`   🏫 School name: ${harrisTest[0].school_name}`);
    } else {
      console.log('❌ Harris Academy Chobham still not found');
    }
    
    // Show some stats
    const { data: stats, error } = await supabase
      .from('parent_view_data')
      .select('data_date, count(*)', { count: 'exact' });
      
    if (!error && stats) {
      console.log('\n📈 Database stats:');
      // Group by date and show counts
      const dateCounts = {};
      for (const row of stats) {
        const date = row.data_date;
        dateCounts[date] = (dateCounts[date] || 0) + 1;
      }
      
      Object.entries(dateCounts)
        .sort(([a], [b]) => b.localeCompare(a))
        .forEach(([date, count]) => {
          console.log(`  📅 ${date}: ${count} schools`);
        });
    }
    
  } catch (error) {
    console.error('❌ Main process failed:', error);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { importExcelData, processExcelFile };
