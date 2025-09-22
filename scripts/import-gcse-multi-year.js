require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Available years and their corresponding academic years
const YEARS = [
  { folder: '2018', academicYear: 2018 },
  { folder: '2019', academicYear: 2019 },
  { folder: '2022', academicYear: 2022 },
  { folder: '2023', academicYear: 2023 },
  { folder: '2024', academicYear: 2024 }
];

// Column mapping for different years (some columns may have different names)
const COLUMN_MAPPING = {
  2018: {
    attainment8_score: 'ATT8SCR',
    grade5_eng_maths_percent: 'PTL2BASICS_95',
    five_gcses_grade4_percent: 'PTL2BASICS_94',
    entering_ebacc_percent: 'PTEBACC_E_PTQ_EE',
    ebacc_avg_point_score: 'EBACCAPS',
    progress8_score: 'P8MEA',
    progress8_banding: 'P8_BANDING'
  },
  2019: {
    attainment8_score: 'ATT8SCR',
    grade5_eng_maths_percent: 'PTL2BASICS_95',
    five_gcses_grade4_percent: 'PTL2BASICS_94',
    entering_ebacc_percent: 'PTEBACC_E_PTQ_EE',
    ebacc_avg_point_score: 'EBACCAPS',
    progress8_score: 'P8MEA',
    progress8_banding: 'P8_BANDING'
  },
  2022: {
    attainment8_score: 'ATT8SCR',
    grade5_eng_maths_percent: 'PTL2BASICS_95',
    five_gcses_grade4_percent: 'PTL2BASICS_94',
    entering_ebacc_percent: 'PTEBACC_E_PTQ_EE',
    ebacc_avg_point_score: 'EBACCAPS',
    progress8_score: 'P8MEA',
    progress8_banding: 'P8_BANDING'
  },
  2023: {
    attainment8_score: 'ATT8SCR',
    grade5_eng_maths_percent: 'PTL2BASICS_95',
    five_gcses_grade4_percent: 'PTL2BASICS_94',
    entering_ebacc_percent: 'PTEBACC_E_PTQ_EE',
    ebacc_avg_point_score: 'EBACCAPS',
    progress8_score: 'P8MEA',
    progress8_banding: 'P8_BANDING'
  },
  2024: {
    attainment8_score: 'ATT8SCR',
    grade5_eng_maths_percent: 'PTL2BASICS_95',
    five_gcses_grade4_percent: 'PTL2BASICS_94',
    entering_ebacc_percent: 'PTEBACC_E_PTQ_EE',
    ebacc_avg_point_score: 'EBACCAPS',
    progress8_score: 'P8MEA',
    progress8_banding: 'P8_BANDING'
  }
};

async function importYearData(yearInfo) {
  const { folder, academicYear } = yearInfo;
  const csvPath = path.join(__dirname, `../data/raw/gcse-ks4-results/${folder}/england_ks4final.csv`);
  
  console.log(`\n=== Importing ${academicYear} data ===`);
  
  if (!fs.existsSync(csvPath)) {
    console.log(`❌ CSV file not found: ${csvPath}`);
    return;
  }

  const mapping = COLUMN_MAPPING[academicYear];
  const schools = [];
  let processedCount = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Handle BOM issue - the first column might be '﻿RECTYPE' instead of 'RECTYPE'
        const rectype = row['﻿RECTYPE'] || row.RECTYPE;
        
        // Only process RECTYPE 1 (main schools) and RECTYPE 2 (special schools with GCSE data)
        if (rectype === '1' || rectype === '2') {
          const schoolData = {
            urn: parseInt(row.URN),
            school_name: row.SCHNAME,
            lea_code: parseInt(row.LEA),
            academic_year: academicYear,
            attainment8_score: parseFloat(row[mapping.attainment8_score]) || null,
            grade5_eng_maths_percent: parseFloat(row[mapping.grade5_eng_maths_percent]) || null,
            five_gcses_grade4_percent: parseFloat(row[mapping.five_gcses_grade4_percent]) || null,
            entering_ebacc_percent: parseFloat(row[mapping.entering_ebacc_percent]) || null,
            ebacc_avg_point_score: parseFloat(row[mapping.ebacc_avg_point_score]) || null,
            progress8_score: parseFloat(row[mapping.progress8_score]) || null,
            progress8_banding: row[mapping.progress8_banding] || null,
            raw_data: row // Store original data for flexibility
          };

          schools.push(schoolData);
          processedCount++;

          if (schools.length >= 100) {
            // Process in batches
            processSchoolsBatch(schools, academicYear);
            schools.length = 0; // Clear array
          }
        }
      })
      .on('end', async () => {
        // Process remaining schools
        if (schools.length > 0) {
          await processSchoolsBatch(schools, academicYear);
        }
        
        console.log(`✅ Processed ${processedCount} schools for ${academicYear}`);
        resolve();
      })
      .on('error', reject);
  });
}

async function processSchoolsBatch(schools, academicYear) {
  try {
    const { data, error } = await supabase
      .from('gcse_results_multi_year')
      .upsert(schools, { 
        onConflict: 'urn,academic_year',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error(`❌ Error inserting ${academicYear} data:`, error);
    } else {
      console.log(`📊 Inserted ${schools.length} schools for ${academicYear}`);
    }
  } catch (err) {
    console.error(`❌ Error processing batch for ${academicYear}:`, err);
  }
}

async function calculateRankingsAndAverages(academicYear) {
  console.log(`\n=== Calculating rankings and averages for ${academicYear} ===`);
  
  try {
    // Get all schools for this year
    const { data: schools, error: schoolsError } = await supabase
      .from('gcse_results_multi_year')
      .select('*')
      .eq('academic_year', academicYear)
      .not('attainment8_score', 'is', null);

    if (schoolsError) {
      console.error(`❌ Error fetching schools for ${academicYear}:`, schoolsError);
      return;
    }

    console.log(`📊 Found ${schools.length} schools with data for ${academicYear}`);

    // Calculate rankings for each metric
    const metrics = [
      'attainment8_score',
      'grade5_eng_maths_percent',
      'five_gcses_grade4_percent',
      'entering_ebacc_percent',
      'ebacc_avg_point_score',
      'progress8_score'
    ];

    const rankings = [];

    for (const school of schools) {
      const ranking = {
        urn: school.urn,
        school_name: school.school_name,
        lea_code: school.lea_code,
        academic_year: academicYear,
        total_schools: schools.length
      };

      // Calculate rankings for each metric (higher is better for most metrics)
      for (const metric of metrics) {
        const sortedSchools = schools
          .filter(s => s[metric] !== null)
          .sort((a, b) => b[metric] - a[metric]);
        
        const rank = sortedSchools.findIndex(s => s.urn === school.urn) + 1;
        // Map metric names to correct column names in the database
        const columnName = metric === 'attainment8_score' ? 'attainment8_rank' : `${metric}_rank`;
        ranking[columnName] = rank > 0 ? rank : null;
      }

      rankings.push(ranking);
    }

    // Insert rankings in batches
    const batchSize = 100;
    for (let i = 0; i < rankings.length; i += batchSize) {
      const batch = rankings.slice(i, i + batchSize);
      const { error } = await supabase
        .from('gcse_rankings_multi_year')
        .upsert(batch, { 
          onConflict: 'urn,academic_year',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`❌ Error inserting rankings batch for ${academicYear}:`, error);
      }
    }

    console.log(`✅ Calculated rankings for ${rankings.length} schools for ${academicYear}`);

    // Calculate LA and England averages
    await calculateAverages(academicYear, schools);

  } catch (err) {
    console.error(`❌ Error calculating rankings for ${academicYear}:`, err);
  }
}

async function calculateAverages(academicYear, schools) {
  console.log(`📊 Calculating averages for ${academicYear}...`);

  // Calculate England averages
  const englandAverages = {
    academic_year: academicYear,
    lea_code: null,
    lea_name: 'England',
    attainment8_england_avg: calculateAverage(schools, 'attainment8_score'),
    grade5_eng_maths_england_avg: calculateAverage(schools, 'grade5_eng_maths_percent'),
    five_gcses_grade4_england_avg: calculateAverage(schools, 'five_gcses_grade4_percent'),
    entering_ebacc_england_avg: calculateAverage(schools, 'entering_ebacc_percent'),
    ebacc_avg_point_score_england_avg: calculateAverage(schools, 'ebacc_avg_point_score'),
    progress8_england_avg: calculateAverage(schools, 'progress8_score')
  };

  // Insert England averages
  const { error: englandError } = await supabase
    .from('gcse_averages_multi_year')
    .upsert(englandAverages, { 
      onConflict: 'academic_year,lea_code',
      ignoreDuplicates: false 
    });

  if (englandError) {
    console.error(`❌ Error inserting England averages for ${academicYear}:`, englandError);
  } else {
    console.log(`✅ Calculated England averages for ${academicYear}`);
  }

  // Calculate LA averages
  const laGroups = {};
  schools.forEach(school => {
    if (!laGroups[school.lea_code]) {
      laGroups[school.lea_code] = [];
    }
    laGroups[school.lea_code].push(school);
  });

  const laAverages = [];
  for (const [leaCode, laSchools] of Object.entries(laGroups)) {
    if (laSchools.length < 3) continue; // Skip LAs with too few schools

    const laAverage = {
      academic_year: academicYear,
      lea_code: parseInt(leaCode),
      lea_name: `LA ${leaCode}`, // We'll need to get proper LA names later
      attainment8_la_avg: calculateAverage(laSchools, 'attainment8_score'),
      grade5_eng_maths_la_avg: calculateAverage(laSchools, 'grade5_eng_maths_percent'),
      five_gcses_grade4_la_avg: calculateAverage(laSchools, 'five_gcses_grade4_percent'),
      entering_ebacc_la_avg: calculateAverage(laSchools, 'entering_ebacc_percent'),
      ebacc_avg_point_score_la_avg: calculateAverage(laSchools, 'ebacc_avg_point_score'),
      progress8_la_avg: calculateAverage(laSchools, 'progress8_score')
    };

    laAverages.push(laAverage);
  }

  // Insert LA averages in batches
  const batchSize = 50;
  for (let i = 0; i < laAverages.length; i += batchSize) {
    const batch = laAverages.slice(i, i + batchSize);
    const { error } = await supabase
      .from('gcse_averages_multi_year')
      .upsert(batch, { 
        onConflict: 'academic_year,lea_code',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error(`❌ Error inserting LA averages batch for ${academicYear}:`, error);
    }
  }

  console.log(`✅ Calculated averages for ${laAverages.length} LAs for ${academicYear}`);
}

function calculateAverage(schools, metric) {
  const values = schools
    .map(school => school[metric])
    .filter(value => value !== null && value !== undefined && !isNaN(value));
  
  if (values.length === 0) return null;
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 100) / 100; // Round to 2 decimal places
}

async function main() {
  console.log('🚀 Starting multi-year GCSE data import...');
  
  try {
    // Import data for each year
    for (const yearInfo of YEARS) {
      await importYearData(yearInfo);
      await calculateRankingsAndAverages(yearInfo.academicYear);
    }

    console.log('\n🎉 Multi-year GCSE data import completed successfully!');
    
    // Print summary
    for (const yearInfo of YEARS) {
      const { data: count } = await supabase
        .from('gcse_results_multi_year')
        .select('*', { count: 'exact', head: true })
        .eq('academic_year', yearInfo.academicYear);
      
      console.log(`📊 ${yearInfo.academicYear}: ${count} schools imported`);
    }

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { importYearData, calculateRankingsAndAverages };
