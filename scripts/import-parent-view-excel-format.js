#!/usr/bin/env node

/**
 * Import Ofsted Parent View Data from converted Excel CSV files
 * 
 * This script processes the CSV files converted from Excel format
 * which have simplified column names like "Q1 Strongly Agree"
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
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

// Helper function to parse percentage/decimal to integer
function parsePercentage(value) {
  if (!value || value === '' || value === 'null' || value === null || value === undefined) return 0;
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return 0;
  
  // If it's a decimal (like 0.147), convert to percentage
  if (numValue <= 1) {
    return Math.round(numValue * 100);
  }
  
  // If it's already a percentage (like 70), return as is
  return Math.round(numValue);
}

// Helper function to parse date from filename
function parseDateFromFilename(filename) {
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
  return '2024-01-01';
}

async function importExcelFormatData(csvFilePath) {
  const results = [];
  const filename = path.basename(csvFilePath);
  const dataDate = parseDateFromFilename(filename);
  
  console.log(`📁 Processing: ${filename}`);
  console.log(`📅 Data date: ${dataDate}`);
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Map Excel CSV columns to database fields
          const record = {
            urn: row.URN,
            school_name: row['School Name'],
            local_authority: row['Local Authority'],
            ofsted_region: row['Ofsted Region'],
            ofsted_phase: row['Ofsted Phase or Type of Education'],
            submissions: parseInt(row.Submissions) || 0,
            response_rate: row['Response Rate'] || '0',
            data_date: dataDate,
            
            // Q1: Simplified column names from Excel
            q1_strongly_agree: parsePercentage(row['Q1 Strongly Agree']),
            q1_agree: parsePercentage(row['Q1 Agree']),
            q1_disagree: parsePercentage(row['Q1 Disagree']),
            q1_strongly_disagree: parsePercentage(row['Q1 Strongly Disagree']),
            q1_dont_know: parsePercentage(row['Q1 Don\'t Know']),
            
            // Q2: My child feels safe at this school
            q2_strongly_agree: parsePercentage(row['Q2 Strongly Agree']),
            q2_agree: parsePercentage(row['Q2 Agree']),
            q2_disagree: parsePercentage(row['Q2 Disagree']),
            q2_strongly_disagree: parsePercentage(row['Q2 Strongly Disagree']),
            q2_dont_know: parsePercentage(row['Q2 Don\'t Know']),
            
            // Q3: The school makes sure its pupils are well behaved
            q3_strongly_agree: parsePercentage(row['Q3 Strongly Agree']),
            q3_agree: parsePercentage(row['Q3 Agree']),
            q3_disagree: parsePercentage(row['Q3 Disagree']),
            q3_strongly_disagree: parsePercentage(row['Q3 Strongly Disagree']),
            q3_dont_know: parsePercentage(row['Q3 Don\'t Know']),
            
            // Q4: Bullying handling
            q4_strongly_agree: parsePercentage(row['Q4 Strongly Agree']),
            q4_agree: parsePercentage(row['Q4 Agree']),
            q4_disagree: parsePercentage(row['Q4 Disagree']),
            q4_strongly_disagree: parsePercentage(row['Q4 Strongly Disagree']),
            q4_dont_know: parsePercentage(row['Q4 Don\'t Know']),
            q4_not_applicable: parsePercentage(row['Q4 My child has not been bullied']),
            
            // Q5-Q13: Set to 0 for now, can be added later if needed
            q5_strongly_agree: parsePercentage(row['Q5 Strongly Agree'] || 0),
            q5_agree: parsePercentage(row['Q5 Agree'] || 0),
            q5_disagree: parsePercentage(row['Q5 Disagree'] || 0),
            q5_strongly_disagree: parsePercentage(row['Q5 Strongly Disagree'] || 0),
            q5_dont_know: parsePercentage(row['Q5 Don\'t Know'] || 0),
            
            q6_strongly_agree: parsePercentage(row['Q6 Strongly Agree'] || 0),
            q6_agree: parsePercentage(row['Q6 Agree'] || 0),
            q6_disagree: parsePercentage(row['Q6 Disagree'] || 0),
            q6_strongly_disagree: parsePercentage(row['Q6 Strongly Disagree'] || 0),
            q6_dont_know: parsePercentage(row['Q6 Don\'t Know'] || 0),
            q6_not_applicable: parsePercentage(row['Q6 I have not raised any concerns'] || 0),
            
            q8_strongly_agree: parsePercentage(row['Q8 Strongly Agree'] || 0),
            q8_agree: parsePercentage(row['Q8 Agree'] || 0),
            q8_disagree: parsePercentage(row['Q8 Disagree'] || 0),
            q8_strongly_disagree: parsePercentage(row['Q8 Strongly Disagree'] || 0),
            q8_dont_know: parsePercentage(row['Q8 Don\'t Know'] || 0),
            
            q9_strongly_agree: parsePercentage(row['Q9 Strongly Agree'] || 0),
            q9_agree: parsePercentage(row['Q9 Agree'] || 0),
            q9_disagree: parsePercentage(row['Q9 Disagree'] || 0),
            q9_strongly_disagree: parsePercentage(row['Q9 Strongly Disagree'] || 0),
            q9_dont_know: parsePercentage(row['Q9 Don\'t Know'] || 0),
            
            q10_strongly_agree: parsePercentage(row['Q10 Strongly Agree'] || 0),
            q10_agree: parsePercentage(row['Q10 Agree'] || 0),
            q10_disagree: parsePercentage(row['Q10 Disagree'] || 0),
            q10_strongly_disagree: parsePercentage(row['Q10 Strongly Disagree'] || 0),
            q10_dont_know: parsePercentage(row['Q10 Don\'t Know'] || 0),
            
            q11_strongly_agree: parsePercentage(row['Q11 Strongly Agree'] || 0),
            q11_agree: parsePercentage(row['Q11 Agree'] || 0),
            q11_disagree: parsePercentage(row['Q11 Disagree'] || 0),
            q11_strongly_disagree: parsePercentage(row['Q11 Strongly Disagree'] || 0),
            q11_dont_know: parsePercentage(row['Q11 Don\'t Know'] || 0),
            
            q12_strongly_agree: parsePercentage(row['Q12 Strongly Agree'] || 0),
            q12_agree: parsePercentage(row['Q12 Agree'] || 0),
            q12_disagree: parsePercentage(row['Q12 Disagree'] || 0),
            q12_strongly_disagree: parsePercentage(row['Q12 Strongly Disagree'] || 0),
            q12_dont_know: parsePercentage(row['Q12 Don\'t Know'] || 0),
            
            q13_strongly_agree: parsePercentage(row['Q13 Strongly Agree'] || 0),
            q13_agree: parsePercentage(row['Q13 Agree'] || 0),
            q13_disagree: parsePercentage(row['Q13 Disagree'] || 0),
            q13_strongly_disagree: parsePercentage(row['Q13 Strongly Disagree'] || 0),
            q13_dont_know: parsePercentage(row['Q13 Don\'t Know'] || 0),
            
            // Q14: Recommendation
            q14_yes: parsePercentage(row['Q14 Yes'] || 0),
            q14_no: parsePercentage(row['Q14 No'] || 0)
          };
          
          // Only add records with valid URN and submissions
          if (record.urn && record.submissions > 0) {
            results.push(record);
          }
        } catch (error) {
          console.error(`❌ Error processing row for URN ${row.URN}:`, error.message);
        }
      })
      .on('end', async () => {
        try {
          console.log(`📊 Parsed ${results.length} records`);
          
          if (results.length === 0) {
            console.log('⚠️  No valid records to import');
            resolve(0);
            return;
          }
          
          // Clear existing data for this date to avoid duplicates
          console.log(`🗑️  Clearing existing data for ${dataDate}...`);
          const { error: deleteError } = await supabase
            .from('parent_view_data')
            .delete()
            .eq('data_date', dataDate);
            
          if (deleteError) {
            console.error('⚠️  Error clearing existing data:', deleteError);
          }
          
          // Import in batches
          const batchSize = 100;
          let totalInserted = 0;
          
          for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            
            console.log(`📥 Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(results.length / batchSize)} (${batch.length} records)`);
            
            const { data, error } = await supabase
              .from('parent_view_data')
              .insert(batch);
            
            if (error) {
              console.error('❌ Error inserting batch:', error);
              reject(error);
              return;
            }
            
            totalInserted += batch.length;
            console.log(`✅ Inserted batch successfully`);
          }
          
          console.log(`🎉 Successfully imported ${totalInserted} records from ${filename}`);
          resolve(totalInserted);
          
        } catch (error) {
          console.error('❌ Error during import:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        reject(error);
      });
  });
}

// Run the import for the most recent file
async function main() {
  try {
    const csvPath = path.join(__dirname, '..', 'data', 'raw', 'ofsted-parentview-data', 'converted-csv', 'Parent_View_Management_Information_as_at_7_April_2025.csv');
    
    console.log('🚀 Importing April 2025 Parent View data with correct column mapping...');
    
    const recordCount = await importExcelFormatData(csvPath);
    
    console.log(`\n🎯 Import complete! Records imported: ${recordCount}`);
    
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
      const harris = harrisTest[0];
      console.log('✅ Harris Academy Chobham found in database!');
      console.log(`   📊 Submissions: ${harris.submissions}`);
      console.log(`   📅 Data date: ${harris.data_date}`);
      console.log(`   🏫 School name: ${harris.school_name}`);
      console.log(`   📈 Q1 Happy - Strongly Agree: ${harris.q1_strongly_agree}%`);
      console.log(`   📈 Q1 Happy - Agree: ${harris.q1_agree}%`);
      console.log(`   📈 Q2 Safe - Strongly Agree: ${harris.q2_strongly_agree}%`);
    } else {
      console.log('❌ Harris Academy Chobham still not found');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { importExcelFormatData };
