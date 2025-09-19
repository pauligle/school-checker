#!/usr/bin/env node

/**
 * Import Ofsted Parent View Data from CSV files
 * 
 * This script processes CSV files from the ofsted-parentview-data folder
 * and imports them into the parent_view_data table in Supabase.
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

// Helper function to parse percentage string to integer
function parsePercentage(percentStr) {
  if (!percentStr || percentStr === '' || percentStr === 'null') return 0;
  const cleaned = percentStr.toString().replace('%', '').trim();
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper function to parse date from filename
function parseDateFromFilename(filename) {
  // Extract date patterns like "6_April_2020" or "7_April_2025"
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

async function importParentViewData(csvFilePath) {
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
          // Map CSV columns to database fields
          const record = {
            urn: row.URN,
            school_name: row['School Name'],
            local_authority: row['Local Authority'],
            ofsted_region: row['Ofsted Region'],
            ofsted_phase: row['Ofsted Phase or Type of Education'],
            submissions: parseInt(row.Submissions) || 0,
            response_rate: row['Response Rate'],
            data_date: dataDate,
            
            // Q1: My child is happy at this school
            q1_strongly_agree: parsePercentage(row['Q1. My child is happy at this school. Strongly Agree']),
            q1_agree: parsePercentage(row['Q1. My child is happy at this school. Agree']),
            q1_disagree: parsePercentage(row['Q1. My child is happy at this school. Disagree']),
            q1_strongly_disagree: parsePercentage(row['Q1. My child is happy at this school. Strongly Disagree']),
            q1_dont_know: parsePercentage(row['Q1. My child is happy at this school. Don\'t Know']),
            
            // Q2: My child feels safe at this school
            q2_strongly_agree: parsePercentage(row['Q2. My child feels safe at this school. Strongly Agree']),
            q2_agree: parsePercentage(row['Q2. My child feels safe at this school. Agree']),
            q2_disagree: parsePercentage(row['Q2. My child feels safe at this school. Disagree']),
            q2_strongly_disagree: parsePercentage(row['Q2. My child feels safe at this school. Strongly Disagree']),
            q2_dont_know: parsePercentage(row['Q2. My child feels safe at this school. Don\'t Know']),
            
            // Q3: The school makes sure its pupils are well behaved
            q3_strongly_agree: parsePercentage(row['Q3. The school makes sure its pupils are well behaved. Strongly Agree']),
            q3_agree: parsePercentage(row['Q3. The school makes sure its pupils are well behaved. Agree']),
            q3_disagree: parsePercentage(row['Q3. The school makes sure its pupils are well behaved. Disagree']),
            q3_strongly_disagree: parsePercentage(row['Q3. The school makes sure its pupils are well behaved. Strongly Disagree']),
            q3_dont_know: parsePercentage(row['Q3. The school makes sure its pupils are well behaved. Don\'t Know']),
            
            // Q4: Bullying handling
            q4_strongly_agree: parsePercentage(row['Q4. My child has been bullied and the school dealt with the bullying effectively. Strongly Agree']),
            q4_agree: parsePercentage(row['Q4. My child has been bullied and the school dealt with the bullying effectively. Agree']),
            q4_disagree: parsePercentage(row['Q4. My child has been bullied and the school dealt with the bullying effectively. Disagree']),
            q4_strongly_disagree: parsePercentage(row['Q4. My child has been bullied and the school dealt with the bullying effectively. Strongly Disagree']),
            q4_dont_know: parsePercentage(row['Q4. My child has been bullied and the school dealt with the bullying effectively. Don\'t Know']),
            q4_not_applicable: parsePercentage(row['Q4. My child has been bullied and the school dealt with the bullying effectively. My child has not been bullied']),
            
            // Q5: School awareness
            q5_strongly_agree: parsePercentage(row['Q5. The school makes me aware of what my child will learn during the year. Strongly Agree']),
            q5_agree: parsePercentage(row['Q5. The school makes me aware of what my child will learn during the year. Agree']),
            q5_disagree: parsePercentage(row['Q5. The school makes me aware of what my child will learn during the year. Disagree']),
            q5_strongly_disagree: parsePercentage(row['Q5. The school makes me aware of what my child will learn during the year. Strongly disagree']),
            q5_dont_know: parsePercentage(row['Q5. The school makes me aware of what my child will learn during the year. Don\'t Know']),
            
            // Q6: Concerns handling
            q6_strongly_agree: parsePercentage(row['Q6. When I have raised concerns with the school they have been dealt with properly. Strongly Agree']),
            q6_agree: parsePercentage(row['Q6. When I have raised concerns with the school they have been dealt with properly. Agree']),
            q6_disagree: parsePercentage(row['Q6. When I have raised concerns with the school they have been dealt with properly. Disagree']),
            q6_strongly_disagree: parsePercentage(row['Q6. When I have raised concerns with the school they have been dealt with properly. Strongly disagree']),
            q6_dont_know: parsePercentage(row['Q6. When I have raised concerns with the school they have been dealt with properly. Don\'t Know']),
            q6_not_applicable: parsePercentage(row['Q6. When I have raised concerns with the school they have been dealt with properly. I have not raised any concerns']),
            
            // Q8: High expectations
            q8_strongly_agree: parsePercentage(row['Q8. The school has high expectations for my child. Strongly Agree']),
            q8_agree: parsePercentage(row['Q8. The school has high expectations for my child. Agree']),
            q8_disagree: parsePercentage(row['Q8. The school has high expectations for my child. Disagree']),
            q8_strongly_disagree: parsePercentage(row['Q8. The school has high expectations for my child. Strongly disagree']),
            q8_dont_know: parsePercentage(row['Q8. The school has high expectations for my child. Don\'t Know']),
            
            // Q9: Child doing well
            q9_strongly_agree: parsePercentage(row['Q9. My child does well at this school. Strongly Agree']),
            q9_agree: parsePercentage(row['Q9. My child does well at this school. Agree']),
            q9_disagree: parsePercentage(row['Q9. My child does well at this school. Disagree']),
            q9_strongly_disagree: parsePercentage(row['Q9. My child does well at this school. Strongly Disagree']),
            q9_dont_know: parsePercentage(row['Q9. My child does well at this school. Don\'t Know']),
            
            // Q10: Communication
            q10_strongly_agree: parsePercentage(row['Q10. The school lets me know how my child is doing. Strongly Agree']),
            q10_agree: parsePercentage(row['Q10. The school lets me know how my child is doing. Agree']),
            q10_disagree: parsePercentage(row['Q10. The school lets me know how my child is doing. Disagree']),
            q10_strongly_disagree: parsePercentage(row['Q10. The school lets me know how my child is doing. Strongly Disagree']),
            q10_dont_know: parsePercentage(row['Q10. The school lets me know how my child is doing. Don\'t Know']),
            
            // Q11: Range of subjects
            q11_strongly_agree: parsePercentage(row['Q11. There is a good range of subjects available to my child at this school. Strongly Agree']),
            q11_agree: parsePercentage(row['Q11. There is a good range of subjects available to my child at this school. Agree']),
            q11_disagree: parsePercentage(row['Q11. There is a good range of subjects available to my child at this school. Disagree']),
            q11_strongly_disagree: parsePercentage(row['Q11. There is a good range of subjects available to my child at this school. Strongly Disagree']),
            q11_dont_know: parsePercentage(row['Q11. There is a good range of subjects available to my child at this school. Don\'t Know']),
            
            // Q12: Clubs and activities
            q12_strongly_agree: parsePercentage(row['Q12. My child can take part in clubs and activities at this school. Strongly Agree']),
            q12_agree: parsePercentage(row['Q12. My child can take part in clubs and activities at this school. Agree']),
            q12_disagree: parsePercentage(row['Q12. My child can take part in clubs and activities at this school. Disagree']),
            q12_strongly_disagree: parsePercentage(row['Q12. My child can take part in clubs and activities at this school. Strongly Disagree']),
            q12_dont_know: parsePercentage(row['Q12. My child can take part in clubs and activities at this school. Don\'t Know']),
            
            // Q13: Personal development
            q13_strongly_agree: parsePercentage(row['Q13. The school supports my child\'s wider personal development. Strongly Agree']),
            q13_agree: parsePercentage(row['Q13. The school supports my child\'s wider personal development. Agree']),
            q13_disagree: parsePercentage(row['Q13. The school supports my child\'s wider personal development. Disagree']),
            q13_strongly_disagree: parsePercentage(row['Q13. The school supports my child\'s wider personal development. Strongly Disagree']),
            q13_dont_know: parsePercentage(row['Q13. The school supports my child\'s wider personal development. Don\'t Know']),
            
            // Q14: Recommendation
            q14_yes: parsePercentage(row['Q14. I would recommend this school to another parent. Yes']),
            q14_no: parsePercentage(row['Q14. I would recommend this school to another parent. No'])
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
          
          // Import in batches to avoid timeout
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

async function main() {
  const csvDir = path.join(__dirname, '..', 'data', 'raw', 'ofsted-parentview-data');
  
  if (!fs.existsSync(csvDir)) {
    console.error(`❌ Directory not found: ${csvDir}`);
    process.exit(1);
  }
  
  // Get all CSV files
  const csvFiles = fs.readdirSync(csvDir)
    .filter(file => file.endsWith('.csv') && file.includes('School_Level_Data'))
    .sort(); // Process in chronological order
  
  if (csvFiles.length === 0) {
    console.error('❌ No CSV files found in the directory');
    process.exit(1);
  }
  
  console.log(`🔍 Found ${csvFiles.length} CSV files:`);
  csvFiles.forEach(file => console.log(`  📄 ${file}`));
  console.log('');
  
  let totalRecords = 0;
  
  for (const csvFile of csvFiles) {
    try {
      const csvPath = path.join(csvDir, csvFile);
      const recordCount = await importParentViewData(csvPath);
      totalRecords += recordCount;
      console.log('');
    } catch (error) {
      console.error(`❌ Failed to import ${csvFile}:`, error.message);
    }
  }
  
  console.log(`🎯 Import complete! Total records imported: ${totalRecords}`);
  
  // Show some stats
  const { data: stats, error } = await supabase
    .from('parent_view_data')
    .select('data_date, count(*)', { count: 'exact' })
    .order('data_date');
    
  if (!error && stats) {
    console.log('\n📈 Database stats:');
    stats.forEach(stat => {
      console.log(`  📅 ${stat.data_date}: ${stat.count} schools`);
    });
  }
}

// Run the import
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { importParentViewData };
