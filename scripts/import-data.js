const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need this for data insertion

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importSchoolsData(csvFilePath) {
  const schools = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Map CSV columns to your table structure
        // Adjust these field mappings based on your CSV structure
        const school = {
          urn: row.URN || row.urn,
          name: row.SchoolName || row.name,
          lat: parseFloat(row.Latitude || row.lat),
          lon: parseFloat(row.Longitude || row.lon),
          // Add more fields as needed:
          // school_type: row.SchoolType,
          // phase: row.Phase,
          // local_authority: row.LocalAuthority,
          // total_pupils: parseInt(row.TotalPupils),
          // gender: row.Gender,
          // age_range: row.AgeRange,
          // capacity: parseInt(row.Capacity),
        };
        
        // Only add if we have the required fields
        if (school.urn && school.name && !isNaN(school.lat) && !isNaN(school.lon)) {
          schools.push(school);
        }
      })
      .on('end', async () => {
        try {
          console.log(`Processing ${schools.length} schools...`);
          
          // Insert data in batches
          const batchSize = 100;
          for (let i = 0; i < schools.length; i += batchSize) {
            const batch = schools.slice(i, i + batchSize);
            
            const { data, error } = await supabase
              .from('schools')
              .upsert(batch, { onConflict: 'urn' }); // Use URN as unique identifier
            
            if (error) {
              console.error('Error inserting batch:', error);
              reject(error);
              return;
            }
            
            console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(schools.length / batchSize)}`);
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

async function importInspectionsData(csvFilePath) {
  const inspections = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Map CSV columns to inspections table structure
        const inspection = {
          urn: row.URN || row.urn,
          inspection_date: row.InspectionDate || row.inspection_date,
          overall_rating: row.OverallRating || row.overall_rating,
          previous_rating: row.PreviousRating || row.previous_rating,
          quality_of_education: row.QualityOfEducation || row.quality_of_education,
          behaviour_attitudes: row.BehaviourAttitudes || row.behaviour_attitudes,
          personal_development: row.PersonalDevelopment || row.personal_development,
          leadership_management: row.LeadershipManagement || row.leadership_management,
        };
        
        if (inspection.urn && inspection.inspection_date) {
          inspections.push(inspection);
        }
      })
      .on('end', async () => {
        try {
          console.log(`Processing ${inspections.length} inspections...`);
          
          const batchSize = 100;
          for (let i = 0; i < inspections.length; i += batchSize) {
            const batch = inspections.slice(i, i + batchSize);
            
            const { data, error } = await supabase
              .from('inspections')
              .upsert(batch, { onConflict: 'urn,inspection_date' });
            
            if (error) {
              console.error('Error inserting batch:', error);
              reject(error);
              return;
            }
            
            console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(inspections.length / batchSize)}`);
          }
          
          console.log('✅ Inspections data imported successfully!');
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

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const csvFile = args[1];
  
  if (!command || !csvFile) {
    console.log('Usage: node import-data.js <command> <csv-file>');
    console.log('Commands:');
    console.log('  schools    - Import schools data');
    console.log('  inspections - Import inspections data');
    console.log('');
    console.log('Example: node import-data.js schools ./data/schools.csv');
    return;
  }
  
  if (!fs.existsSync(csvFile)) {
    console.error(`CSV file not found: ${csvFile}`);
    return;
  }
  
  try {
    switch (command) {
      case 'schools':
        const schoolCount = await importSchoolsData(csvFile);
        console.log(`Imported ${schoolCount} schools`);
        break;
      case 'inspections':
        const inspectionCount = await importInspectionsData(csvFile);
        console.log(`Imported ${inspectionCount} inspections`);
        break;
      default:
        console.error('Unknown command. Use "schools" or "inspections"');
    }
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { importSchoolsData, importInspectionsData };
