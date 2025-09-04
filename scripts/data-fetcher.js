const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream');
const { promisify } = require('util');

const pipelineAsync = promisify(pipeline);

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Configuration
const DATA_DIR = path.join(__dirname, '../data');
const LOG_DIR = path.join(__dirname, '../logs');

// Government data sources
const DATA_SOURCES = {
  schools: {
    url: 'https://ea-edubase-api-prod.azurewebsites.net/edubase/downloads/public/edubasealldata20241201.csv',
    filename: 'schools.csv',
    description: 'Get Information about Schools (GIAS) - All Schools Data',
    updateFrequency: 'monthly' // 1st of each month
  },
  ofsted: {
    url: 'https://reports.ofsted.gov.uk/oxedu_providers/full/(main)/csv',
    filename: 'ofsted-inspections.csv',
    description: 'Ofsted Inspection Reports',
    updateFrequency: 'weekly' // Every Monday
  },
  performance: {
    url: 'https://www.compare-school-performance.service.gov.uk/download-data',
    filename: 'performance-tables.csv',
    description: 'School Performance Tables',
    updateFrequency: 'annually' // September
  }
};

// Ensure directories exist
async function ensureDirectories() {
  await fs.ensureDir(DATA_DIR);
  await fs.ensureDir(LOG_DIR);
}

// Download file with progress tracking
async function downloadFile(url, filepath, description) {
  console.log(`📥 Downloading ${description}...`);
  console.log(`   URL: ${url}`);
  console.log(`   Destination: ${filepath}`);

  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 300000, // 5 minutes
      headers: {
        'User-Agent': 'SchoolChecker-DataFetcher/1.0'
      }
    });

    const writer = fs.createWriteStream(filepath);
    
    // Track download progress
    let downloadedBytes = 0;
    const totalBytes = parseInt(response.headers['content-length'], 10);
    
    response.data.on('data', (chunk) => {
      downloadedBytes += chunk.length;
      if (totalBytes) {
        const progress = ((downloadedBytes / totalBytes) * 100).toFixed(2);
        process.stdout.write(`\r   Progress: ${progress}% (${downloadedBytes}/${totalBytes} bytes)`);
      }
    });

    await pipelineAsync(response.data, writer);
    console.log(`\n✅ Downloaded ${description} successfully!`);
    
    // Verify file size
    const stats = await fs.stat(filepath);
    console.log(`   File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to download ${description}:`, error.message);
    return false;
  }
}

// Handle compressed files (gzip)
async function handleCompressedFile(filepath, isCompressed) {
  if (!isCompressed) return filepath;
  
  const compressedPath = filepath + '.gz';
  const uncompressedPath = filepath;
  
  console.log(`📦 Decompressing ${path.basename(compressedPath)}...`);
  
  try {
    const gunzip = zlib.createGunzip();
    const reader = fs.createReadStream(compressedPath);
    const writer = fs.createWriteStream(uncompressedPath);
    
    await pipelineAsync(reader, gunzip, writer);
    
    // Remove compressed file
    await fs.remove(compressedPath);
    
    console.log(`✅ Decompressed successfully!`);
    return uncompressedPath;
  } catch (error) {
    console.error(`❌ Failed to decompress:`, error.message);
    throw error;
  }
}

// Main fetch function
async function fetchAllData() {
  console.log('🚀 Starting data fetch process...');
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log('=' * 50);
  
  await ensureDirectories();
  
  const results = {};
  const logFile = path.join(LOG_DIR, `fetch-${new Date().toISOString().split('T')[0]}.log`);
  
  for (const [key, source] of Object.entries(DATA_SOURCES)) {
    console.log(`\n🔄 Processing ${key} data...`);
    
    const filepath = path.join(DATA_DIR, source.filename);
    
    try {
      // Download the file
      const success = await downloadFile(source.url, filepath, source.description);
      
      if (success) {
        // Handle compression if needed
        const finalPath = await handleCompressedFile(filepath, source.url.includes('.gz'));
        
        results[key] = {
          success: true,
          filepath: finalPath,
          timestamp: new Date().toISOString(),
          size: (await fs.stat(finalPath)).size
        };
        
        console.log(`✅ ${key} data fetched successfully!`);
      } else {
        results[key] = {
          success: false,
          error: 'Download failed',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error(`❌ Error processing ${key}:`, error.message);
      results[key] = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Log results
  const logEntry = {
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      total: Object.keys(DATA_SOURCES).length,
      successful: Object.values(results).filter(r => r.success).length,
      failed: Object.values(results).filter(r => !r.success).length
    }
  };
  
  await fs.appendFile(logFile, JSON.stringify(logEntry, null, 2) + '\n');
  
  console.log('\n📊 Fetch Summary:');
  console.log(`   Total sources: ${logEntry.summary.total}`);
  console.log(`   Successful: ${logEntry.summary.successful}`);
  console.log(`   Failed: ${logEntry.summary.failed}`);
  console.log(`   Log file: ${logFile}`);
  
  return results;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'all':
      await fetchAllData();
      break;
    case 'schools':
      await fetchSpecificData('schools');
      break;
    case 'ofsted':
      await fetchSpecificData('ofsted');
      break;
    case 'performance':
      await fetchSpecificData('performance');
      break;
    case 'status':
      await checkDataStatus();
      break;
    default:
      console.log('Usage: node data-fetcher.js <command>');
      console.log('Commands:');
      console.log('  all        - Fetch all data sources');
      console.log('  schools    - Fetch schools data only');
      console.log('  ofsted     - Fetch Ofsted data only');
      console.log('  performance - Fetch performance data only');
      console.log('  status     - Check current data status');
  }
}

// Fetch specific data source
async function fetchSpecificData(sourceKey) {
  if (!DATA_SOURCES[sourceKey]) {
    console.error(`Unknown data source: ${sourceKey}`);
    return;
  }
  
  const source = DATA_SOURCES[sourceKey];
  const filepath = path.join(DATA_DIR, source.filename);
  
  console.log(`🚀 Fetching ${sourceKey} data...`);
  await ensureDirectories();
  
  const success = await downloadFile(source.url, filepath, source.description);
  
  if (success) {
    await handleCompressedFile(filepath, source.url.includes('.gz'));
    console.log(`✅ ${sourceKey} data fetched successfully!`);
  } else {
    console.log(`❌ Failed to fetch ${sourceKey} data`);
  }
}

// Check current data status
async function checkDataStatus() {
  console.log('📊 Current Data Status:');
  console.log('=' * 30);
  
  for (const [key, source] of Object.entries(DATA_SOURCES)) {
    const filepath = path.join(DATA_DIR, source.filename);
    const exists = await fs.pathExists(filepath);
    
    if (exists) {
      const stats = await fs.stat(filepath);
      const age = Date.now() - stats.mtime.getTime();
      const ageDays = Math.floor(age / (1000 * 60 * 60 * 24));
      
      console.log(`✅ ${key}: ${source.filename}`);
      console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Age: ${ageDays} days`);
      console.log(`   Frequency: ${source.updateFrequency}`);
    } else {
      console.log(`❌ ${key}: ${source.filename} (not found)`);
      console.log(`   Frequency: ${source.updateFrequency}`);
    }
    console.log('');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fetchAllData, fetchSpecificData, checkDataStatus };
