const cron = require('node-cron');
const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Configuration
const LOG_DIR = path.join(__dirname, '../logs');
const CRON_LOG_FILE = path.join(LOG_DIR, 'cron.log');

// Ensure log directory exists
async function ensureLogDirectory() {
  await fs.ensureDir(LOG_DIR);
}

// Log function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(logMessage.trim());
  fs.appendFileSync(CRON_LOG_FILE, logMessage);
}

// Execute command and log results
function executeCommand(command, description) {
  return new Promise((resolve, reject) => {
    log(`🚀 Starting: ${description}`);
    
    const child = exec(command, { 
      cwd: path.join(__dirname, '..'),
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data;
      process.stdout.write(data);
    });
    
    child.stderr.on('data', (data) => {
      stderr += data;
      process.stderr.write(data);
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        log(`✅ Completed: ${description}`);
        resolve({ success: true, stdout, stderr });
      } else {
        log(`❌ Failed: ${description} (exit code: ${code})`);
        log(`Error output: ${stderr}`);
        reject({ success: false, code, stdout, stderr });
      }
    });
    
    child.on('error', (error) => {
      log(`❌ Error executing ${description}: ${error.message}`);
      reject({ success: false, error: error.message });
    });
  });
}

// Data pipeline execution
async function runDataPipeline() {
  log('🔄 Starting automated data pipeline...');
  
  try {
    // Step 1: Fetch data
    await executeCommand('npm run data:fetch', 'Data Fetch');
    
    // Step 2: Process data
    await executeCommand('npm run data:process', 'Data Processing');
    
    // Step 3: Import data
    await executeCommand('npm run data:import', 'Data Import');
    
    log('🎉 Data pipeline completed successfully!');
  } catch (error) {
    log(`💥 Data pipeline failed: ${error.message || error}`);
    
    // Send notification (you can add email/Slack notifications here)
    // await sendNotification('Data pipeline failed', error);
  }
}

// Weekly Ofsted update (every Monday at 2 AM)
function scheduleOfstedUpdates() {
  log('📅 Scheduling Ofsted updates (weekly - Mondays at 2 AM)');
  
  cron.schedule('0 2 * * 1', async () => {
    log('🔄 Starting weekly Ofsted data update...');
    
    try {
      await executeCommand('npm run data:fetch ofsted', 'Ofsted Data Fetch');
      await executeCommand('npm run data:process ofsted', 'Ofsted Data Processing');
      await executeCommand('npm run data:import ofsted', 'Ofsted Data Import');
      
      log('✅ Weekly Ofsted update completed!');
    } catch (error) {
      log(`❌ Weekly Ofsted update failed: ${error.message || error}`);
    }
  }, {
    scheduled: true,
    timezone: "Europe/London"
  });
}

// Monthly schools update (1st of each month at 3 AM)
function scheduleSchoolsUpdates() {
  log('📅 Scheduling schools updates (monthly - 1st of month at 3 AM)');
  
  cron.schedule('0 3 1 * *', async () => {
    log('🔄 Starting monthly schools data update...');
    
    try {
      await executeCommand('npm run data:fetch schools', 'Schools Data Fetch');
      await executeCommand('npm run data:process schools', 'Schools Data Processing');
      await executeCommand('npm run data:import schools', 'Schools Data Import');
      
      log('✅ Monthly schools update completed!');
    } catch (error) {
      log(`❌ Monthly schools update failed: ${error.message || error}`);
    }
  }, {
    scheduled: true,
    timezone: "Europe/London"
  });
}

// Annual performance update (September 1st at 4 AM)
function schedulePerformanceUpdates() {
  log('📅 Scheduling performance updates (annually - September 1st at 4 AM)');
  
  cron.schedule('0 4 1 9 *', async () => {
    log('🔄 Starting annual performance data update...');
    
    try {
      await executeCommand('npm run data:fetch performance', 'Performance Data Fetch');
      await executeCommand('npm run data:process performance', 'Performance Data Processing');
      await executeCommand('npm run data:import performance', 'Performance Data Import');
      
      log('✅ Annual performance update completed!');
    } catch (error) {
      log(`❌ Annual performance update failed: ${error.message || error}`);
    }
  }, {
    scheduled: true,
    timezone: "Europe/London"
  });
}

// Daily health check (every day at 6 AM)
function scheduleHealthCheck() {
  log('📅 Scheduling daily health check (daily at 6 AM)');
  
  cron.schedule('0 6 * * *', async () => {
    log('🏥 Starting daily health check...');
    
    try {
      // Check database connectivity
      await executeCommand('npm run data:import stats', 'Database Health Check');
      
      // Check if data files exist and are recent
      const dataDir = path.join(__dirname, '../data');
      const files = await fs.readdir(dataDir);
      
      for (const file of files) {
        if (file.endsWith('.csv')) {
          const stats = await fs.stat(path.join(dataDir, file));
          const ageInDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
          
          if (ageInDays > 30) {
            log(`⚠️  Warning: ${file} is ${Math.floor(ageInDays)} days old`);
          }
        }
      }
      
      log('✅ Daily health check completed!');
    } catch (error) {
      log(`❌ Daily health check failed: ${error.message || error}`);
    }
  }, {
    scheduled: true,
    timezone: "Europe/London"
  });
}

// Manual trigger function
async function triggerManualUpdate(type = 'all') {
  log(`🔄 Manual trigger: ${type} update`);
  
  try {
    switch (type) {
      case 'all':
        await runDataPipeline();
        break;
      case 'schools':
        await executeCommand('npm run data:fetch schools', 'Schools Data Fetch');
        await executeCommand('npm run data:process schools', 'Schools Data Processing');
        await executeCommand('npm run data:import schools', 'Schools Data Import');
        break;
      case 'ofsted':
        await executeCommand('npm run data:fetch ofsted', 'Ofsted Data Fetch');
        await executeCommand('npm run data:process ofsted', 'Ofsted Data Processing');
        await executeCommand('npm run data:import ofsted', 'Ofsted Data Import');
        break;
      case 'performance':
        await executeCommand('npm run data:fetch performance', 'Performance Data Fetch');
        await executeCommand('npm run data:process performance', 'Performance Data Processing');
        await executeCommand('npm run data:import performance', 'Performance Data Import');
        break;
      default:
        log(`❌ Unknown update type: ${type}`);
        return;
    }
    
    log(`✅ Manual ${type} update completed!`);
  } catch (error) {
    log(`❌ Manual ${type} update failed: ${error.message || error}`);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  await ensureLogDirectory();
  
  switch (command) {
    case 'start':
      log('🚀 Starting cron scheduler...');
      
      // Schedule all jobs
      scheduleOfstedUpdates();
      scheduleSchoolsUpdates();
      schedulePerformanceUpdates();
      scheduleHealthCheck();
      
      log('✅ Cron scheduler started successfully!');
      log('📅 Scheduled jobs:');
      log('   - Ofsted updates: Mondays at 2 AM');
      log('   - Schools updates: 1st of month at 3 AM');
      log('   - Performance updates: September 1st at 4 AM');
      log('   - Health checks: Daily at 6 AM');
      
      // Keep the process running
      process.on('SIGINT', () => {
        log('🛑 Cron scheduler stopped by user');
        process.exit(0);
      });
      
      process.on('SIGTERM', () => {
        log('🛑 Cron scheduler stopped by system');
        process.exit(0);
      });
      
      break;
      
    case 'manual':
      const type = args[1] || 'all';
      await triggerManualUpdate(type);
      break;
      
    case 'test':
      log('🧪 Running test pipeline...');
      await runDataPipeline();
      break;
      
    case 'status':
      log('📊 Cron scheduler status:');
      log(`   Log file: ${CRON_LOG_FILE}`);
      
      // Check if log file exists and show recent entries
      if (await fs.pathExists(CRON_LOG_FILE)) {
        const content = await fs.readFile(CRON_LOG_FILE, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        const recent = lines.slice(-10); // Last 10 lines
        
        log('   Recent activity:');
        recent.forEach(line => {
          if (line.trim()) {
            log(`     ${line}`);
          }
        });
      } else {
        log('   No log file found');
      }
      break;
      
    default:
      console.log('Usage: node setup-cron.js <command>');
      console.log('Commands:');
      console.log('  start     - Start the cron scheduler');
      console.log('  manual    - Trigger manual update (all/schools/ofsted/performance)');
      console.log('  test      - Run test pipeline');
      console.log('  status    - Show scheduler status');
      console.log('');
      console.log('Examples:');
      console.log('  node setup-cron.js start');
      console.log('  node setup-cron.js manual schools');
      console.log('  node setup-cron.js test');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { 
  runDataPipeline, 
  triggerManualUpdate, 
  scheduleOfstedUpdates, 
  scheduleSchoolsUpdates, 
  schedulePerformanceUpdates,
  scheduleHealthCheck
};
