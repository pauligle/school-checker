#!/usr/bin/env node

/**
 * CSV Pre-processor
 * Converts coordinates and cleans field names to create a fast-import-ready CSV
 */

const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const proj4 = require('proj4');

// Configuration
const INPUT_CSV = 'data/raw/edubasealldata20250905.csv';
const OUTPUT_CSV = 'data/processed/schools-clean.csv';
const BATCH_SIZE = 1000; // Process in batches to avoid memory issues

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_CSV);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Utility function to clean field names
function cleanFieldName(fieldName) {
  return fieldName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
}

// Utility function to convert British National Grid to WGS84 lat/lon
function convertBNGToWGS84(easting, northing) {
  if (!easting || !northing) return { lat: null, lon: null };
  
  try {
    // Define British National Grid projection
    const bng = '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs';
    
    // Define WGS84 projection
    const wgs84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';
    
    // Convert coordinates
    const [lon, lat] = proj4(bng, wgs84, [parseFloat(easting), parseFloat(northing)]);
    
    return { lat, lon };
  } catch (error) {
    console.warn(`Coordinate conversion failed for ${easting}, ${northing}:`, error.message);
    return { lat: null, lon: null };
  }
}

// Utility function to convert dates
function convertDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return null;
  
  // Handle DD-MM-YYYY format
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }
  
  return dateStr;
}

// Utility function to convert numbers
function convertNumber(numStr) {
  if (!numStr || numStr.trim() === '') return null;
  const num = parseFloat(numStr);
  return isNaN(num) ? null : num;
}

async function preprocessCSV() {
  console.log('🚀 Starting CSV Pre-processing...');
  console.log('================================');
  console.log(`📁 Input: ${INPUT_CSV}`);
  console.log(`📁 Output: ${OUTPUT_CSV}`);
  
  const schools = [];
  let totalProcessed = 0;
  let batchCount = 0;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(INPUT_CSV)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Convert coordinates
          const coords = convertBNGToWGS84(row.Easting, row.Northing);
          
          // Create clean school object with all fields
          const school = {};
          
          // Add all CSV fields with cleaned names
          Object.keys(row).forEach(key => {
            const cleanKey = cleanFieldName(key);
            let value = row[key];
            
            // Handle special conversions
            if (key === 'Easting' || key === 'Northing') {
              // Skip these as we'll use lat/lon instead
              return;
            }
            
            // Convert dates
            if (key.toLowerCase().includes('date') || key.toLowerCase().includes('insp')) {
              value = convertDate(value);
            }
            
            // Convert numbers
            if (key.toLowerCase().includes('number') || 
                key.toLowerCase().includes('age') || 
                key.toLowerCase().includes('capacity') ||
                key.toLowerCase().includes('percentage')) {
              value = convertNumber(value);
            }
            
            school[cleanKey] = value;
          });
          
          // Add converted coordinates
          school.lat = coords.lat;
          school.lon = coords.lon;
          
          // Add metadata
          school.import_date = new Date().toISOString();
          school.data_source = 'edubasealldata20250905.csv';
          
          schools.push(school);
          totalProcessed++;
          
          // Process in batches to avoid memory issues
          if (schools.length >= BATCH_SIZE) {
            batchCount++;
            console.log(`📊 Processed batch ${batchCount}: ${schools.length} schools (Total: ${totalProcessed})`);
            
            // Write batch to file
            writeBatch(schools, batchCount);
            schools.length = 0; // Clear array
          }
          
        } catch (error) {
          console.error('❌ Error processing row:', error);
        }
      })
      .on('end', async () => {
        try {
          // Write final batch
          if (schools.length > 0) {
            batchCount++;
            console.log(`📊 Processed final batch ${batchCount}: ${schools.length} schools`);
            await writeBatch(schools, batchCount);
          }
          
          // Combine all batches into final CSV
          await combineBatches(batchCount);
          
          console.log('✅ CSV Pre-processing completed successfully!');
          console.log(`📈 Total schools processed: ${totalProcessed}`);
          console.log(`📁 Clean CSV created: ${OUTPUT_CSV}`);
          
          resolve();
        } catch (error) {
          console.error('❌ Error in final processing:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        reject(error);
      });
  });
}

async function writeBatch(schools, batchNumber) {
  const batchFile = `${OUTPUT_CSV}.batch${batchNumber}`;
  
  if (schools.length === 0) return;
  
  // Get headers from first school
  const headers = Object.keys(schools[0]).map(key => ({
    id: key,
    title: key
  }));
  
  const csvWriter = createCsvWriter({
    path: batchFile,
    header: headers
  });
  
  await csvWriter.writeRecords(schools);
  console.log(`💾 Written batch ${batchNumber} to ${batchFile}`);
}

async function combineBatches(totalBatches) {
  console.log('🔄 Combining batches into final CSV...');
  
  const allSchools = [];
  
  // Read all batch files
  for (let i = 1; i <= totalBatches; i++) {
    const batchFile = `${OUTPUT_CSV}.batch${i}`;
    
    if (fs.existsSync(batchFile)) {
      const batchData = await new Promise((resolve, reject) => {
        const schools = [];
        fs.createReadStream(batchFile)
          .pipe(csv())
          .on('data', (row) => schools.push(row))
          .on('end', () => resolve(schools))
          .on('error', reject);
      });
      
      allSchools.push(...batchData);
      console.log(`📖 Read batch ${i}: ${batchData.length} schools`);
      
      // Clean up batch file
      fs.unlinkSync(batchFile);
    }
  }
  
  // Write final combined CSV
  if (allSchools.length > 0) {
    const headers = Object.keys(allSchools[0]).map(key => ({
      id: key,
      title: key
    }));
    
    const csvWriter = createCsvWriter({
      path: OUTPUT_CSV,
      header: headers
    });
    
    await csvWriter.writeRecords(allSchools);
    console.log(`✅ Final CSV created: ${OUTPUT_CSV} (${allSchools.length} schools)`);
  }
}

// Command line interface
async function main() {
  try {
    await preprocessCSV();
  } catch (error) {
    console.error('❌ Pre-processing failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { preprocessCSV };





