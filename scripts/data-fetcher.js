#!/usr/bin/env node

/**
 * Data Fetcher for School Checker
 * Downloads raw CSV data from government APIs and websites
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const zlib = require('zlib');

const pipelineAsync = promisify(pipeline);

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data');
const RAW_DIR = path.join(DATA_DIR, 'raw');
const LOG_DIR = path.join(__dirname, '..', 'logs');

// Data sources configuration
const DATA_SOURCES = {
  education_stats_api: {
    url: 'https://api.education.gov.uk/statistics/',
    filename: 'education-statistics-api.json',
    description: 'Education Statistics API - Official DfE API',
    updateFrequency: 'real-time',
    compressed: false,
    note: 'Requires specific endpoint discovery for Ofsted data'
  },
  schools: {
    url: 'https://ea-edubase-api-prod.azurewebsites.net/edubase/downloads/public/edubasealldata20241201.csv',
    filename: 'schools.csv',
    description: 'Get Information about Schools (GIAS) - All Schools Data',
    updateFrequency: 'monthly',
    compressed: false
  },
  ofsted: {
    url: 'https://reports.ofsted.gov.uk/oxedu_providers/full/(main)/csv',
    filename: 'ofsted-inspections.csv',
    description: 'Ofsted Inspection Reports',
    updateFrequency: 'weekly',
    compressed: false,
    note: 'This URL may need to be updated - Ofsted data is also available in the DfE schools dataset'
  },
  performance: {
    url: 'https://www.compare-school-performance.service.gov.uk/download-data',
    filename: 'performance-tables.csv',
    description: 'School Performance Tables',
    updateFrequency: 'annually',
    compressed: false,
    note: 'This URL may need to be updated - Performance data is also available through DfE data releases'
  }
};

// Utility functions
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
  
  // Write to log file
  const logFile = path.join(LOG_DIR, `data-fetcher-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
}

async function ensureDirectories() {
  await fs.ensureDir(RAW_DIR);
  await fs.ensureDir(LOG_DIR);
  log('Directories ensured');
}

async function downloadFile(url, filepath, description) {
  log(`Starting download: ${description}`);
  log(`URL: ${url}`);
  log(`Target: ${filepath}`);

  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 300000, // 5 minutes
      headers: {
        'User-Agent': 'School-Checker-Data-Fetcher/1.0'
      }
    });

    const writer = fs.createWriteStream(filepath);
    
    // Track progress
    let downloadedBytes = 0;
    const totalBytes = parseInt(response.headers['content-length'] || '0');
    
    response.data.on('data', (chunk) => {
      downloadedBytes += chunk.length;
      if (totalBytes > 0) {
        const progress = ((downloadedBytes / totalBytes) * 100).toFixed(2);
        process.stdout.write(`\rDownloading: ${progress}% (${(downloadedBytes / 1024 / 1024).toFixed(2)}MB)`);
      }
    });

    await pipelineAsync(response.data, writer);
    console.log(); // New line after progress
    
    const stats = await fs.stat(filepath);
    log(`Download completed: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);
    
    return true;
  } catch (error) {
    log(`Download failed: ${error.message}`, 'ERROR');
    return false;
  }
}

async function handleCompressedFile(filepath, isCompressed) {
  if (!isCompressed) return filepath;
  
  const compressedPath = filepath + '.gz';
  await fs.move(filepath, compressedPath);
  
  const gunzip = zlib.createGunzip();
  const reader = fs.createReadStream(compressedPath);
  const writer = fs.createWriteStream(filepath);
  
  await pipelineAsync(reader, gunzip, writer);
  await fs.remove(compressedPath);
  
  log(`Decompressed: ${path.basename(filepath)}`);
  return filepath;
}

async function fetchAllData() {
  log('Starting data fetch for all sources');
  await ensureDirectories();
  
  const results = {
    success: [],
    failed: [],
    total: Object.keys(DATA_SOURCES).length
  };
  
  for (const [sourceName, source] of Object.entries(DATA_SOURCES)) {
    log(`Processing ${sourceName}: ${source.description}`);
    
    const filepath = path.join(RAW_DIR, source.filename);
    
    try {
      const success = await downloadFile(source.url, filepath, source.description);
      
      if (success) {
        await handleCompressedFile(filepath, source.compressed);
        results.success.push(sourceName);
        log(`✓ ${sourceName}: Success`);
      } else {
        results.failed.push(sourceName);
        log(`✗ ${sourceName}: Failed`, 'ERROR');
      }
    } catch (error) {
      results.failed.push(sourceName);
      log(`✗ ${sourceName}: Error - ${error.message}`, 'ERROR');
    }
  }
  
  log(`Data fetch completed. Success: ${results.success.length}, Failed: ${results.failed.length}`);
  return results;
}

async function fetchSpecificData(sourceName) {
  if (!DATA_SOURCES[sourceName]) {
    log(`Unknown data source: ${sourceName}`, 'ERROR');
    return false;
  }
  
  log(`Fetching specific data source: ${sourceName}`);
  await ensureDirectories();
  
  const source = DATA_SOURCES[sourceName];
  const filepath = path.join(RAW_DIR, source.filename);
  
  try {
    const success = await downloadFile(source.url, filepath, source.description);
    
    if (success) {
      await handleCompressedFile(filepath, source.compressed);
      log(`✓ ${sourceName}: Success`);
      return true;
    } else {
      log(`✗ ${sourceName}: Failed`, 'ERROR');
      return false;
    }
  } catch (error) {
    log(`✗ ${sourceName}: Error - ${error.message}`, 'ERROR');
    return false;
  }
}

async function checkDataStatus() {
  log('Checking data status');
  await ensureDirectories();
  
  const status = {};
  
  for (const [sourceName, source] of Object.entries(DATA_SOURCES)) {
    const filepath = path.join(RAW_DIR, source.filename);
    
    try {
      const exists = await fs.pathExists(filepath);
      if (exists) {
        const stats = await fs.stat(filepath);
        status[sourceName] = {
          exists: true,
          size: stats.size,
          lastModified: stats.mtime,
          age: Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24)) // days
        };
      } else {
        status[sourceName] = { exists: false };
      }
    } catch (error) {
      status[sourceName] = { error: error.message };
    }
  }
  
  return status;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'fetch-all':
      await fetchAllData();
      break;
      
    case 'fetch':
      const sourceName = args[1];
      if (!sourceName) {
        log('Usage: node data-fetcher.js fetch <source-name>', 'ERROR');
        log('Available sources: ' + Object.keys(DATA_SOURCES).join(', '));
        process.exit(1);
      }
      await fetchSpecificData(sourceName);
      break;
      
    case 'status':
      const status = await checkDataStatus();
      console.log(JSON.stringify(status, null, 2));
      break;
      
    case 'sources':
      console.log('Available data sources:');
      for (const [name, source] of Object.entries(DATA_SOURCES)) {
        console.log(`  ${name}: ${source.description}`);
        console.log(`    URL: ${source.url}`);
        console.log(`    Update Frequency: ${source.updateFrequency}`);
        console.log('');
      }
      break;
      
    default:
      console.log('School Checker Data Fetcher');
      console.log('');
      console.log('Usage:');
      console.log('  node data-fetcher.js fetch-all          # Download all data sources');
      console.log('  node data-fetcher.js fetch <source>      # Download specific source');
      console.log('  node data-fetcher.js status              # Check data status');
      console.log('  node data-fetcher.js sources             # List available sources');
      console.log('');
      console.log('Available sources: ' + Object.keys(DATA_SOURCES).join(', '));
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
  fetchAllData,
  fetchSpecificData,
  checkDataStatus,
  DATA_SOURCES
};
