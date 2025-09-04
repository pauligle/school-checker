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

// Batch size for database operations
const BATCH_SIZE = 1000;

// Ensure directories exist
async function ensureDirectories() {
  await fs.ensureDir(PROCESSED_DIR);
  await fs.ensureDir(LOG_DIR);
}

// Import schools data
async function importSchoolsData(csvFilePath) {
  console.log('🔄 Importing schools data...');
  
  const schools = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        const school = {
          urn: row.urn,
          name: row.name,
          lat: parseFloat(row.lat),
          lon: parseFloat(row.lon),
          school_type: row.school_type,
          phase: row.phase,
          local_authority: row.local_authority,
          total_pupils: row.total_pupils ? parseInt(row.total_pupils) : null,
          gender: row.gender,
          age_range: row.age_range,
          capacity: row.capacity ? parseInt(row.capacity) : null,
          address: row.address,
          postcode: row.postcode,
          phone: row.phone,
          website: row.website,
          headteacher: row.headteacher,
          status: row.status,
          updated_at: new Date().toISOString()
        };
        
        if (school.urn && school.name && !isNaN(school.lat) && !isNaN(school.lon)) {
          schools.push(school);
        }
      })
      .on('end', async () => {
        try {
          console.log(`📊 Found ${schools.length} schools to import`);
          
          // Import in batches
          let imported = 0;
          for (let i = 0; i < schools.length; i += BATCH_SIZE) {
            const batch = schools.slice(i, i + BATCH_SIZE);
            
            const { data, error } = await supabase
              .from('schools')
              .upsert(batch, { 
                onConflict: 'urn',
                ignoreDuplicates: false
              });
            
            if (error) {
              console.error('Error inserting batch:', error);
              reject(error);
              return;
            }
            
            imported += batch.length;
            console.log(`✅ Imported batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(schools.length / BATCH_SIZE)} (${imported}/${schools.length})`);
          }
          
          console.log('✅ Schools data imported successfully!');
          resolve(schools.length);
        } catch (error) {
          console.error('Error during import:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

// Import Ofsted inspections data
async function importOfstedData(csvFilePath) {
  console.log('🔄 Importing Ofsted inspections data...');
  
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
          console.log(`📊 Found ${inspections.length} inspections to import`);
          
          // Import in batches
          let imported = 0;
          for (let i = 0; i < inspections.length; i += BATCH_SIZE) {
            const batch = inspections.slice(i, i + BATCH_SIZE);
            
            const { data, error } = await supabase
              .from('inspections')
              .upsert(batch, { 
                onConflict: 'urn,inspection_date',
                ignoreDuplicates: false
              });
            
            if (error) {
              console.error('Error inserting batch:', error);
              reject(error);
              return;
            }
            
            imported += batch.length;
            console.log(`✅ Imported batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(inspections.length / BATCH_SIZE)} (${imported}/${inspections.length})`);
          }
          
          console.log('✅ Ofsted inspections data imported successfully!');
          resolve(inspections.length);
        } catch (error) {
          console.error('Error during import:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

// Import performance data
async function importPerformanceData(csvFilePath) {
  console.log('🔄 Importing performance data...');
  
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
          console.log(`📊 Found ${performance.length} performance records to import`);
          
          // Import in batches
          let imported = 0;
          for (let i = 0; i < performance.length; i += BATCH_SIZE) {
            const batch = performance.slice(i, i + BATCH_SIZE);
            
            const { data, error } = await supabase
              .from('performance')
              .upsert(batch, { 
                onConflict: 'urn,year',
                ignoreDuplicates: false
              });
            
            if (error) {
              console.error('Error inserting batch:', error);
              reject(error);
              return;
            }
            
            imported += batch.length;
            console.log(`✅ Imported batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(performance.length / BATCH_SIZE)} (${imported}/${performance.length})`);
          }
          
          console.log('✅ Performance data imported successfully!');
          resolve(performance.length);
        } catch (error) {
          console.error('Error during import:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

// Update database statistics
async function updateDatabaseStats() {
  console.log('📊 Updating database statistics...');
  
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
    
    console.log('✅ Database statistics updated:');
    console.log(`   Schools: ${schoolsCount || 0}`);
    console.log(`   Inspections: ${inspectionsCount || 0}`);
    console.log(`   Performance: ${performanceCount || 0}`);
    
  } catch (error) {
    console.error('Error updating database stats:', error);
  }
}

// Main import function
async function importAllData() {
  console.log('🚀 Starting data import process...');
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log('=' * 50);
  
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
      console.error('❌ Failed to import schools:', error.message);
      results.schools = {
        success: false,
        error: error.message
      };
    }
  } else {
    console.log('⚠️  Schools processed file not found');
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
      console.error('❌ Failed to import Ofsted data:', error.message);
      results.ofsted = {
        success: false,
        error: error.message
      };
    }
  } else {
    console.log('⚠️  Ofsted processed file not found');
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
      console.error('❌ Failed to import performance data:', error.message);
      results.performance = {
        success: false,
        error: error.message
      };
    }
  } else {
    console.log('⚠️  Performance processed file not found');
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
  
  console.log('\n📊 Import Summary:');
  console.log(`   Total imported: ${logEntry.summary.totalImported}`);
  console.log(`   Successful imports: ${logEntry.summary.successful}`);
  console.log(`   Failed imports: ${logEntry.summary.failed}`);
  console.log(`   Log file: ${logFile}`);
  
  return results;
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
      console.log('Usage: node data-importer.js <command>');
      console.log('Commands:');
      console.log('  all        - Import all data sources');
      console.log('  schools    - Import schools data only');
      console.log('  ofsted     - Import Ofsted data only');
      console.log('  performance - Import performance data only');
      console.log('  stats      - Update database statistics only');
  }
}

// Import specific data source
async function importSpecificData(sourceKey) {
  const filepath = path.join(PROCESSED_DIR, `${sourceKey}-processed.csv`);
  
  if (!await fs.pathExists(filepath)) {
    console.error(`Processed file not found: ${filepath}`);
    return;
  }
  
  console.log(`🚀 Importing ${sourceKey} data...`);
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
        console.error(`Unknown data source: ${sourceKey}`);
        return;
    }
    
    console.log(`✅ ${sourceKey} data imported successfully! (${count} records)`);
  } catch (error) {
    console.error(`❌ Failed to import ${sourceKey} data:`, error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { importAllData, importSpecificData, updateDatabaseStats };
