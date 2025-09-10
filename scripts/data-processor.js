#!/usr/bin/env node

/**
 * Data Processor for School Checker
 * Cleans, transforms, and standardizes raw CSV data
 */

const fs = require('fs-extra');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const proj4 = require('proj4');

// Configuration
const RAW_DIR = path.join(__dirname, '..', 'data', 'raw');
const PROCESSED_DIR = path.join(__dirname, '..', 'data', 'processed');
const LOG_DIR = path.join(__dirname, '..', 'logs');

// Field mappings for different data sources
const FIELD_MAPPINGS = {
  schools: {
    // Basic School Information
    'URN': 'urn',
    'LA (code)': 'la_code',
    'LA (name)': 'local_authority',
    'EstablishmentNumber': 'establishment_number',
    'EstablishmentName': 'name',
    'TypeOfEstablishment (code)': 'establishment_type_code',
    'TypeOfEstablishment (name)': 'establishment_type_name',
    'EstablishmentTypeGroup (code)': 'establishment_type_group_code',
    'EstablishmentTypeGroup (name)': 'establishment_type_group_name',
    'EstablishmentStatus (code)': 'establishment_status_code',
    'EstablishmentStatus (name)': 'establishment_status_name',
    
    // Opening/Closing Information
    'ReasonEstablishmentOpened (code)': 'reason_establishment_opened_code',
    'ReasonEstablishmentOpened (name)': 'reason_establishment_opened_name',
    'OpenDate': 'open_date',
    'ReasonEstablishmentClosed (code)': 'reason_establishment_closed_code',
    'ReasonEstablishmentClosed (name)': 'reason_establishment_closed_name',
    'CloseDate': 'close_date',
    
    // Educational Phase & Age Range
    'PhaseOfEducation (code)': 'phase_of_education_code',
    'PhaseOfEducation (name)': 'phase_of_education_name',
    'StatutoryLowAge': 'statutory_low_age',
    'StatutoryHighAge': 'statutory_high_age',
    
    // School Features
    'Boarders (code)': 'boarders_code',
    'Boarders (name)': 'boarders_name',
    'NurseryProvision (name)': 'nursery_provision_name',
    'OfficialSixthForm (code)': 'official_sixth_form_code',
    'OfficialSixthForm (name)': 'official_sixth_form_name',
    'Gender (code)': 'gender_code',
    'Gender (name)': 'gender_name',
    
    // Religious Character
    'ReligiousCharacter (code)': 'religious_character_code',
    'ReligiousCharacter (name)': 'religious_character_name',
    'ReligiousEthos (name)': 'religious_ethos_name',
    'Diocese (code)': 'diocese_code',
    'Diocese (name)': 'diocese_name',
    
    // Admissions & Capacity
    'AdmissionsPolicy (code)': 'admissions_policy_code',
    'AdmissionsPolicy (name)': 'admissions_policy_name',
    'SchoolCapacity': 'school_capacity',
    'SpecialClasses (code)': 'special_classes_code',
    'SpecialClasses (name)': 'special_classes_name',
    
    // Pupil Data
    'CensusDate': 'census_date',
    'NumberOfPupils': 'number_of_pupils',
    'NumberOfBoys': 'number_of_boys',
    'NumberOfGirls': 'number_of_girls',
    'PercentageFSM': 'percentage_fsm',
    'FSM': 'fsm',
    
    // Trust & Federation Information
    'TrustSchoolFlag (code)': 'trust_school_flag_code',
    'TrustSchoolFlag (name)': 'trust_school_flag_name',
    'Trusts (code)': 'trusts_code',
    'Trusts (name)': 'trusts_name',
    'SchoolSponsorFlag (name)': 'school_sponsor_flag_name',
    'SchoolSponsors (name)': 'school_sponsors_name',
    'FederationFlag (name)': 'federation_flag_name',
    'Federations (code)': 'federations_code',
    'Federations (name)': 'federations_name',
    
    // Special Educational Needs (SEN)
    'SEN1 (name)': 'sen1_name',
    'SEN2 (name)': 'sen2_name',
    'SEN3 (name)': 'sen3_name',
    'SEN4 (name)': 'sen4_name',
    'SEN5 (name)': 'sen5_name',
    'SEN6 (name)': 'sen6_name',
    'SEN7 (name)': 'sen7_name',
    'SEN8 (name)': 'sen8_name',
    'SEN9 (name)': 'sen9_name',
    'SEN10 (name)': 'sen10_name',
    'SEN11 (name)': 'sen11_name',
    'SEN12 (name)': 'sen12_name',
    'SEN13 (name)': 'sen13_name',
    'TypeOfResourcedProvision (name)': 'type_of_resourced_provision_name',
    'ResourcedProvisionOnRoll': 'resourced_provision_on_roll',
    'ResourcedProvisionCapacity': 'resourced_provision_capacity',
    'SenUnitOnRoll': 'sen_unit_on_roll',
    'SenUnitCapacity': 'sen_unit_capacity',
    'SENPRU (name)': 'senpru_name',
    'SENStat': 'sen_stat',
    'SENNoStat': 'sen_no_stat',
    
    // Geographic & Administrative
    'GOR (code)': 'gor_code',
    'GOR (name)': 'gor_name',
    'DistrictAdministrative (code)': 'district_administrative_code',
    'DistrictAdministrative (name)': 'district_administrative_name',
    'AdministrativeWard (code)': 'administrative_ward_code',
    'AdministrativeWard (name)': 'administrative_ward_name',
    'ParliamentaryConstituency (code)': 'parliamentary_constituency_code',
    'ParliamentaryConstituency (name)': 'parliamentary_constituency_name',
    'UrbanRural (code)': 'urban_rural_code',
    'UrbanRural (name)': 'urban_rural_name',
    'GSSLACode (name)': 'gssla_code_name',
    'Easting': 'easting',
    'Northing': 'northing',
    'MSOA (name)': 'msoa_name',
    'LSOA (name)': 'lsoa_name',
    'MSOA (code)': 'msoa_code',
    'LSOA (code)': 'lsoa_code',
    
    // Ofsted & Inspection
    'InspectorateName (name)': 'inspectorate_name_name',
    'OfstedRating (name)': 'ofsted_rating_name',
    'OfstedLastInsp': 'ofsted_last_insp',
    'OfstedSpecialMeasures (code)': 'ofsted_special_measures_code',
    'OfstedSpecialMeasures (name)': 'ofsted_special_measures_name',
    'DateOfLastInspectionVisit': 'date_of_last_inspection_visit',
    'NextInspectionVisit': 'next_inspection_visit',
    
    // Additional Information
    'BoardingEstablishment (name)': 'boarding_establishment_name',
    'PropsName': 'props_name',
    'PreviousLA (code)': 'previous_la_code',
    'PreviousLA (name)': 'previous_la_name',
    'PreviousEstablishmentNumber': 'previous_establishment_number',
    'Country (name)': 'country_name',
    'UPRN': 'uprn',
    'SiteName': 'site_name',
    'QABName (code)': 'qab_name_code',
    'QABName (name)': 'qab_name_name',
    'EstablishmentAccredited (code)': 'establishment_accredited_code',
    'EstablishmentAccredited (name)': 'establishment_accredited_name',
    'QABReport': 'qab_report',
    'CHNumber': 'ch_number',
    'AccreditationExpiryDate': 'accreditation_expiry_date',
    
    // Timestamps & Metadata
    'LastChangedDate': 'last_changed_date',
    
    // Legacy fields (keeping for backward compatibility)
    'Street': 'address',
    'Postcode': 'postcode',
    'TelephoneNum': 'phone',
    'SchoolWebsite': 'website',
    'HeadTitle (name)': 'headteacher_title',
    'HeadFirstName': 'headteacher_first_name',
    'HeadLastName': 'headteacher_last_name',
    'HeadPreferredJobTitle': 'headteacher_preferred_title'
  },
  ofsted: {
    // Ofsted inspection fields
    'URN': 'urn',
    'InspectionDate': 'inspection_date',
    'OverallEffectiveness': 'overall_rating',
    'PreviousOverallEffectiveness': 'previous_rating',
    'QualityOfEducation': 'quality_of_education',
    'BehaviourAndAttitudes': 'behaviour_attitudes',
    'PersonalDevelopment': 'personal_development',
    'LeadershipAndManagement': 'leadership_management',
    'InspectionType': 'inspection_type',
    'LeadInspector': 'inspector_name'
  },
  performance: {
    // Performance tables fields
    'URN': 'urn',
    'SchoolName': 'school_name',
    'ProgressScore': 'progress_score',
    'AttainmentScore': 'attainment_score',
    'DisadvantagedProgress': 'disadvantaged_progress',
    'DisadvantagedAttainment': 'disadvantaged_attainment',
    'Year': 'year'
  }
};

// Data cleaning functions
const cleaners = {
  urn: (value) => {
    if (!value || value === 'NULL' || value === '') return null;
    return value.toString().trim();
  },
  
  name: (value) => {
    if (!value || value === 'NULL' || value === '') return null;
    return value.toString().trim().replace(/\s+/g, ' ');
  },
  
  coordinate: (value) => {
    if (!value || value === 'NULL' || value === '') return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  },
  
  number: (value) => {
    if (!value || value === 'NULL' || value === '') return null;
    const num = parseInt(value);
    return isNaN(num) ? null : num;
  },
  
  decimal: (value) => {
    if (!value || value === 'NULL' || value === '') return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  },
  
  text: (value) => {
    if (!value || value === 'NULL' || value === '') return null;
    return value.toString().trim();
  },
  
  date: (value) => {
    if (!value || value === 'NULL' || value === '') return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  }
};

// Utility functions
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
  
  const logFile = path.join(LOG_DIR, `data-processor-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
}

async function ensureDirectories() {
  await fs.ensureDir(PROCESSED_DIR);
  await fs.ensureDir(LOG_DIR);
  log('Directories ensured');
}

function cleanRecord(record, mapping, cleaners) {
  const cleaned = {};
  
  for (const [sourceField, targetField] of Object.entries(mapping)) {
    const value = record[sourceField];
    
    // Apply appropriate cleaner based on field type
    if (targetField.includes('lat') || targetField.includes('lon') || 
        targetField.includes('easting') || targetField.includes('northing')) {
      cleaned[targetField] = cleaners.coordinate(value);
    } else if (targetField.includes('date')) {
      cleaned[targetField] = cleaners.date(value);
    } else if (targetField.includes('percentage')) {
      cleaned[targetField] = cleaners.decimal(value);
    } else if (targetField.includes('pupils') || targetField.includes('capacity') || 
               targetField.includes('age') || targetField.includes('stat') || 
               targetField.includes('roll') || targetField.includes('code')) {
      cleaned[targetField] = cleaners.number(value);
    } else if (targetField === 'urn') {
      cleaned[targetField] = cleaners.urn(value);
    } else if (targetField === 'name') {
      cleaned[targetField] = cleaners.name(value);
    } else {
      cleaned[targetField] = cleaners.text(value);
    }
  }
  
  // Convert Easting/Northing to Lat/Lon for schools
  if (cleaned.easting && cleaned.northing) {
    const coords = convertEastingNorthingToLatLon(cleaned.easting, cleaned.northing);
    cleaned.lat = coords.lat;
    cleaned.lon = coords.lon;
  }
  // Keep easting/northing fields for database storage
  
  return cleaned;
}

// Convert British National Grid (Easting/Northing) to WGS84 (Lat/Lon)
function convertEastingNorthingToLatLon(easting, northing) {
  // Check for valid numeric values
  if (!easting || !northing || isNaN(easting) || isNaN(northing) || 
      !isFinite(easting) || !isFinite(northing)) {
    return { lat: null, lon: null };
  }
  
  // Define the British National Grid projection
  const bng = '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs';
  const wgs84 = '+proj=longlat +datum=WGS84 +no_defs';
  
  try {
    const [lon, lat] = proj4(bng, wgs84, [parseFloat(easting), parseFloat(northing)]);
    
    // Check if the converted coordinates are valid
    if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) {
      return { lat: null, lon: null };
    }
    
    return {
      lat: parseFloat(lat.toFixed(6)),
      lon: parseFloat(lon.toFixed(6))
    };
  } catch (error) {
    return { lat: null, lon: null };
  }
}

async function processSchoolsData() {
  log('Processing schools data');
  
  const inputFile = path.join(RAW_DIR, 'schools.csv');
  const outputFile = path.join(PROCESSED_DIR, 'schools-processed.csv');
  
  if (!await fs.pathExists(inputFile)) {
    log('Schools input file not found', 'ERROR');
    return { processed: 0, errors: 0 };
  }
  
  const records = [];
  let processed = 0;
  let errors = 0;
  
  return new Promise((resolve) => {
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const cleaned = cleanRecord(row, FIELD_MAPPINGS.schools, cleaners);
          
          // Filter out records without essential data
          if (cleaned.urn && cleaned.name && cleaned.lat && cleaned.lon) {
            records.push(cleaned);
            processed++;
          } else {
            errors++;
          }
        } catch (error) {
          errors++;
          log(`Error processing schools record: ${error.message}`, 'ERROR');
        }
      })
      .on('end', async () => {
        try {
          // Create CSV writer with all field headers (including dynamically added fields)
          const allFields = new Set();
          records.forEach(record => {
            Object.keys(record).forEach(key => allFields.add(key));
          });
          
          const headers = Array.from(allFields).map(field => ({ 
            id: field, 
            title: field 
          }));
          
          const csvWriter = createCsvWriter({
            path: outputFile,
            header: headers
          });
          
          await csvWriter.writeRecords(records);
          log(`Schools processing completed: ${processed} records, ${errors} errors`);
          resolve({ processed, errors });
        } catch (error) {
          log(`Error writing schools output: ${error.message}`, 'ERROR');
          resolve({ processed: 0, errors: processed + errors });
        }
      });
  });
}

async function processOfstedData() {
  log('Processing Ofsted data');
  
  const inputFile = path.join(RAW_DIR, 'ofsted-inspections.csv');
  const outputFile = path.join(PROCESSED_DIR, 'ofsted-processed.csv');
  
  if (!await fs.pathExists(inputFile)) {
    log('Ofsted input file not found', 'ERROR');
    return { processed: 0, errors: 0 };
  }
  
  const records = [];
  let processed = 0;
  let errors = 0;
  
  return new Promise((resolve) => {
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const cleaned = cleanRecord(row, FIELD_MAPPINGS.ofsted, cleaners);
          
          // Filter out records without essential data
          if (cleaned.urn && cleaned.inspection_date && cleaned.overall_rating) {
            records.push(cleaned);
            processed++;
          } else {
            errors++;
          }
        } catch (error) {
          errors++;
          log(`Error processing Ofsted record: ${error.message}`, 'ERROR');
        }
      })
      .on('end', async () => {
        try {
          const csvWriter = createCsvWriter({
            path: outputFile,
            header: Object.values(FIELD_MAPPINGS.ofsted).map(field => ({ id: field, title: field }))
          });
          
          await csvWriter.writeRecords(records);
          log(`Ofsted processing completed: ${processed} records, ${errors} errors`);
          resolve({ processed, errors });
        } catch (error) {
          log(`Error writing Ofsted output: ${error.message}`, 'ERROR');
          resolve({ processed: 0, errors: processed + errors });
        }
      });
  });
}

async function processPerformanceData() {
  log('Processing performance data');
  
  const inputFile = path.join(RAW_DIR, 'performance-tables.csv');
  const outputFile = path.join(PROCESSED_DIR, 'performance-processed.csv');
  
  if (!await fs.pathExists(inputFile)) {
    log('Performance input file not found', 'ERROR');
    return { processed: 0, errors: 0 };
  }
  
  const records = [];
  let processed = 0;
  let errors = 0;
  
  return new Promise((resolve) => {
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const cleaned = cleanRecord(row, FIELD_MAPPINGS.performance, cleaners);
          
          // Filter out records without essential data
          if (cleaned.urn && cleaned.year) {
            records.push(cleaned);
            processed++;
          } else {
            errors++;
          }
        } catch (error) {
          errors++;
          log(`Error processing performance record: ${error.message}`, 'ERROR');
        }
      })
      .on('end', async () => {
        try {
          const csvWriter = createCsvWriter({
            path: outputFile,
            header: Object.values(FIELD_MAPPINGS.performance).map(field => ({ id: field, title: field }))
          });
          
          await csvWriter.writeRecords(records);
          log(`Performance processing completed: ${processed} records, ${errors} errors`);
          resolve({ processed, errors });
        } catch (error) {
          log(`Error writing performance output: ${error.message}`, 'ERROR');
          resolve({ processed: 0, errors: processed + errors });
        }
      });
  });
}

async function processAllData() {
  log('Starting data processing for all sources');
  await ensureDirectories();
  
  const results = {
    schools: await processSchoolsData(),
    ofsted: await processOfstedData(),
    performance: await processPerformanceData()
  };
  
  const totalProcessed = Object.values(results).reduce((sum, r) => sum + r.processed, 0);
  const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errors, 0);
  
  log(`All data processing completed. Total processed: ${totalProcessed}, Total errors: ${totalErrors}`);
  return results;
}

async function processSpecificData(dataType) {
  log(`Processing specific data type: ${dataType}`);
  await ensureDirectories();
  
  switch (dataType) {
    case 'schools':
      return await processSchoolsData();
    case 'ofsted':
      return await processOfstedData();
    case 'performance':
      return await processPerformanceData();
    default:
      log(`Unknown data type: ${dataType}`, 'ERROR');
      return null;
  }
}

async function checkProcessedData() {
  log('Checking processed data status');
  await ensureDirectories();
  
  const status = {};
  const dataTypes = ['schools', 'ofsted', 'performance'];
  
  for (const dataType of dataTypes) {
    const filepath = path.join(PROCESSED_DIR, `${dataType}-processed.csv`);
    
    try {
      const exists = await fs.pathExists(filepath);
      if (exists) {
        const stats = await fs.stat(filepath);
        status[dataType] = {
          exists: true,
          size: stats.size,
          lastModified: stats.mtime,
          age: Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24))
        };
      } else {
        status[dataType] = { exists: false };
      }
    } catch (error) {
      status[dataType] = { error: error.message };
    }
  }
  
  return status;
}

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'process-all':
      await processAllData();
      break;
      
    case 'process':
      const dataType = args[0];
      if (!dataType) {
        log('Usage: node data-processor.js process <data-type>', 'ERROR');
        log('Available types: schools, ofsted, performance');
        process.exit(1);
      }
      await processSpecificData(dataType);
      break;
      
    case 'status':
      const status = await checkProcessedData();
      console.log(JSON.stringify(status, null, 2));
      break;
      
    default:
      console.log('School Checker Data Processor');
      console.log('');
      console.log('Usage:');
      console.log('  node data-processor.js process-all        # Process all data types');
      console.log('  node data-processor.js process <type>       # Process specific type');
      console.log('  node data-processor.js status              # Check processed data status');
      console.log('');
      console.log('Available types: schools, ofsted, performance');
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    log(`Fatal error: ${error.message}`, 'ERROR');
    process.exit(1);
  });
}

module.exports = {
  processAllData,
  processSpecificData,
  checkProcessedData,
  FIELD_MAPPINGS
};
