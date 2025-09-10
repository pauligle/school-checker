#!/usr/bin/env node

/**
 * Data Importer for School Checker
 * Imports processed CSV data into Supabase tables
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs-extra');
const path = require('path');
const csv = require('csv-parser');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration
const PROCESSED_DIR = path.join(__dirname, '../data/processed');
const LOG_DIR = path.join(__dirname, '../logs');
const BATCH_SIZE = 1000;

// Utility functions
function convertDate(dateString) {
  if (!dateString || dateString === '') return null;
  
  // Handle DD-MM-YYYY format
  if (dateString.includes('-') && dateString.split('-').length === 3) {
    const parts = dateString.split('-');
    if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      // DD-MM-YYYY format
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    } else if (parts[0].length === 4 && parts[1].length === 2 && parts[2].length === 2) {
      // YYYY-MM-DD format (already correct)
      return dateString;
    }
  }
  
  // Handle DD/MM/YYYY format
  if (dateString.includes('/') && dateString.split('/').length === 3) {
    const parts = dateString.split('/');
    if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      // DD/MM/YYYY format
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }
  
  return null;
}

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
  
  const logFile = path.join(LOG_DIR, `data-importer-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
}

async function ensureDirectories() {
  await fs.ensureDir(PROCESSED_DIR);
  await fs.ensureDir(LOG_DIR);
}

async function processBatch(records, tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .upsert(records, { 
        onConflict: tableName === 'schools' ? 'urn' : 
                   tableName === 'inspections' ? 'urn,inspection_date' : 
                   tableName === 'performance' ? 'urn,year' : 'urn',
        ignoreDuplicates: false 
      });
    
    if (error) {
      log(`Batch upsert error for ${tableName}: ${error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
    
    return { success: true, count: records.length };
  } catch (error) {
    log(`Batch processing error for ${tableName}: ${error.message}`, 'ERROR');
    return { success: false, error: error.message };
  }
}

// Import schools data (mapped to all available database fields)
async function importSchoolsData(csvFilePath) {
  log('🔄 Importing schools data with all 130 fields...');
  
  const schools = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Map all available fields from the processed CSV
        const school = {
          // Basic fields
          urn: row.urn,
          name: row.EstablishmentName,
          lat: parseFloat(row.lat) || null,
          lon: parseFloat(row.lon) || null,
          easting: parseFloat(row.easting) || null,
          northing: parseFloat(row.northing) || null,
          school_type: row.establishment_type_name || row.school_type,
          phase: row.phase_of_education_name || row.phase,
          local_authority: row.local_authority,
          total_pupils: parseInt(row.number_of_pupils) || parseInt(row.total_pupils) || null,
          gender: row.gender_name || row.gender,
          age_range: row.age_range,
          capacity: parseInt(row.school_capacity) || parseInt(row.capacity) || null,
          address: row.Street,
          town: row.Town,
          postcode: row.Postcode,
          telephone_num: row.TelephoneNum,
          website: row.SchoolWebsite,
          status: row.establishment_status_name || row.status,
          number_of_boys: parseInt(row.number_of_boys) || null,
          number_of_girls: parseInt(row.number_of_girls) || null,
          headteacher_title: row['HeadTitle (name)'],
          headteacher_first_name: row.HeadFirstName,
          headteacher_last_name: row.HeadLastName,
          headteacher_preferred_title: row.HeadPreferredJobTitle,
          
          // New fields from schema update
          establishment_number: row.establishment_number,
          establishment_type_code: row.establishment_type_code,
          establishment_type_group_code: row.establishment_type_group_code,
          establishment_type_group_name: row.establishment_type_group_name,
          establishment_status_code: row.establishment_status_code,
          reason_establishment_opened_code: row.reason_establishment_opened_code,
          reason_establishment_opened_name: row.reason_establishment_opened_name,
          open_date: convertDate(row.open_date),
          reason_establishment_closed_code: row.reason_establishment_closed_code,
          reason_establishment_closed_name: row.reason_establishment_closed_name,
          close_date: convertDate(row.close_date),
          phase_of_education_code: row.phase_of_education_code,
          statutory_low_age: parseInt(row.statutory_low_age) || null,
          statutory_high_age: parseInt(row.statutory_high_age) || null,
          boarders_code: row.boarders_code,
          boarders_name: row.boarders_name,
          nursery_provision_name: row.nursery_provision_name,
          official_sixth_form_code: row.official_sixth_form_code,
          official_sixth_form_name: row.official_sixth_form_name,
          gender_code: row.gender_code,
          religious_character_code: row.religious_character_code,
          religious_character_name: row.religious_character_name,
          religious_ethos_name: row.religious_ethos_name,
          diocese_code: row.diocese_code,
          diocese_name: row.diocese_name,
          admissions_policy_code: row.admissions_policy_code,
          admissions_policy_name: row.admissions_policy_name,
          school_capacity: parseInt(row.school_capacity) || null,
          special_classes_code: row.special_classes_code,
          special_classes_name: row.special_classes_name,
          census_date: convertDate(row.census_date),
          number_of_pupils: parseInt(row.number_of_pupils) || null,
          percentage_fsm: parseFloat(row.percentage_fsm) || null,
          fsm: parseInt(row.fsm) || null,
          trust_school_flag_code: row.trust_school_flag_code,
          trust_school_flag_name: row.trust_school_flag_name,
          trusts_code: row.trusts_code,
          trusts_name: row.trusts_name,
          school_sponsor_flag_name: row.school_sponsor_flag_name,
          school_sponsors_name: row.school_sponsors_name,
          federation_flag_name: row.federation_flag_name,
          federations_code: row.federations_code,
          federations_name: row.federations_name,
          sen1_name: row.sen1_name,
          sen2_name: row.sen2_name,
          sen3_name: row.sen3_name,
          sen4_name: row.sen4_name,
          sen5_name: row.sen5_name,
          sen6_name: row.sen6_name,
          sen7_name: row.sen7_name,
          sen8_name: row.sen8_name,
          sen9_name: row.sen9_name,
          sen10_name: row.sen10_name,
          sen11_name: row.sen11_name,
          sen12_name: row.sen12_name,
          sen13_name: row.sen13_name,
          type_of_resourced_provision_name: row.type_of_resourced_provision_name,
          resourced_provision_on_roll: parseInt(row.resourced_provision_on_roll) || null,
          resourced_provision_capacity: parseInt(row.resourced_provision_capacity) || null,
          sen_unit_on_roll: parseInt(row.sen_unit_on_roll) || null,
          sen_unit_capacity: parseInt(row.sen_unit_capacity) || null,
          senpru_name: row.senpru_name,
          sen_stat: parseInt(row.sen_stat) || null,
          sen_no_stat: parseInt(row.sen_no_stat) || null,
          gor_code: row.gor_code,
          gor_name: row.gor_name,
          district_administrative_code: row.district_administrative_code,
          district_administrative_name: row.district_administrative_name,
          administrative_ward_code: row.administrative_ward_code,
          administrative_ward_name: row.administrative_ward_name,
          parliamentary_constituency_code: row.parliamentary_constituency_code,
          parliamentary_constituency_name: row.parliamentary_constituency_name,
          urban_rural_code: row.urban_rural_code,
          urban_rural_name: row.urban_rural_name,
          gssla_code_name: row.gssla_code_name,
          msoa_name: row.msoa_name,
          lsoa_name: row.lsoa_name,
          msoa_code: row.msoa_code,
          lsoa_code: row.lsoa_code,
          inspectorate_name_name: row.inspectorate_name_name,
          ofsted_rating_name: row.ofsted_rating_name,
          ofsted_last_insp: convertDate(row.ofsted_last_insp),
          ofsted_special_measures_code: row.ofsted_special_measures_code,
          ofsted_special_measures_name: row.ofsted_special_measures_name,
          date_of_last_inspection_visit: convertDate(row.date_of_last_inspection_visit),
          next_inspection_visit: convertDate(row.next_inspection_visit),
          boarding_establishment_name: row.boarding_establishment_name,
          props_name: row.props_name,
          previous_la_code: row.previous_la_code,
          previous_la_name: row.previous_la_name,
          previous_establishment_number: row.previous_establishment_number,
          country_name: row.country_name,
          uprn: row.uprn,
          site_name: row.site_name,
          qab_name_code: row.qab_name_code,
          qab_name_name: row.qab_name_name,
          establishment_accredited_code: row.establishment_accredited_code,
          establishment_accredited_name: row.establishment_accredited_name,
          qab_report: row.qab_report,
          ch_number: row.ch_number,
          accreditation_expiry_date: convertDate(row.accreditation_expiry_date),
          last_changed_date: convertDate(row.last_changed_date),
          updated_at: new Date().toISOString()
        };
        
        if (school.urn && school.name && !isNaN(school.lat) && !isNaN(school.lon)) {
          schools.push(school);
        }
      })
      .on('end', async () => {
        try {
          log(`📊 Found ${schools.length} schools to import`);
          
          // Import in batches
          let imported = 0;
          for (let i = 0; i < schools.length; i += BATCH_SIZE) {
            const batch = schools.slice(i, i + BATCH_SIZE);
            
            const result = await processBatch(batch, 'schools');
            if (!result.success) {
              reject(result.error);
              return;
            }
            
            imported += result.count;
            log(`✅ Imported batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(schools.length / BATCH_SIZE)} (${imported}/${schools.length})`);
          }
          
          log('✅ Schools data imported successfully!');
          resolve(schools.length);
        } catch (error) {
          log('Error during import:', error.message, 'ERROR');
          reject(error);
        }
      })
      .on('error', (error) => {
        log('Error reading CSV:', error.message, 'ERROR');
        reject(error);
      });
  });
}

// Import Ofsted inspections data
async function importOfstedData(csvFilePath) {
  log('🔄 Importing Ofsted inspections data...');
  
  const inspections = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        const inspection = {
          urn: row.urn,
          inspection_date: row.inspection_date,
          overall_rating: row.overall_rating,
          previous_rating: row.previous_rating,
          quality_of_education: row.quality_of_education,
          behaviour_attitudes: row.behaviour_attitudes,
          personal_development: row.personal_development,
          leadership_management: row.leadership_management,
          inspection_type: row.inspection_type,
          inspector_name: row.inspector_name,
          updated_at: new Date().toISOString()
        };
        
        if (inspection.urn && inspection.inspection_date) {
          inspections.push(inspection);
        }
      })
      .on('end', async () => {
        try {
          log(`📊 Found ${inspections.length} inspections to import`);
          
          // Import in batches
          let imported = 0;
          for (let i = 0; i < inspections.length; i += BATCH_SIZE) {
            const batch = inspections.slice(i, i + BATCH_SIZE);
            
            const result = await processBatch(batch, 'inspections');
            if (!result.success) {
              reject(result.error);
              return;
            }
            
            imported += result.count;
            log(`✅ Imported batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(inspections.length / BATCH_SIZE)} (${imported}/${inspections.length})`);
          }
          
          log('✅ Ofsted inspections data imported successfully!');
          resolve(inspections.length);
        } catch (error) {
          log('Error during import:', error.message, 'ERROR');
          reject(error);
        }
      })
      .on('error', (error) => {
        log('Error reading CSV:', error.message, 'ERROR');
        reject(error);
      });
  });
}

// Import performance data
async function importPerformanceData(csvFilePath) {
  log('🔄 Importing performance data...');
  
  const performance = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        const perf = {
          urn: row.urn,
          school_name: row.school_name,
          progress_score: row.progress_score ? parseFloat(row.progress_score) : null,
          attainment_score: row.attainment_score ? parseFloat(row.attainment_score) : null,
          disadvantaged_progress: row.disadvantaged_progress ? parseFloat(row.disadvantaged_progress) : null,
          disadvantaged_attainment: row.disadvantaged_attainment ? parseFloat(row.disadvantaged_attainment) : null,
          year: row.year ? parseInt(row.year) : null,
          updated_at: new Date().toISOString()
        };
        
        if (perf.urn && perf.year) {
          performance.push(perf);
        }
      })
      .on('end', async () => {
        try {
          log(`📊 Found ${performance.length} performance records to import`);
          
          // Import in batches
          let imported = 0;
          for (let i = 0; i < performance.length; i += BATCH_SIZE) {
            const batch = performance.slice(i, i + BATCH_SIZE);
            
            const result = await processBatch(batch, 'performance');
            if (!result.success) {
              reject(result.error);
              return;
            }
            
            imported += result.count;
            log(`✅ Imported batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(performance.length / BATCH_SIZE)} (${imported}/${performance.length})`);
          }
          
          log('✅ Performance data imported successfully!');
          resolve(performance.length);
        } catch (error) {
          log('Error during import:', error.message, 'ERROR');
          reject(error);
        }
      })
      .on('error', (error) => {
        log('Error reading CSV:', error.message, 'ERROR');
        reject(error);
      });
  });
}

// Update database statistics
async function updateDatabaseStats() {
  log('📊 Updating database statistics...');
  
  try {
    // Count records in each table
    const { count: schoolsCount } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true });
    
    const { count: inspectionsCount } = await supabase
      .from('inspections')
      .select('*', { count: 'exact', head: true });
    
    const { count: performanceCount } = await supabase
      .from('performance')
      .select('*', { count: 'exact', head: true });
    
    // Update stats table
    const stats = {
      table_name: 'database_stats',
      schools_count: schoolsCount || 0,
      inspections_count: inspectionsCount || 0,
      performance_count: performanceCount || 0,
      last_updated: new Date().toISOString()
    };
    
    await supabase
      .from('database_stats')
      .upsert(stats, { onConflict: 'table_name' });
    
    log('✅ Database statistics updated:');
    log(`   Schools: ${schoolsCount || 0}`);
    log(`   Inspections: ${inspectionsCount || 0}`);
    log(`   Performance: ${performanceCount || 0}`);
    
  } catch (error) {
    log('Error updating database stats:', error.message, 'ERROR');
  }
}

// Main import function
async function importAllData() {
  log('🚀 Starting data import process...');
  log(`📅 Date: ${new Date().toISOString()}`);
  log('='.repeat(50));
  
  await ensureDirectories();
  
  const results = {};
  const logFile = path.join(LOG_DIR, `import-${new Date().toISOString().split('T')[0]}.log`);
  
  // Import schools data
  const schoolsFile = path.join(PROCESSED_DIR, 'schools-processed.csv');
  if (await fs.pathExists(schoolsFile)) {
    try {
      const schoolCount = await importSchoolsData(schoolsFile);
      results.schools = {
        success: true,
        count: schoolCount,
        filepath: schoolsFile
      };
    } catch (error) {
      log('❌ Failed to import schools:', error.message, 'ERROR');
      results.schools = {
        success: false,
        error: error.message
      };
    }
  } else {
    log('⚠️  Schools processed file not found');
    results.schools = { error: 'File not found' };
  }
  
  // Import Ofsted data
  const ofstedFile = path.join(PROCESSED_DIR, 'ofsted-processed.csv');
  if (await fs.pathExists(ofstedFile)) {
    try {
      const ofstedCount = await importOfstedData(ofstedFile);
      results.ofsted = {
        success: true,
        count: ofstedCount,
        filepath: ofstedFile
      };
    } catch (error) {
      log('❌ Failed to import Ofsted data:', error.message, 'ERROR');
      results.ofsted = {
        success: false,
        error: error.message
      };
    }
  } else {
    log('⚠️  Ofsted processed file not found');
    results.ofsted = { error: 'File not found' };
  }
  
  // Import performance data
  const performanceFile = path.join(PROCESSED_DIR, 'performance-processed.csv');
  if (await fs.pathExists(performanceFile)) {
    try {
      const performanceCount = await importPerformanceData(performanceFile);
      results.performance = {
        success: true,
        count: performanceCount,
        filepath: performanceFile
      };
    } catch (error) {
      log('❌ Failed to import performance data:', error.message, 'ERROR');
      results.performance = {
        success: false,
        error: error.message
      };
    }
  } else {
    log('⚠️  Performance processed file not found');
    results.performance = { error: 'File not found' };
  }
  
  // Update database statistics
  await updateDatabaseStats();
  
  // Log results
  const logEntry = {
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      totalImported: Object.values(results)
        .filter(r => r.success)
        .reduce((sum, r) => sum + r.count, 0),
      successful: Object.values(results).filter(r => r.success).length,
      failed: Object.values(results).filter(r => !r.success).length
    }
  };
  
  await fs.appendFile(logFile, JSON.stringify(logEntry, null, 2) + '\n');
  
  log('\n📊 Import Summary:');
  log(`   Total imported: ${logEntry.summary.totalImported}`);
  log(`   Successful imports: ${logEntry.summary.successful}`);
  log(`   Failed imports: ${logEntry.summary.failed}`);
  log(`   Log file: ${logFile}`);
  
  return results;
}

// Import specific data source
async function importSpecificData(sourceKey) {
  const filepath = path.join(PROCESSED_DIR, `${sourceKey}-processed.csv`);
  
  if (!await fs.pathExists(filepath)) {
    log(`Processed file not found: ${filepath}`, 'ERROR');
    return;
  }
  
  log(`🚀 Importing ${sourceKey} data...`);
  await ensureDirectories();
  
  try {
    let count;
    switch (sourceKey) {
      case 'schools':
        count = await importSchoolsData(filepath);
        break;
      case 'ofsted':
        count = await importOfstedData(filepath);
        break;
      case 'performance':
        count = await importPerformanceData(filepath);
        break;
      default:
        log(`Unknown data source: ${sourceKey}`, 'ERROR');
        return;
    }
    
    log(`✅ ${sourceKey} data imported successfully! (${count} records)`);
  } catch (error) {
    log(`❌ Failed to import ${sourceKey} data:`, error.message, 'ERROR');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'all':
      await importAllData();
      break;
    case 'schools':
      await importSpecificData('schools');
      break;
    case 'ofsted':
      await importSpecificData('ofsted');
      break;
    case 'performance':
      await importSpecificData('performance');
      break;
    case 'stats':
      await updateDatabaseStats();
      break;
    default:
      log('Usage: node data-importer.js <command>');
      log('Commands:');
      log('  all        - Import all data sources');
      log('  schools    - Import schools data only');
      log('  ofsted     - Import Ofsted data only');
      log('  performance - Import performance data only');
      log('  stats      - Update database statistics only');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { importAllData, importSpecificData, updateDatabaseStats };