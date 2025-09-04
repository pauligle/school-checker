const fs = require('fs-extra');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Configuration
const DATA_DIR = path.join(__dirname, '../data');
const PROCESSED_DIR = path.join(__dirname, '../data/processed');
const LOG_DIR = path.join(__dirname, '../logs');

// Field mappings for different data sources
const FIELD_MAPPINGS = {
  schools: {
    // GIAS (Get Information about Schools) field mappings
    urn: ['URN', 'urn', 'EstablishmentNumber'],
    name: ['EstablishmentName', 'SchoolName', 'name'],
    lat: ['Latitude', 'lat', 'Lat'],
    lon: ['Longitude', 'lon', 'Lon'],
    schoolType: ['EstablishmentTypeGroup', 'SchoolType', 'Type'],
    phase: ['PhaseOfEducation', 'Phase', 'EducationPhase'],
    localAuthority: ['LocalAuthorityName', 'LocalAuthority', 'LA'],
    totalPupils: ['NumberOfPupils', 'TotalPupils', 'Pupils'],
    gender: ['Gender', 'Sex'],
    ageRange: ['AgeRange', 'AgeRangeLow', 'AgeRangeHigh'],
    capacity: ['SchoolCapacity', 'Capacity'],
    address: ['Street', 'Address', 'FullAddress'],
    postcode: ['Postcode', 'PostCode'],
    phone: ['TelephoneNum', 'Phone', 'Telephone'],
    website: ['SchoolWebsite', 'Website', 'URL'],
    headteacher: ['HeadTitle', 'HeadFirstName', 'HeadLastName'],
    status: ['EstablishmentStatus', 'Status']
  },
  ofsted: {
    // Ofsted inspection field mappings
    urn: ['URN', 'urn', 'EstablishmentNumber'],
    inspectionDate: ['InspectionDate', 'Date', 'Inspection_Date'],
    overallRating: ['OverallEffectiveness', 'OverallRating', 'Rating'],
    previousRating: ['PreviousOverallEffectiveness', 'PreviousRating'],
    qualityOfEducation: ['QualityOfEducation', 'Quality'],
    behaviourAttitudes: ['BehaviourAndAttitudes', 'Behaviour'],
    personalDevelopment: ['PersonalDevelopment', 'Personal'],
    leadershipManagement: ['LeadershipAndManagement', 'Leadership'],
    inspectionType: ['InspectionType', 'Type'],
    inspectorName: ['InspectorName', 'Inspector']
  },
  performance: {
    // Performance tables field mappings
    urn: ['URN', 'urn', 'EstablishmentNumber'],
    schoolName: ['SchoolName', 'name'],
    progressScore: ['ProgressScore', 'Progress'],
    attainmentScore: ['AttainmentScore', 'Attainment'],
    disadvantagedProgress: ['DisadvantagedProgress', 'Disadvantaged'],
    disadvantagedAttainment: ['DisadvantagedAttainment'],
    year: ['Year', 'AcademicYear']
  }
};

// Data cleaning functions
const cleaners = {
  // Clean URN (must be numeric)
  urn: (value) => {
    if (!value) return null;
    const cleaned = value.toString().replace(/[^0-9]/g, '');
    return cleaned.length > 0 ? cleaned : null;
  },
  
  // Clean school name
  name: (value) => {
    if (!value) return null;
    return value.toString().trim().replace(/\s+/g, ' ');
  },
  
  // Clean coordinates
  coordinate: (value) => {
    if (!value) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  },
  
  // Clean numeric values
  number: (value) => {
    if (!value) return null;
    const num = parseInt(value.toString().replace(/[^0-9-]/g, ''));
    return isNaN(num) ? null : num;
  },
  
  // Clean text
  text: (value) => {
    if (!value) return null;
    return value.toString().trim();
  },
  
  // Clean date
  date: (value) => {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  }
};

// Ensure directories exist
async function ensureDirectories() {
  await fs.ensureDir(DATA_DIR);
  await fs.ensureDir(PROCESSED_DIR);
  await fs.ensureDir(LOG_DIR);
}

// Find the correct field name from possible mappings
function findField(row, possibleNames) {
  for (const name of possibleNames) {
    if (row.hasOwnProperty(name)) {
      return row[name];
    }
  }
  return null;
}

// Process schools data
async function processSchoolsData(inputFile) {
  console.log('🔄 Processing schools data...');
  
  const schools = [];
  const errors = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const school = {
            urn: cleaners.urn(findField(row, FIELD_MAPPINGS.schools.urn)),
            name: cleaners.name(findField(row, FIELD_MAPPINGS.schools.name)),
            lat: cleaners.coordinate(findField(row, FIELD_MAPPINGS.schools.lat)),
            lon: cleaners.coordinate(findField(row, FIELD_MAPPINGS.schools.lon)),
            school_type: cleaners.text(findField(row, FIELD_MAPPINGS.schools.schoolType)),
            phase: cleaners.text(findField(row, FIELD_MAPPINGS.schools.phase)),
            local_authority: cleaners.text(findField(row, FIELD_MAPPINGS.schools.localAuthority)),
            total_pupils: cleaners.number(findField(row, FIELD_MAPPINGS.schools.totalPupils)),
            gender: cleaners.text(findField(row, FIELD_MAPPINGS.schools.gender)),
            age_range: cleaners.text(findField(row, FIELD_MAPPINGS.schools.ageRange)),
            capacity: cleaners.number(findField(row, FIELD_MAPPINGS.schools.capacity)),
            address: cleaners.text(findField(row, FIELD_MAPPINGS.schools.address)),
            postcode: cleaners.text(findField(row, FIELD_MAPPINGS.schools.postcode)),
            phone: cleaners.text(findField(row, FIELD_MAPPINGS.schools.phone)),
            website: cleaners.text(findField(row, FIELD_MAPPINGS.schools.website)),
            headteacher: cleaners.text(findField(row, FIELD_MAPPINGS.schools.headteacher)),
            status: cleaners.text(findField(row, FIELD_MAPPINGS.schools.status))
          };
          
          // Only include schools with required fields
          if (school.urn && school.name && school.lat && school.lon) {
            schools.push(school);
          } else {
            errors.push({
              row: row,
              reason: 'Missing required fields (URN, name, lat, lon)',
              data: school
            });
          }
        } catch (error) {
          errors.push({
            row: row,
            reason: error.message
          });
        }
      })
      .on('end', () => {
        console.log(`✅ Processed ${schools.length} schools`);
        console.log(`⚠️  Skipped ${errors.length} rows due to errors`);
        resolve({ schools, errors });
      })
      .on('error', reject);
  });
}

// Process Ofsted inspections data
async function processOfstedData(inputFile) {
  console.log('🔄 Processing Ofsted inspections data...');
  
  const inspections = [];
  const errors = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const inspection = {
            urn: cleaners.urn(findField(row, FIELD_MAPPINGS.ofsted.urn)),
            inspection_date: cleaners.date(findField(row, FIELD_MAPPINGS.ofsted.inspectionDate)),
            overall_rating: cleaners.text(findField(row, FIELD_MAPPINGS.ofsted.overallRating)),
            previous_rating: cleaners.text(findField(row, FIELD_MAPPINGS.ofsted.previousRating)),
            quality_of_education: cleaners.text(findField(row, FIELD_MAPPINGS.ofsted.qualityOfEducation)),
            behaviour_attitudes: cleaners.text(findField(row, FIELD_MAPPINGS.ofsted.behaviourAttitudes)),
            personal_development: cleaners.text(findField(row, FIELD_MAPPINGS.ofsted.personalDevelopment)),
            leadership_management: cleaners.text(findField(row, FIELD_MAPPINGS.ofsted.leadershipManagement)),
            inspection_type: cleaners.text(findField(row, FIELD_MAPPINGS.ofsted.inspectionType)),
            inspector_name: cleaners.text(findField(row, FIELD_MAPPINGS.ofsted.inspectorName))
          };
          
          // Only include inspections with required fields
          if (inspection.urn && inspection.inspection_date) {
            inspections.push(inspection);
          } else {
            errors.push({
              row: row,
              reason: 'Missing required fields (URN, inspection_date)',
              data: inspection
            });
          }
        } catch (error) {
          errors.push({
            row: row,
            reason: error.message
          });
        }
      })
      .on('end', () => {
        console.log(`✅ Processed ${inspections.length} inspections`);
        console.log(`⚠️  Skipped ${errors.length} rows due to errors`);
        resolve({ inspections, errors });
      })
      .on('error', reject);
  });
}

// Process performance data
async function processPerformanceData(inputFile) {
  console.log('🔄 Processing performance data...');
  
  const performance = [];
  const errors = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const perf = {
            urn: cleaners.urn(findField(row, FIELD_MAPPINGS.performance.urn)),
            school_name: cleaners.name(findField(row, FIELD_MAPPINGS.performance.schoolName)),
            progress_score: cleaners.number(findField(row, FIELD_MAPPINGS.performance.progressScore)),
            attainment_score: cleaners.number(findField(row, FIELD_MAPPINGS.performance.attainmentScore)),
            disadvantaged_progress: cleaners.number(findField(row, FIELD_MAPPINGS.performance.disadvantagedProgress)),
            disadvantaged_attainment: cleaners.number(findField(row, FIELD_MAPPINGS.performance.disadvantagedAttainment)),
            year: cleaners.number(findField(row, FIELD_MAPPINGS.performance.year))
          };
          
          // Only include performance data with required fields
          if (perf.urn && perf.year) {
            performance.push(perf);
          } else {
            errors.push({
              row: row,
              reason: 'Missing required fields (URN, year)',
              data: perf
            });
          }
        } catch (error) {
          errors.push({
            row: row,
            reason: error.message
          });
        }
      })
      .on('end', () => {
        console.log(`✅ Processed ${performance.length} performance records`);
        console.log(`⚠️  Skipped ${errors.length} rows due to errors`);
        resolve({ performance, errors });
      })
      .on('error', reject);
  });
}

// Write processed data to CSV
async function writeProcessedData(data, filename) {
  const filepath = path.join(PROCESSED_DIR, filename);
  
  if (data.length === 0) {
    console.log(`⚠️  No data to write for ${filename}`);
    return;
  }
  
  const headers = Object.keys(data[0]).map(key => ({
    id: key,
    title: key
  }));
  
  const csvWriter = createCsvWriter({
    path: filepath,
    header: headers
  });
  
  await csvWriter.writeRecords(data);
  console.log(`✅ Written ${data.length} records to ${filename}`);
}

// Main processing function
async function processAllData() {
  console.log('🚀 Starting data processing...');
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log('=' * 50);
  
  await ensureDirectories();
  
  const results = {};
  const logFile = path.join(LOG_DIR, `process-${new Date().toISOString().split('T')[0]}.log`);
  
  // Process schools data
  const schoolsFile = path.join(DATA_DIR, 'schools.csv');
  if (await fs.pathExists(schoolsFile)) {
    const schoolsResult = await processSchoolsData(schoolsFile);
    await writeProcessedData(schoolsResult.schools, 'schools-processed.csv');
    results.schools = {
      processed: schoolsResult.schools.length,
      errors: schoolsResult.errors.length,
      filepath: path.join(PROCESSED_DIR, 'schools-processed.csv')
    };
  } else {
    console.log('⚠️  Schools data file not found');
    results.schools = { error: 'File not found' };
  }
  
  // Process Ofsted data
  const ofstedFile = path.join(DATA_DIR, 'ofsted-inspections.csv');
  if (await fs.pathExists(ofstedFile)) {
    const ofstedResult = await processOfstedData(ofstedFile);
    await writeProcessedData(ofstedResult.inspections, 'ofsted-processed.csv');
    results.ofsted = {
      processed: ofstedResult.inspections.length,
      errors: ofstedResult.errors.length,
      filepath: path.join(PROCESSED_DIR, 'ofsted-processed.csv')
    };
  } else {
    console.log('⚠️  Ofsted data file not found');
    results.ofsted = { error: 'File not found' };
  }
  
  // Process performance data
  const performanceFile = path.join(DATA_DIR, 'performance-tables.csv');
  if (await fs.pathExists(performanceFile)) {
    const performanceResult = await processPerformanceData(performanceFile);
    await writeProcessedData(performanceResult.performance, 'performance-processed.csv');
    results.performance = {
      processed: performanceResult.performance.length,
      errors: performanceResult.errors.length,
      filepath: path.join(PROCESSED_DIR, 'performance-processed.csv')
    };
  } else {
    console.log('⚠️  Performance data file not found');
    results.performance = { error: 'File not found' };
  }
  
  // Log results
  const logEntry = {
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      totalProcessed: Object.values(results)
        .filter(r => r.processed)
        .reduce((sum, r) => sum + r.processed, 0),
      totalErrors: Object.values(results)
        .filter(r => r.errors)
        .reduce((sum, r) => sum + r.errors, 0)
    }
  };
  
  await fs.appendFile(logFile, JSON.stringify(logEntry, null, 2) + '\n');
  
  console.log('\n📊 Processing Summary:');
  console.log(`   Total processed: ${logEntry.summary.totalProcessed}`);
  console.log(`   Total errors: ${logEntry.summary.totalErrors}`);
  console.log(`   Log file: ${logFile}`);
  
  return results;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'all':
      await processAllData();
      break;
    case 'schools':
      await processSpecificData('schools');
      break;
    case 'ofsted':
      await processSpecificData('ofsted');
      break;
    case 'performance':
      await processSpecificData('performance');
      break;
    default:
      console.log('Usage: node data-processor.js <command>');
      console.log('Commands:');
      console.log('  all        - Process all data sources');
      console.log('  schools    - Process schools data only');
      console.log('  ofsted     - Process Ofsted data only');
      console.log('  performance - Process performance data only');
  }
}

// Process specific data source
async function processSpecificData(sourceKey) {
  const inputFile = path.join(DATA_DIR, `${sourceKey}.csv`);
  
  if (!await fs.pathExists(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    return;
  }
  
  console.log(`🚀 Processing ${sourceKey} data...`);
  await ensureDirectories();
  
  let result;
  switch (sourceKey) {
    case 'schools':
      result = await processSchoolsData(inputFile);
      await writeProcessedData(result.schools, 'schools-processed.csv');
      break;
    case 'ofsted':
      result = await processOfstedData(inputFile);
      await writeProcessedData(result.inspections, 'ofsted-processed.csv');
      break;
    case 'performance':
      result = await processPerformanceData(inputFile);
      await writeProcessedData(result.performance, 'performance-processed.csv');
      break;
    default:
      console.error(`Unknown data source: ${sourceKey}`);
      return;
  }
  
  console.log(`✅ ${sourceKey} data processed successfully!`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processAllData, processSpecificData };
