#!/usr/bin/env node

/**
 * Automated Data Fetcher
 * Downloads latest DfE data monthly and updates the database
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data');
const RAW_DIR = path.join(DATA_DIR, 'raw');
const LOG_DIR = path.join(__dirname, '..', 'logs');

// Ensure directories exist
fs.ensureDirSync(RAW_DIR);
fs.ensureDirSync(LOG_DIR);

// Configuration for your specific CSV file
const CUSTOM_CSV_CONFIG = {
  // Using your downloaded CSV file
  filePath: path.join(RAW_DIR, 'edubasealldata-2025-09-05.csv'),
  // Or use a URL if your CSV is hosted online
  url: null, // Set this if you have a URL to your CSV
  description: 'Your custom updated schools data'
};

// Function to log messages with timestamp
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
  
  // Also write to log file
  const logFile = path.join(LOG_DIR, `data-fetcher-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
}

// Function to use your custom CSV file
async function useCustomCSV() {
  log('Using your custom updated CSV file...');
  
  try {
    let sourceFile;
    
    // Check if we have a URL to download from
    if (CUSTOM_CSV_CONFIG.url) {
      log(`Downloading from URL: ${CUSTOM_CSV_CONFIG.url}`);
      const response = await axios.get(CUSTOM_CSV_CONFIG.url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (response.status === 200 && response.data) {
        await fs.writeFile(CUSTOM_CSV_CONFIG.filePath, response.data);
        log(`Successfully downloaded custom CSV to ${CUSTOM_CSV_CONFIG.filePath}`);
        sourceFile = CUSTOM_CSV_CONFIG.filePath;
      } else {
        throw new Error('Failed to download CSV from URL');
      }
    } else {
      // Use local file
      sourceFile = CUSTOM_CSV_CONFIG.filePath;
      
      if (!await fs.pathExists(sourceFile)) {
        throw new Error(`Custom CSV file not found: ${sourceFile}`);
      }
      
      log(`Using local CSV file: ${sourceFile}`);
    }
    
    // Copy to raw directory with timestamp
    const filename = `custom-schools-data-${new Date().toISOString().split('T')[0]}.csv`;
    const targetFile = path.join(RAW_DIR, filename);
    
    await fs.copy(sourceFile, targetFile);
    log(`Copied custom CSV to ${filename}`);
    
    // Process the data
    await processData(targetFile);
    return true;
    
  } catch (error) {
    log(`Failed to use custom CSV: ${error.message}`, 'ERROR');
    return false;
  }
}

// Function to process the downloaded data
async function processData(filepath) {
  try {
    log(`Processing data from ${filepath}`);
    
    // Run the data importer with schools command
    const { stdout, stderr } = await execAsync(`node scripts/data-importer.js schools ${filepath}`);
    
    if (stderr) {
      log(`Data importer stderr: ${stderr}`, 'WARN');
    }
    
    log(`Data importer output: ${stdout}`);
    log('Data processing completed successfully');
    
  } catch (error) {
    log(`Error processing data: ${error.message}`, 'ERROR');
    throw error;
  }
}

// Function to check if data needs updating
async function checkDataAge() {
  try {
    const files = await fs.readdir(RAW_DIR);
    const csvFiles = files.filter(file => file.endsWith('.csv'));
    
    if (csvFiles.length === 0) {
      log('No CSV files found, data fetch needed');
      return true;
    }
    
    // Check the most recent file
    const latestFile = csvFiles.sort().pop();
    const filePath = path.join(RAW_DIR, latestFile);
    const stats = await fs.stat(filePath);
    const daysSinceUpdate = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
    
    log(`Latest data file: ${latestFile}, age: ${daysSinceUpdate.toFixed(1)} days`);
    
    // Update if data is older than 30 days
    return daysSinceUpdate > 30;
    
  } catch (error) {
    log(`Error checking data age: ${error.message}`, 'ERROR');
    return true; // Assume we need to fetch if we can't check
  }
}

// Main function to run the automated fetch
async function runAutomatedFetch() {
  try {
    log('=== Automated Data Fetch Started ===');
    
    // Always use your custom CSV file (skip age check)
    log('Using your custom CSV file regardless of age...');
    const success = await useCustomCSV();
    
    if (success) {
      log('Automated data fetch completed successfully');
    } else {
      log('Automated data fetch failed', 'ERROR');
    }
    
  } catch (error) {
    log(`Automated fetch error: ${error.message}`, 'ERROR');
  }
}

// Function to set up monthly cron job
function setupMonthlyCron() {
  // Run on the 1st of every month at 2 AM
  cron.schedule('0 2 1 * *', () => {
    log('Monthly cron job triggered');
    runAutomatedFetch();
  });
  
  log('Monthly cron job scheduled for 1st of every month at 2 AM');
}

// Function to run immediately (for testing)
async function runNow() {
  log('Running data fetch immediately...');
  await runAutomatedFetch();
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--now')) {
    runNow();
  } else if (args.includes('--cron')) {
    setupMonthlyCron();
    // Keep the process running
    setInterval(() => {}, 1000);
  } else {
    console.log('Usage:');
    console.log('  node scripts/automated-data-fetcher.js --now     # Run immediately');
    console.log('  node scripts/automated-data-fetcher.js --cron   # Set up monthly cron job');
  }
}

module.exports = {
  runAutomatedFetch,
  setupMonthlyCron,
  useCustomCSV
};
