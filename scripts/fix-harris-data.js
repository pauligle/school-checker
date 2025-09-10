const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixHarrisData() {
  console.log('🔧 Fixing Harris Academy Chobham data with correct Locrating values...');
  
  // Update ALL records for this URN with the correct year-specific data
  const { error: errorAll } = await supabase
    .from('primary_results')
    .update({
      // 2024 data (from Locrating screenshot)
      reading_2024: 108,
      maths_2024: 107,
      rwm_exp_2024: 89,
      rwm_high_2024: 9,
      gps_exp_2024: 93,
      gps_high_2024: 49,
      
      // 2023 data (from Locrating screenshot)
      reading_2023: 107,
      maths_2023: 107,
      rwm_exp_2023: 71,
      rwm_high_2023: 22,
      gps_exp_2023: 81,
      gps_high_2023: 48,
      
      // 2019 data (from Locrating screenshot)
      reading_2019: 106,
      maths_2019: 108,
      rwm_exp_2019: 82,
      rwm_high_2019: 14,
      gps_exp_2019: 92,
      gps_high_2019: 64,
      
      // 2018 data (from Locrating screenshot)
      reading_2018: 106,
      maths_2018: 107,
      rwm_exp_2018: 80,
      rwm_high_2018: 16,
      gps_exp_2018: 97,
      gps_high_2018: 54
    })
    .eq('urn', 139703);
  
  if (errorAll) {
    console.log('Update error:', errorAll);
  } else {
    console.log('✅ All Harris Academy Chobham records updated with correct year-specific data');
  }
  
  console.log('🎉 Harris Academy Chobham data fixed!');
}

fixHarrisData();
