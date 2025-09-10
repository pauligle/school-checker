const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const proj4 = require('proj4');

// British National Grid to WGS84 conversion
proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

class CSVProcessor {
  constructor() {
    this.processedCount = 0;
    this.errorCount = 0;
  }

  async processCSV(inputPath, outputPath) {
    console.log(`📄 Processing CSV: ${inputPath}`);
    
    const schools = [];
    
    // Read CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(inputPath)
        .pipe(csv())
        .on('data', (row) => {
          schools.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📊 Found ${schools.length} schools`);

    // Process each school
    const processedSchools = schools.map(school => this.processSchool(school));
    
    // Write processed CSV
    await this.writeCSV(processedSchools, outputPath);
    
    console.log(`✅ Processed ${this.processedCount} schools successfully`);
    if (this.errorCount > 0) {
      console.log(`⚠️ ${this.errorCount} schools had coordinate conversion errors`);
    }
  }

  processSchool(school) {
    const processed = { ...school };
    
    try {
      // Convert coordinates if available
      if (school.easting && school.northing && 
          school.easting !== '' && school.northing !== '' &&
          !isNaN(parseFloat(school.easting)) && !isNaN(parseFloat(school.northing))) {
        
        const easting = parseFloat(school.easting);
        const northing = parseFloat(school.northing);
        
        // Convert British National Grid to WGS84
        const [lon, lat] = proj4('EPSG:27700', 'EPSG:4326', [easting, northing]);
        
        processed.lat = lat.toFixed(8);
        processed.lon = lon.toFixed(8);
        this.processedCount++;
      } else {
        // Set to null if no coordinates
        processed.lat = null;
        processed.lon = null;
        this.errorCount++;
      }
    } catch (error) {
      console.error(`❌ Coordinate conversion error for school ${school.urn}:`, error.message);
      processed.lat = null;
      processed.lon = null;
      this.errorCount++;
    }

    // Clean field names (remove spaces, special characters)
    const cleaned = {};
    Object.keys(processed).forEach(key => {
      const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_');
      cleaned[cleanKey] = processed[key];
    });

    return cleaned;
  }

  async writeCSV(schools, outputPath) {
    if (schools.length === 0) {
      throw new Error('No schools to write');
    }

    const headers = Object.keys(schools[0]).map(key => ({
      id: key,
      title: key
    }));

    const csvWriter = createCsvWriter({
      path: outputPath,
      header: headers
    });

    await csvWriter.writeRecords(schools);
    console.log(`💾 Written processed CSV to: ${outputPath}`);
  }
}

// Main execution
async function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  
  if (!inputPath || !outputPath) {
    console.error('Usage: node csv-processor.js <input.csv> <output.csv>');
    process.exit(1);
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const processor = new CSVProcessor();
  await processor.processCSV(inputPath, outputPath);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = CSVProcessor;

