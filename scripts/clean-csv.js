const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

async function cleanCsvData(inputFile, outputFile) {
  const rows = [];
  let totalRows = 0;
  let validRows = 0;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on('data', (row) => {
        totalRows++;
        
        // Check if URN is valid (not null, not empty, not just whitespace)
        const urn = row.URN || row.urn || row.Urn;
        if (urn && urn.trim() !== '' && urn.trim().toLowerCase() !== 'null') {
          validRows++;
          rows.push(row);
        }
      })
      .on('end', async () => {
        if (rows.length === 0) {
          console.error('No valid rows found!');
          reject(new Error('No valid rows found'));
          return;
        }
        
        console.log(`Total rows: ${totalRows}`);
        console.log(`Valid rows (with URN): ${validRows}`);
        console.log(`Removed ${totalRows - validRows} rows with null/empty URN`);
        
        // Get headers from first row
        const headers = Object.keys(rows[0]).map(key => ({
          id: key,
          title: key
        }));
        
        // Write cleaned data
        const csvWriter = createCsvWriter({
          path: outputFile,
          header: headers
        });
        
        try {
          await csvWriter.writeRecords(rows);
          console.log(`✅ Cleaned data saved to: ${outputFile}`);
          resolve({ totalRows, validRows, removedRows: totalRows - validRows });
        } catch (error) {
          console.error('Error writing CSV:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        reject(error);
      });
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0];
  const outputFile = args[1] || inputFile.replace('.csv', '_cleaned.csv');
  
  if (!inputFile) {
    console.log('Usage: node clean-csv.js <input-csv-file> [output-csv-file]');
    console.log('');
    console.log('Example: node clean-csv.js ./data/schools.csv ./data/schools_cleaned.csv');
    return;
  }
  
  if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    return;
  }
  
  try {
    const result = await cleanCsvData(inputFile, outputFile);
    console.log(`\n📊 Summary:`);
    console.log(`- Total rows processed: ${result.totalRows}`);
    console.log(`- Valid rows kept: ${result.validRows}`);
    console.log(`- Rows removed: ${result.removedRows}`);
    console.log(`- Output file: ${outputFile}`);
  } catch (error) {
    console.error('Cleaning failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { cleanCsvData };
