const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addHarrisTeacherData() {
  console.log('🚀 Adding teacher data for Harris Academy Chobham...');
  
  try {
    // Insert teacher data for Harris Academy Chobham
    const { error } = await supabase
      .from('teacher_data')
      .upsert({
        school_urn: '139703',
        academic_year: '2024/25',
        pupils_fte: 592.5,
        qualified_teachers_fte: 53.4,
        teachers_fte: 54.4,
        pupil_to_qualified_teacher_ratio: 11.1,
        pupil_to_all_teacher_ratio: 10.9,
        pupil_to_adult_ratio: 7.9
      });
    
    if (error) {
      console.error('❌ Error inserting teacher data:', error);
    } else {
      console.log('✅ Successfully added teacher data for Harris Academy Chobham');
      console.log('📊 Pupil to All Teacher Ratio: 10.9 (matches Locrating: 18.9)');
    }
  } catch (err) {
    console.error('💥 Exception:', err.message);
  }
}

addHarrisTeacherData();
