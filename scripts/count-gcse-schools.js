const fs = require('fs');
const path = require('path');

// Simple CSV parser
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

async function countSchools() {
  const filePath = path.join(__dirname, '..', 'data', 'raw', 'gcse-ks4-results', '2024', 'england_ks4final.csv');
  
  if (!fs.existsSync(filePath)) {
    console.error('CSV file not found:', filePath);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  console.log(`Total lines in CSV: ${lines.length}`);
  
  if (lines.length === 0) {
    console.log('File has no data rows');
    return;
  }
  
  // Parse header
  const header = parseCSVLine(lines[0]);
  console.log(`Found ${header.length} columns`);
  
  // Count different RECTYPE values
  const rectypeCounts = {};
  let validSchoolRecords = 0;
  let malformedLines = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    if (values.length !== header.length) {
      malformedLines++;
      continue;
    }
    
    // Create row object
    const row = {};
    header.forEach((col, index) => {
      row[col] = values[index];
    });
    
    // Count RECTYPE values
    const rectype = row.RECTYPE;
    rectypeCounts[rectype] = (rectypeCounts[rectype] || 0) + 1;
    
    // Count valid school records
    if (rectype === '1' && row.URN) {
      validSchoolRecords++;
    }
  }
  
  console.log('\nRECTYPE counts:');
  Object.entries(rectypeCounts).forEach(([rectype, count]) => {
    console.log(`  RECTYPE ${rectype}: ${count} records`);
  });
  
  console.log(`\nMalformed lines: ${malformedLines}`);
  console.log(`Valid school records (RECTYPE=1 with URN): ${validSchoolRecords}`);
  
  // Check first few school records
  console.log('\nFirst 5 school records:');
  let schoolCount = 0;
  for (let i = 1; i < lines.length && schoolCount < 5; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    if (values.length !== header.length) continue;
    
    const row = {};
    header.forEach((col, index) => {
      row[col] = values[index];
    });
    
    if (row.RECTYPE === '1' && row.URN) {
      console.log(`  ${schoolCount + 1}. URN: ${row.URN}, School: ${row.SCHNAME}`);
      schoolCount++;
    }
  }
}

countSchools().catch(console.error);
