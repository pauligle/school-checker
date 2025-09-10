#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class AutoImportWorkflow {
  constructor() {
    this.rawFolder = 'data/raw';
    this.processedFolder = 'data/processed';
    this.backupFolder = 'data/backup';
  }

  async runWorkflow() {
    console.log('🚀 School Data Import Workflow');
    console.log('===============================\n');
    
    try {
      // Step 1: Check for CSV files in raw folder
      const csvFiles = await this.findCSVFiles();
      
      if (csvFiles.length === 0) {
        console.log('❌ No CSV files found in data/raw/');
        console.log('📋 Please download the CSV files from:');
        console.log('   🏫 School data: https://get-information-schools.service.gov.uk/Downloads');
        console.log('   🏆 Inspection data: https://www.gov.uk/government/statistical-data-sets/schools-inspections');
        console.log('📁 And place them in: data/raw/');
        return;
      }

      console.log(`✅ Found ${csvFiles.length} CSV file(s):`);
      csvFiles.forEach(file => console.log(`   📄 ${file}`));

      // Step 2: Process each CSV file
      for (const csvFile of csvFiles) {
        await this.processCSVFile(csvFile);
      }

      console.log('\n🎉 Import workflow completed successfully!');
      
    } catch (error) {
      console.error('❌ Workflow failed:', error.message);
      process.exit(1);
    }
  }

  async findCSVFiles() {
    if (!fs.existsSync(this.rawFolder)) {
      fs.mkdirSync(this.rawFolder, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(this.rawFolder);
    return files.filter(file => file.toLowerCase().endsWith('.csv'));
  }

  async processCSVFile(csvFile) {
    const inputPath = path.join(this.rawFolder, csvFile);
    
    console.log(`\n📦 Processing: ${csvFile}`);
    
    try {
      // Detect file type based on filename
      const isInspectionData = csvFile.toLowerCase().includes('inspection') || 
                              csvFile.toLowerCase().includes('management_information');
      
      if (isInspectionData) {
        console.log('🏆 Detected Ofsted inspection data');
        await this.processInspectionData(inputPath, csvFile);
      } else {
        console.log('🏫 Detected school data');
        await this.processSchoolData(inputPath, csvFile);
      }
      
    } catch (error) {
      console.error(`❌ Failed to process ${csvFile}:`, error.message);
      throw error;
    }
  }

  async processSchoolData(inputPath, csvFile) {
    const outputPath = path.join(this.processedFolder, 'schools-clean.csv');
    
    // Step 1: Pre-process CSV (coordinate conversion, field cleaning)
    console.log('🔧 Pre-processing school CSV...');
    await this.preprocessCSV(inputPath, outputPath);
    
    // Step 2: Import to Supabase
    console.log('📊 Importing schools to Supabase...');
    await this.importToSupabase(outputPath);
    
    // Step 3: Backup original file
    console.log('💾 Creating backup...');
    await this.createBackup(inputPath, csvFile);
    
    // Step 4: Clean up
    console.log('🧹 Cleaning up...');
    fs.unlinkSync(inputPath); // Remove original file
    
    console.log(`✅ ${csvFile} processed successfully!`);
  }

  async processInspectionData(inputPath, csvFile) {
    // Step 1: Import inspection data directly (no preprocessing needed)
    console.log('📊 Importing inspection data to Supabase...');
    await this.importInspectionsToSupabase(inputPath);
    
    // Step 2: Update schools table with inspection data
    console.log('🔄 Updating schools with inspection data...');
    await this.updateSchoolsWithInspections();
    
    // Step 3: Backup original file
    console.log('💾 Creating backup...');
    await this.createBackup(inputPath, csvFile);
    
    // Step 4: Clean up
    console.log('🧹 Cleaning up...');
    fs.unlinkSync(inputPath); // Remove original file
    
    console.log(`✅ ${csvFile} processed successfully!`);
  }

  async preprocessCSV(inputPath, outputPath) {
    // Create processed folder if it doesn't exist
    if (!fs.existsSync(this.processedFolder)) {
      fs.mkdirSync(this.processedFolder, { recursive: true });
    }

    // Run the CSV processor
    const command = `node scripts/csv-processor.js "${inputPath}" "${outputPath}"`;
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('warning')) {
      throw new Error(`Pre-processing failed: ${stderr}`);
    }
    
    console.log('✅ CSV pre-processed successfully');
  }

  async importToSupabase(outputPath) {
    // Run the robust importer
    const command = `node scripts/robust-importer.js "${outputPath}"`;
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('warning')) {
      throw new Error(`Import failed: ${stderr}`);
    }
    
    console.log('✅ Data imported to Supabase successfully');
  }

  async importInspectionsToSupabase(inputPath) {
    // Run the inspection importer
    const command = `node scripts/import-inspections.js "${inputPath}"`;
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('warning')) {
      throw new Error(`Inspection import failed: ${stderr}`);
    }
    
    console.log('✅ Inspection data imported to Supabase successfully');
  }

  async updateSchoolsWithInspections() {
    // Run the schools update script
    const command = `node scripts/update-schools-with-inspections.js`;
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('warning')) {
      throw new Error(`Schools update failed: ${stderr}`);
    }
    
    console.log('✅ Schools updated with inspection data successfully');
  }

  async createBackup(inputPath, csvFile) {
    // Create backup folder if it doesn't exist
    if (!fs.existsSync(this.backupFolder)) {
      fs.mkdirSync(this.backupFolder, { recursive: true });
    }

    // Create timestamped backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `${csvFile.replace('.csv', '')}_${timestamp}.csv`;
    const backupPath = path.join(this.backupFolder, backupName);
    
    fs.copyFileSync(inputPath, backupPath);
    console.log(`✅ Backup created: ${backupName}`);
  }
}

// Main execution
async function main() {
  const workflow = new AutoImportWorkflow();
  await workflow.runWorkflow();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AutoImportWorkflow;
