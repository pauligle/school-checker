const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importTeacherData() {
  console.log('🚀 Importing teacher data from School Workforce Census...');
  
  const teacherFile = 'data/raw/school-workforce-england/2024/data/workforce_ptrs_2010_2024_sch.csv';
  
  if (!fs.existsSync(teacherFile)) {
    console.error('❌ Teacher data file not found:', teacherFile);
    return;
  }
  
  const schools = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(teacherFile)
      .pipe(csv())
      .on('data', (row) => {
        // Debug: log first few rows
        if (schools.length < 3) {
          console.log('Sample row:', {
            time_period: row.time_period,
            school_urn: row.school_urn,
            school_name: row.school_name
          });
        }
        
        // Only process 2024/25 data (most recent)
        if (row.time_period === '202425' && row.school_urn) {
          const urn = row.school_urn;
          const pupilsFte = parseFloat(row.pupils_fte) || 0;
          const qualifiedTeachersFte = parseFloat(row.qualified_teachers_fte) || 0;
          const teachersFte = parseFloat(row.teachers_fte) || 0;
          const pupilToQualifiedTeacherRatio = parseFloat(row.pupil_to_qual_teacher_ratio) || 0;
          const pupilToAllTeacherRatio = parseFloat(row.pupil_to_qual_unqual_teacher_ratio) || 0;
          const pupilToAdultRatio = parseFloat(row.pupil_to_adult_ratio) || 0;
          
          schools.push({
            urn: urn,
            pupils_fte: pupilsFte,
            qualified_teachers_fte: qualifiedTeachersFte,
            teachers_fte: teachersFte,
            pupil_to_qualified_teacher_ratio: pupilToQualifiedTeacherRatio,
            pupil_to_all_teacher_ratio: pupilToAllTeacherRatio,
            pupil_to_adult_ratio: pupilToAdultRatio
          });
        }
      })
      .on('end', async () => {
        try {
          console.log(`📊 Found ${schools.length} schools with 2024/25 teacher data`);
          
          let updated = 0;
          for (const school of schools) {
            const { error } = await supabase
              .from('schools')
              .update({
                pupils_fte_2024: school.pupils_fte,
                qualified_teachers_fte_2024: school.qualified_teachers_fte,
                teachers_fte_2024: school.teachers_fte,
                pupil_to_qualified_teacher_ratio_2024: school.pupil_to_qualified_teacher_ratio,
                pupil_to_all_teacher_ratio_2024: school.pupil_to_all_teacher_ratio,
                pupil_to_adult_ratio_2024: school.pupil_to_adult_ratio,
                updated_at: new Date().toISOString()
              })
              .eq('urn', school.urn);
            
            if (error) {
              console.error(`❌ Error updating school ${school.urn}:`, error);
            } else {
              updated++;
            }
          }
          
          console.log(`✅ Updated ${updated} schools with teacher data`);
          resolve();
        } catch (error) {
          console.error('❌ Error:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        reject(error);
      });
  });
}

// Run the import
importTeacherData()
  .then(() => {
    console.log('🎉 Teacher data import completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });
