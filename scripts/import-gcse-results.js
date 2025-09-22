const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Academic year mapping
const ACADEMIC_YEAR = '2023-24'; // 2024 GCSE results are for 2023-24 academic year

// Column mapping from CSV to database
const COLUMN_MAPPING = {
  // School Information
  'URN': 'urn',
  'SCHNAME': 'school_name',
  'LEA': 'lea_code',
  'ESTAB': 'estab_code',
  'NFTYPE': 'school_type',
  'EGENDER': 'gender',
  'AGERANGE': 'age_range',
  
  // Cohort Information
  'TOTPUPS': 'total_pupils',
  'TPUP': 'cohort_size',
  'NUMBOYS': 'boys_count',
  'NUMGIRLS': 'girls_count',
  
  // Attainment 8 Scores
  'ATT8SCR': 'attainment8_score',
  'ATT8SCRENG': 'attainment8_eng_score',
  'ATT8SCRMAT': 'attainment8_mat_score',
  'ATT8SCREBAC': 'attainment8_ebacc_score',
  'ATT8SCROPEN': 'attainment8_open_score',
  
  // Progress 8 Scores
  'P8MEA': 'progress8_score',
  'P8MEAENG': 'progress8_eng_score',
  'P8MEAMAT': 'progress8_mat_score',
  'P8MEAEBAC': 'progress8_ebacc_score',
  'P8MEAOPEN': 'progress8_open_score',
  
  // Progress 8 Confidence Intervals
  'P8CILOW': 'progress8_lower_bound',
  'P8CIUPP': 'progress8_upper_bound',
  
  // Percentage Achievements
  'PTL2BASICS_95': 'grade5_eng_maths_percent',
  'PTL2BASICS_94': 'grade4_eng_maths_percent',
  'PTL2BASICS_94': 'five_gcses_grade4_percent',
  'PTL2BASICS_95': 'five_gcses_grade5_percent',
  
  // EBacc Information
  'PTEBACC_E_PTQ_EE': 'entering_ebacc_percent',
  'EBACCAPS': 'ebacc_average_point_score',
  'PTEBACC_94': 'ebacc_grade4_percent',
  'PTEBACC_95': 'ebacc_grade5_percent',
  
  // Subject Group Scores
  'AVGEBACFILL': 'average_ebacc_fill',
  'AVGOPENFILL': 'average_open_fill',
  
  // Progress 8 Banding
  'P8_BANDING': 'progress8_banding'
};

// Function to parse CSV line
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Function to clean and convert values
function cleanValue(value, type = 'string') {
  if (value === 'NP' || value === 'NE' || value === 'SUPP' || value === '' || value === 'NA') {
    return null;
  }
  
  if (type === 'number') {
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }
  
  if (type === 'integer') {
    const num = parseInt(value);
    return isNaN(num) ? null : num;
  }
  
  return value;
}

// Function to process CSV file
async function processGCSEFile(filePath) {
  console.log(`Processing file: ${filePath}`);
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n');
  
  if (lines.length < 2) {
    console.log('File has no data rows');
    return;
  }
  
  // Parse header
  const header = parseCSVLine(lines[0]);
  console.log(`Found ${header.length} columns`);
  
  // Process data rows
  const gcseResults = [];
  const laAverages = new Map();
  const englandTotals = {
    attainment8_sum: 0,
    progress8_sum: 0,
    grade5_eng_maths_sum: 0,
    grade4_eng_maths_sum: 0,
    five_gcses_grade4_sum: 0,
    five_gcses_grade5_sum: 0,
    entering_ebacc_sum: 0,
    ebacc_avg_point_score_sum: 0,
    school_count: 0
  };
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    if (values.length !== header.length) {
      console.log(`Skipping malformed line ${i + 1}`);
      continue;
    }
    
    // Create row object
    const row = {};
    header.forEach((col, index) => {
      row[col] = values[index];
    });
    
    // Skip if not a school record (RECTYPE should be 1)
    if (row.RECTYPE !== '1') continue;
    
    // Skip if no URN
    if (!row.URN) continue;
    
    // Map to database columns
    const gcseResult = {
      urn: cleanValue(row.URN),
      school_name: cleanValue(row.SCHNAME),
      academic_year: ACADEMIC_YEAR,
      lea_code: cleanValue(row.LEA),
      estab_code: cleanValue(row.ESTAB),
      school_type: cleanValue(row.NFTYPE),
      gender: cleanValue(row.EGENDER),
      age_range: cleanValue(row.AGERANGE),
      total_pupils: cleanValue(row.TOTPUPS, 'integer'),
      cohort_size: cleanValue(row.TPUP, 'integer'),
      boys_count: cleanValue(row.NUMBOYS, 'integer'),
      girls_count: cleanValue(row.NUMGIRLS, 'integer'),
      attainment8_score: cleanValue(row.ATT8SCR, 'number'),
      attainment8_eng_score: cleanValue(row.ATT8SCRENG, 'number'),
      attainment8_mat_score: cleanValue(row.ATT8SCRMAT, 'number'),
      attainment8_ebacc_score: cleanValue(row.ATT8SCREBAC, 'number'),
      attainment8_open_score: cleanValue(row.ATT8SCROPEN, 'number'),
      progress8_score: cleanValue(row.P8MEA, 'number'),
      progress8_eng_score: cleanValue(row.P8MEAENG, 'number'),
      progress8_mat_score: cleanValue(row.P8MEAMAT, 'number'),
      progress8_ebacc_score: cleanValue(row.P8MEAEBAC, 'number'),
      progress8_open_score: cleanValue(row.P8MEAOPEN, 'number'),
      progress8_lower_bound: cleanValue(row.P8CILOW, 'number'),
      progress8_upper_bound: cleanValue(row.P8CIUPP, 'number'),
      grade5_eng_maths_percent: cleanValue(row.PTL2BASICS_95, 'number'),
      grade4_eng_maths_percent: cleanValue(row.PTL2BASICS_94, 'number'),
      five_gcses_grade4_percent: cleanValue(row.PTL2BASICS_94, 'number'),
      five_gcses_grade5_percent: cleanValue(row.PTL2BASICS_95, 'number'),
      entering_ebacc_percent: cleanValue(row.PTEBACC_E_PTQ_EE, 'number'),
      ebacc_average_point_score: cleanValue(row.EBACCAPS, 'number'),
      ebacc_grade4_percent: cleanValue(row.PTEBACC_94, 'number'),
      ebacc_grade5_percent: cleanValue(row.PTEBACC_95, 'number'),
      average_ebacc_fill: cleanValue(row.AVGEBACFILL, 'number'),
      average_open_fill: cleanValue(row.AVGOPENFILL, 'number'),
      progress8_banding: cleanValue(row.P8_BANDING)
    };
    
    gcseResults.push(gcseResult);
    
    // Accumulate LA averages
    const laCode = row.LEA;
    if (laCode && !laAverages.has(laCode)) {
      laAverages.set(laCode, {
        attainment8_sum: 0,
        progress8_sum: 0,
        grade5_eng_maths_sum: 0,
        grade4_eng_maths_sum: 0,
        five_gcses_grade4_sum: 0,
        five_gcses_grade5_sum: 0,
        entering_ebacc_sum: 0,
        ebacc_avg_point_score_sum: 0,
        school_count: 0
      });
    }
    
    if (laCode && gcseResult.attainment8_score !== null) {
      const laData = laAverages.get(laCode);
      laData.attainment8_sum += gcseResult.attainment8_score;
      laData.progress8_sum += (gcseResult.progress8_score || 0);
      laData.grade5_eng_maths_sum += (gcseResult.grade5_eng_maths_percent || 0);
      laData.grade4_eng_maths_sum += (gcseResult.grade4_eng_maths_percent || 0);
      laData.five_gcses_grade4_sum += (gcseResult.five_gcses_grade4_percent || 0);
      laData.five_gcses_grade5_sum += (gcseResult.five_gcses_grade5_percent || 0);
      laData.entering_ebacc_sum += (gcseResult.entering_ebacc_percent || 0);
      laData.ebacc_avg_point_score_sum += (gcseResult.ebacc_average_point_score || 0);
      laData.school_count++;
    }
    
    // Accumulate England totals
    if (gcseResult.attainment8_score !== null) {
      englandTotals.attainment8_sum += gcseResult.attainment8_score;
      englandTotals.progress8_sum += (gcseResult.progress8_score || 0);
      englandTotals.grade5_eng_maths_sum += (gcseResult.grade5_eng_maths_percent || 0);
      englandTotals.grade4_eng_maths_sum += (gcseResult.grade4_eng_maths_percent || 0);
      englandTotals.five_gcses_grade4_sum += (gcseResult.five_gcses_grade4_percent || 0);
      englandTotals.five_gcses_grade5_sum += (gcseResult.five_gcses_grade5_percent || 0);
      englandTotals.entering_ebacc_sum += (gcseResult.entering_ebacc_percent || 0);
      englandTotals.ebacc_avg_point_score_sum += (gcseResult.ebacc_average_point_score || 0);
      englandTotals.school_count++;
    }
  }
  
  console.log(`Processed ${gcseResults.length} school records`);
  
  // Insert GCSE results in batches
  if (gcseResults.length > 0) {
    console.log(`Inserting ${gcseResults.length} GCSE results in batches...`);
    const batchSize = 100; // Smaller batch size to avoid Supabase limits
    let totalInserted = 0;
    
    for (let i = 0; i < gcseResults.length; i += batchSize) {
      const batch = gcseResults.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(gcseResults.length / batchSize)} (${batch.length} records)...`);
      
      const { error: gcseError } = await supabase
        .from('gcse_results')
        .insert(batch);
      
      if (gcseError) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, gcseError);
      } else {
        totalInserted += batch.length;
        console.log(`Successfully inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)`);
      }
    }
    
    console.log(`Total inserted: ${totalInserted} GCSE results`);
  }
  
  // Calculate and insert LA averages
  console.log('Calculating LA averages...');
  const laAveragesArray = [];
  
  for (const [laCode, data] of laAverages) {
    if (data.school_count > 0) {
      laAveragesArray.push({
        la_code: laCode,
        la_name: `LA ${laCode}`, // We'll need to map this to actual LA names
        academic_year: ACADEMIC_YEAR,
        attainment8_avg: data.attainment8_sum / data.school_count,
        progress8_avg: data.progress8_sum / data.school_count,
        grade5_eng_maths_avg: data.grade5_eng_maths_sum / data.school_count,
        grade4_eng_maths_avg: data.grade4_eng_maths_sum / data.school_count,
        five_gcses_grade4_avg: data.five_gcses_grade4_sum / data.school_count,
        five_gcses_grade5_avg: data.five_gcses_grade5_sum / data.school_count,
        entering_ebacc_avg: data.entering_ebacc_sum / data.school_count,
        ebacc_avg_point_score: data.ebacc_avg_point_score_sum / data.school_count,
        total_schools: data.school_count,
        schools_with_data: data.school_count
      });
    }
  }
  
  if (laAveragesArray.length > 0) {
    const { error: laError } = await supabase
      .from('gcse_la_averages')
      .upsert(laAveragesArray, { onConflict: 'la_code,academic_year' });
    
    if (laError) {
      console.error('Error inserting LA averages:', laError);
    } else {
      console.log(`Successfully inserted ${laAveragesArray.length} LA averages`);
    }
  }
  
  // Calculate and insert England averages
  if (englandTotals.school_count > 0) {
    console.log('Calculating England averages...');
    const englandAverage = {
      academic_year: ACADEMIC_YEAR,
      attainment8_avg: englandTotals.attainment8_sum / englandTotals.school_count,
      progress8_avg: englandTotals.progress8_sum / englandTotals.school_count,
      grade5_eng_maths_avg: englandTotals.grade5_eng_maths_sum / englandTotals.school_count,
      grade4_eng_maths_avg: englandTotals.grade4_eng_maths_sum / englandTotals.school_count,
      five_gcses_grade4_avg: englandTotals.five_gcses_grade4_sum / englandTotals.school_count,
      five_gcses_grade5_avg: englandTotals.five_gcses_grade5_sum / englandTotals.school_count,
      entering_ebacc_avg: englandTotals.entering_ebacc_sum / englandTotals.school_count,
      ebacc_avg_point_score: englandTotals.ebacc_avg_point_score_sum / englandTotals.school_count,
      total_schools: englandTotals.school_count,
      schools_with_data: englandTotals.school_count
    };
    
    const { error: englandError } = await supabase
      .from('gcse_england_averages')
      .upsert(englandAverage, { onConflict: 'academic_year' });
    
    if (englandError) {
      console.error('Error inserting England averages:', englandError);
    } else {
      console.log('Successfully inserted England averages');
    }
  }
}

// Function to calculate rankings
async function calculateRankings() {
  console.log('Calculating rankings...');
  
  // Get all GCSE results for ranking
  const { data: gcseResults, error: fetchError } = await supabase
    .from('gcse_results')
    .select('*')
    .eq('academic_year', ACADEMIC_YEAR);
  
  if (fetchError) {
    console.error('Error fetching GCSE results for ranking:', fetchError);
    return;
  }
  
  // Sort by different metrics
  const attainment8Sorted = gcseResults
    .filter(r => r.attainment8_score !== null)
    .sort((a, b) => b.attainment8_score - a.attainment8_score);
  
  const progress8Sorted = gcseResults
    .filter(r => r.progress8_score !== null)
    .sort((a, b) => b.progress8_score - a.progress8_score);
  
  const grade5EngMathsSorted = gcseResults
    .filter(r => r.grade5_eng_maths_percent !== null)
    .sort((a, b) => b.grade5_eng_maths_percent - a.grade5_eng_maths_percent);
  
  const ebaccSorted = gcseResults
    .filter(r => r.ebacc_average_point_score !== null)
    .sort((a, b) => b.ebacc_average_point_score - a.ebacc_average_point_score);
  
  // Create rankings
  const rankings = gcseResults.map(result => {
    const ranking = {
      urn: result.urn,
      academic_year: result.academic_year,
      attainment8_rank: null,
      attainment8_total_schools: attainment8Sorted.length,
      attainment8_percentile: null,
      progress8_rank: null,
      progress8_total_schools: progress8Sorted.length,
      progress8_percentile: null,
      grade5_eng_maths_rank: null,
      grade5_eng_maths_total_schools: grade5EngMathsSorted.length,
      grade5_eng_maths_percentile: null,
      ebacc_rank: null,
      ebacc_total_schools: ebaccSorted.length,
      ebacc_percentile: null
    };
    
    // Calculate Attainment 8 ranking
    if (result.attainment8_score !== null) {
      const rank = attainment8Sorted.findIndex(r => r.urn === result.urn) + 1;
      ranking.attainment8_rank = rank;
      ranking.attainment8_percentile = ((attainment8Sorted.length - rank + 1) / attainment8Sorted.length) * 100;
    }
    
    // Calculate Progress 8 ranking
    if (result.progress8_score !== null) {
      const rank = progress8Sorted.findIndex(r => r.urn === result.urn) + 1;
      ranking.progress8_rank = rank;
      ranking.progress8_percentile = ((progress8Sorted.length - rank + 1) / progress8Sorted.length) * 100;
    }
    
    // Calculate Grade 5 English & Maths ranking
    if (result.grade5_eng_maths_percent !== null) {
      const rank = grade5EngMathsSorted.findIndex(r => r.urn === result.urn) + 1;
      ranking.grade5_eng_maths_rank = rank;
      ranking.grade5_eng_maths_percentile = ((grade5EngMathsSorted.length - rank + 1) / grade5EngMathsSorted.length) * 100;
    }
    
    // Calculate EBacc ranking
    if (result.ebacc_average_point_score !== null) {
      const rank = ebaccSorted.findIndex(r => r.urn === result.urn) + 1;
      ranking.ebacc_rank = rank;
      ranking.ebacc_percentile = ((ebaccSorted.length - rank + 1) / ebaccSorted.length) * 100;
    }
    
    return ranking;
  });
  
  // Insert rankings
  const { error: rankingError } = await supabase
    .from('gcse_rankings')
    .upsert(rankings, { onConflict: 'urn,academic_year' });
  
  if (rankingError) {
    console.error('Error inserting rankings:', rankingError);
  } else {
    console.log(`Successfully inserted ${rankings.length} rankings`);
  }
}

// Main function
async function main() {
  try {
    console.log('Starting GCSE results import...');
    
    // Process the main GCSE file
    const filePath = path.join(__dirname, '../data/raw/gcse-ks4-results/2024/england_ks4final.csv');
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }
    
    await processGCSEFile(filePath);
    await calculateRankings();
    
    console.log('GCSE results import completed successfully!');
    
  } catch (error) {
    console.error('Error during import:', error);
  }
}

// Run the import
if (require.main === module) {
  main();
}

module.exports = { processGCSEFile, calculateRankings };
