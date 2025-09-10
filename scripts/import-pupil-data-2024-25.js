#!/usr/bin/env node

/**
 * PUPIL DATA IMPORT SCRIPT - 2024-25
 * ===================================
 * 
 * This script imports pupil data from the 2024-25 DfE School Census files
 * into the Supabase database.
 * 
 * Usage: node scripts/import-pupil-data-2024-25.js
 * 
 * Files processed:
 * - spc_school_level_underlying_data_2025.csv (main school data)
 * - spc_pupils_yeargroup_and_sex.csv (year group breakdowns)
 * - spc_pupils_ethnicity_and_language.csv (ethnicity data)
 * - spc_class_size.csv (class size data)
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
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration
const DATA_DIR = path.join(__dirname, '../data/raw/pupil-data/2024-25');
const BATCH_SIZE = 100;
const ACADEMIC_YEAR = '202425';

// Statistics tracking
const stats = {
  schoolsProcessed: 0,
  schoolsUpdated: 0,
  cohortsImported: 0,
  ethnicitiesImported: 0,
  classSizesImported: 0,
  characteristicsImported: 0,
  errors: []
};

/**
 * Utility function to safely parse numbers
 */
function safeParseInt(value, defaultValue = 0) {
  if (!value || value === 'z' || value === '') return defaultValue;
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

function safeParseFloat(value, defaultValue = 0) {
  if (!value || value === 'z' || value === '') return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Map ethnicity names to our standardized format
 */
function mapEthnicityName(ethnicityName) {
  const mapping = {
    'White - English/Welsh/Scottish/Northern Irish/British': 'white_british',
    'White - Irish': 'white_irish',
    'White - Gypsy or Roma': 'white_gypsy_roma',
    'White - Any other White background': 'white_other',
    'Mixed - White and Black Caribbean': 'mixed_white_black_caribbean',
    'Mixed - White and Black African': 'mixed_white_black_african',
    'Mixed - White and Asian': 'mixed_white_asian',
    'Mixed - Any other Mixed background': 'mixed_other',
    'Asian or Asian British - Indian': 'asian_indian',
    'Asian or Asian British - Pakistani': 'asian_pakistani',
    'Asian or Asian British - Bangladeshi': 'asian_bangladeshi',
    'Asian or Asian British - Chinese': 'asian_chinese',
    'Asian or Asian British - Any other Asian background': 'asian_other',
    'Black or Black British - Caribbean': 'black_caribbean',
    'Black or Black British - African': 'black_african',
    'Black or Black British - Any other Black background': 'black_other',
    'Other ethnic group - Any other ethnic group': 'other_ethnicity',
    'Unclassified': 'unclassified_ethnicity'
  };
  
  return mapping[ethnicityName] || ethnicityName.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/**
 * Map year group names to our standardized format
 */
function mapYearGroup(yearGroupName) {
  const mapping = {
    'Early 1': 'early_1',
    'Early 2': 'early_2',
    'Nursery 1': 'nursery_1',
    'Nursery 2': 'nursery_2',
    'Reception': 'reception',
    'Year group 1': 'year_1',
    'Year group 2': 'year_2',
    'Year group 3': 'year_3',
    'Year group 4': 'year_4',
    'Year group 5': 'year_5',
    'Year group 6': 'year_6',
    'Year group 7': 'year_7',
    'Year group 8': 'year_8',
    'Year group 9': 'year_9',
    'Year group 10': 'year_10',
    'Year group 11': 'year_11',
    'Year group 12': 'year_12',
    'Year group 13': 'year_13',
    'Year group 14': 'year_14',
    'Not followed': 'not_followed'
  };
  
  return mapping[yearGroupName] || yearGroupName.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/**
 * Import main school-level pupil data
 */
async function importSchoolLevelData() {
  console.log('📊 Importing school-level pupil data...');
  
  const csvFile = path.join(DATA_DIR, 'supporting-files', 'spc_school_level_underlying_data_2025.csv');
  
  if (!fs.existsSync(csvFile)) {
    throw new Error(`CSV file not found: ${csvFile}`);
  }
  
  const schools = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Only process school-level data (not LA-level)
          if (row.geographic_level !== 'School') return;
          
          const schoolData = {
            urn: row.urn,
            pupils_202425: safeParseInt(row['headcount of pupils']),
            boys_202425: safeParseInt(row['headcount total male']),
            girls_202425: safeParseInt(row['headcount total female']),
            fte_pupils_202425: safeParseFloat(row['fte pupils']),
            fsm_202425: safeParseInt(row['number of pupils known to be eligible for free school meals']),
            fsm_percentage_202425: safeParseFloat(row['% of pupils known to be eligible for free school meals']),
            english_first_language_202425: safeParseInt(row['number of pupils whose first language is known or believed to be English']),
            english_first_language_percentage_202425: safeParseFloat(row['% of pupils whose first language is known or believed to be English']),
            other_language_202425: safeParseInt(row['number of pupils whose first language is known or believed to be other than English']),
            other_language_percentage_202425: safeParseFloat(row['% of pupils whose first language is known or believed to be other than English']),
            unclassified_language_202425: safeParseInt(row['number of pupils whose first language is unclassified']),
            unclassified_language_percentage_202425: safeParseFloat(row['% of pupils whose first language is unclassified']),
            
            // Key ethnicities
            white_british_202425: safeParseInt(row['number of pupils classified as white British ethnic origin']),
            white_british_percentage_202425: safeParseFloat(row['% of pupils classified as white British ethnic origin']),
            white_irish_202425: safeParseInt(row['number of pupils classified as Irish ethnic origin']),
            white_irish_percentage_202425: safeParseFloat(row['% of pupils classified as Irish ethnic origin']),
            white_other_202425: safeParseInt(row['number of pupils classified as any other white background ethnic origin']),
            white_other_percentage_202425: safeParseFloat(row['% of pupils classified as any other white background ethnic origin']),
            traveller_irish_heritage_202425: safeParseInt(row['number of pupils classified as traveller of Irish heritage ethnic origin']),
            traveller_irish_heritage_percentage_202425: safeParseFloat(row['% of pupils classified as traveller of Irish heritage ethnic origin']),
            gypsy_roma_202425: safeParseInt(row['number of pupils classified as Gypsy/Roma ethnic origin']),
            gypsy_roma_percentage_202425: safeParseFloat(row['% of pupils classified as Gypsy/Roma ethnic origin']),
            mixed_white_black_caribbean_202425: safeParseInt(row['number of pupils classified as white and black Caribbean ethnic origin']),
            mixed_white_black_caribbean_percentage_202425: safeParseFloat(row['% of pupils classified as white and black Caribbean ethnic origin']),
            mixed_white_black_african_202425: safeParseInt(row['number of pupils classified as white and black African ethnic origin']),
            mixed_white_black_african_percentage_202425: safeParseFloat(row['% of pupils classified as white and black African ethnic origin']),
            mixed_white_asian_202425: safeParseInt(row['number of pupils classified as white and Asian ethnic origin']),
            mixed_white_asian_percentage_202425: safeParseFloat(row['% of pupils classified as white and Asian ethnic origin']),
            mixed_other_202425: safeParseInt(row['number of pupils classified as any other mixed background ethnic origin']),
            mixed_other_percentage_202425: safeParseFloat(row['% of pupils classified as any other mixed background ethnic origin']),
            asian_indian_202425: safeParseInt(row['number of pupils classified as Indian ethnic origin']),
            asian_indian_percentage_202425: safeParseFloat(row['% of pupils classified as Indian ethnic origin']),
            asian_pakistani_202425: safeParseInt(row['number of pupils classified as Pakistani ethnic origin']),
            asian_pakistani_percentage_202425: safeParseFloat(row['% of pupils classified as Pakistani ethnic origin']),
            asian_bangladeshi_202425: safeParseInt(row['number of pupils classified as Bangladeshi ethnic origin']),
            asian_bangladeshi_percentage_202425: safeParseFloat(row['% of pupils classified as Bangladeshi ethnic origin']),
            asian_other_202425: safeParseInt(row['number of pupils classified as any other Asian background ethnic origin']),
            asian_other_percentage_202425: safeParseFloat(row['% of pupils classified as any other Asian background ethnic origin']),
            black_caribbean_202425: safeParseInt(row['number of pupils classified as Caribbean ethnic origin']),
            black_caribbean_percentage_202425: safeParseFloat(row['% of pupils classified as Caribbean ethnic origin']),
            black_african_202425: safeParseInt(row['number of pupils classified as African ethnic origin']),
            black_african_percentage_202425: safeParseFloat(row['% of pupils classified as African ethnic origin']),
            black_other_202425: safeParseInt(row['number of pupils classified as any other black background ethnic origin']),
            black_other_percentage_202425: safeParseFloat(row['% of pupils classified as any other black background ethnic origin']),
            chinese_202425: safeParseInt(row['number of pupils classified as Chinese ethnic origin']),
            chinese_percentage_202425: safeParseFloat(row['% of pupils classified as Chinese ethnic origin']),
            other_ethnicity_202425: safeParseInt(row['number of pupils classified as any other ethnic group ethnic origin']),
            other_ethnicity_percentage_202425: safeParseFloat(row['% of pupils classified as any other ethnic group ethnic origin']),
            unclassified_ethnicity_202425: safeParseInt(row['number of pupils unclassified']),
            unclassified_ethnicity_percentage_202425: safeParseFloat(row['% of pupils unclassified']),
            
            // Boarding data
            male_boarders_202425: safeParseInt(row['male boarders']),
            female_boarders_202425: safeParseInt(row['female boarders']),
            total_boarders_202425: safeParseInt(row['total boarders']),
            
            // Young carers
            young_carers_202425: safeParseInt(row['number of pupils who are a young carer']),
            young_carers_percentage_202425: safeParseFloat(row['% of pupils who are a young carer']),
            
            // Metadata
            pupil_data_source_202425: 'DfE School Census 2024-25',
            pupil_data_updated_202425: new Date().toISOString()
          };
          
          // Only add if we have a valid URN and some pupil data
          if (schoolData.urn && schoolData.pupils_202425 > 0) {
            schools.push(schoolData);
          }
        } catch (error) {
          stats.errors.push(`Error processing school row: ${error.message}`);
        }
      })
      .on('end', async () => {
        try {
          console.log(`📋 Found ${schools.length} schools with pupil data`);
          
          // Import in batches
          for (let i = 0; i < schools.length; i += BATCH_SIZE) {
            const batch = schools.slice(i, i + BATCH_SIZE);
            
            const { data, error } = await supabase
              .from('schools')
              .upsert(batch, { 
                onConflict: 'urn',
                ignoreDuplicates: false 
              });
            
            if (error) {
              throw new Error(`Batch insert error: ${error.message}`);
            }
            
            stats.schoolsUpdated += batch.length;
            console.log(`✅ Updated batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(schools.length / BATCH_SIZE)} (${batch.length} schools)`);
          }
          
          stats.schoolsProcessed = schools.length;
          console.log(`✅ School-level data import completed: ${stats.schoolsUpdated} schools updated`);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(new Error(`CSV read error: ${error.message}`));
      });
  });
}

/**
 * Import year group breakdowns
 */
async function importYearGroupData() {
  console.log('👥 Importing year group breakdowns...');
  
  const csvFile = path.join(DATA_DIR, 'data', 'spc_pupils_yeargroup_and_sex.csv');
  
  if (!fs.existsSync(csvFile)) {
    console.log('⚠️  Year group CSV not found, skipping...');
    return;
  }
  
  const cohorts = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Only process school-level data for 2024-25
          if (row.geographic_level !== 'School' || row.time_period !== ACADEMIC_YEAR) return;
          
          const cohortData = {
            school_urn: row.urn,
            academic_year: ACADEMIC_YEAR,
            year_group: mapYearGroup(row.ncyear),
            boys_count: safeParseInt(row.headcount),
            girls_count: 0, // Will be updated when we process female data
            total_count: safeParseInt(row.headcount),
            full_time_count: safeParseInt(row.full_time),
            part_time_count: safeParseInt(row.part_time),
            fte_count: safeParseFloat(row.fte)
          };
          
          // Only add if we have valid data
          if (cohortData.school_urn && cohortData.total_count > 0) {
            cohorts.push(cohortData);
          }
        } catch (error) {
          stats.errors.push(`Error processing year group row: ${error.message}`);
        }
      })
      .on('end', async () => {
        try {
          console.log(`📋 Found ${cohorts.length} year group records`);
          
          // Import in batches
          for (let i = 0; i < cohorts.length; i += BATCH_SIZE) {
            const batch = cohorts.slice(i, i + BATCH_SIZE);
            
            const { data, error } = await supabase
              .from('pupil_cohorts')
              .upsert(batch, { 
                onConflict: 'school_urn,academic_year,year_group',
                ignoreDuplicates: false 
              });
            
            if (error) {
              throw new Error(`Cohort batch insert error: ${error.message}`);
            }
            
            stats.cohortsImported += batch.length;
            console.log(`✅ Imported cohort batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(cohorts.length / BATCH_SIZE)} (${batch.length} records)`);
          }
          
          console.log(`✅ Year group data import completed: ${stats.cohortsImported} records imported`);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(new Error(`Year group CSV read error: ${error.message}`));
      });
  });
}

/**
 * Import ethnicity data
 */
async function importEthnicityData() {
  console.log('🌍 Importing ethnicity data...');
  
  const csvFile = path.join(DATA_DIR, 'data', 'spc_pupils_ethnicity_and_language.csv');
  
  if (!fs.existsSync(csvFile)) {
    console.log('⚠️  Ethnicity CSV not found, skipping...');
    return;
  }
  
  const ethnicities = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Only process school-level data for 2024-25
          if (row.geographic_level !== 'School' || row.time_period !== ACADEMIC_YEAR) return;
          
          const ethnicityData = {
            school_urn: row.urn,
            academic_year: ACADEMIC_YEAR,
            ethnicity_name: row.ethnicity_minor,
            pupil_count: safeParseInt(row.headcount),
            percentage: safeParseFloat(row.percent_of_pupils)
          };
          
          // Only add if we have valid data
          if (ethnicityData.school_urn && ethnicityData.pupil_count > 0) {
            ethnicities.push(ethnicityData);
          }
        } catch (error) {
          stats.errors.push(`Error processing ethnicity row: ${error.message}`);
        }
      })
      .on('end', async () => {
        try {
          console.log(`📋 Found ${ethnicities.length} ethnicity records`);
          
          // Import in batches
          for (let i = 0; i < ethnicities.length; i += BATCH_SIZE) {
            const batch = ethnicities.slice(i, i + BATCH_SIZE);
            
            const { data, error } = await supabase
              .from('pupil_ethnicities')
              .upsert(batch, { 
                onConflict: 'school_urn,academic_year,ethnicity_name',
                ignoreDuplicates: false 
              });
            
            if (error) {
              throw new Error(`Ethnicity batch insert error: ${error.message}`);
            }
            
            stats.ethnicitiesImported += batch.length;
            console.log(`✅ Imported ethnicity batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(ethnicities.length / BATCH_SIZE)} (${batch.length} records)`);
          }
          
          console.log(`✅ Ethnicity data import completed: ${stats.ethnicitiesImported} records imported`);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(new Error(`Ethnicity CSV read error: ${error.message}`));
      });
  });
}

/**
 * Import class size data
 */
async function importClassSizeData() {
  console.log('📏 Importing class size data...');
  
  const csvFile = path.join(DATA_DIR, 'data', 'spc_class_size.csv');
  
  if (!fs.existsSync(csvFile)) {
    console.log('⚠️  Class size CSV not found, skipping...');
    return;
  }
  
  const classSizes = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Only process school-level data for 2024-25
          if (row.geographic_level !== 'School' || row.time_period !== ACADEMIC_YEAR) return;
          
          const classSizeData = {
            school_urn: row.urn,
            academic_year: ACADEMIC_YEAR,
            class_type: row.classtype,
            size_range: row.size,
            number_of_classes: safeParseInt(row.number_of_classes),
            number_of_pupils: safeParseInt(row.number_of_pupils),
            average_class_size: safeParseFloat(row.average_class_size)
          };
          
          // Only add if we have valid data
          if (classSizeData.school_urn && classSizeData.number_of_classes > 0) {
            classSizes.push(classSizeData);
          }
        } catch (error) {
          stats.errors.push(`Error processing class size row: ${error.message}`);
        }
      })
      .on('end', async () => {
        try {
          console.log(`📋 Found ${classSizes.length} class size records`);
          
          // Import in batches
          for (let i = 0; i < classSizes.length; i += BATCH_SIZE) {
            const batch = classSizes.slice(i, i + BATCH_SIZE);
            
            const { data, error } = await supabase
              .from('class_sizes')
              .upsert(batch, { 
                onConflict: 'school_urn,academic_year,class_type,size_range',
                ignoreDuplicates: false 
              });
            
            if (error) {
              throw new Error(`Class size batch insert error: ${error.message}`);
            }
            
            stats.classSizesImported += batch.length;
            console.log(`✅ Imported class size batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(classSizes.length / BATCH_SIZE)} (${batch.length} records)`);
          }
          
          console.log(`✅ Class size data import completed: ${stats.classSizesImported} records imported`);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(new Error(`Class size CSV read error: ${error.message}`));
      });
  });
}

/**
 * Print final statistics
 */
function printStatistics() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT STATISTICS');
  console.log('='.repeat(60));
  console.log(`🏫 Schools processed: ${stats.schoolsProcessed}`);
  console.log(`✅ Schools updated: ${stats.schoolsUpdated}`);
  console.log(`👥 Year group records: ${stats.cohortsImported}`);
  console.log(`🌍 Ethnicity records: ${stats.ethnicitiesImported}`);
  console.log(`📏 Class size records: ${stats.classSizesImported}`);
  console.log(`📋 Characteristics records: ${stats.characteristicsImported}`);
  
  if (stats.errors.length > 0) {
    console.log(`\n❌ Errors encountered: ${stats.errors.length}`);
    stats.errors.slice(0, 10).forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
    if (stats.errors.length > 10) {
      console.log(`   ... and ${stats.errors.length - 10} more errors`);
    }
  } else {
    console.log('\n✅ No errors encountered!');
  }
  
  console.log('\n🎉 Pupil data import completed successfully!');
  console.log('='.repeat(60));
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting pupil data import for 2024-25...');
  console.log(`📁 Data directory: ${DATA_DIR}`);
  console.log(`🗄️  Database: ${supabaseUrl}`);
  console.log('');
  
  try {
    // Check if data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      throw new Error(`Data directory not found: ${DATA_DIR}`);
    }
    
    // Import data in sequence
    await importSchoolLevelData();
    await importYearGroupData();
    await importEthnicityData();
    await importClassSizeData();
    
    // Print final statistics
    printStatistics();
    
  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { main, stats };
