const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clearPrimaryResults() {
  console.log('🧹 Clearing existing primary results data...');
  
  // Clear all year-specific fields
  const { error } = await supabase
    .from('primary_results')
    .update({
      reading_2018: null,
      maths_2018: null,
      gps_2018: null,
      rwm_exp_2018: null,
      rwm_high_2018: null,
      gps_exp_2018: null,
      gps_high_2018: null,
      
      reading_2019: null,
      maths_2019: null,
      gps_2019: null,
      rwm_exp_2019: null,
      rwm_high_2019: null,
      gps_exp_2019: null,
      gps_high_2019: null,
      
      reading_2023: null,
      maths_2023: null,
      gps_2023: null,
      rwm_exp_2023: null,
      rwm_high_2023: null,
      gps_exp_2023: null,
      gps_high_2023: null,
      
      reading_2024: null,
      maths_2024: null,
      gps_2024: null,
      rwm_exp_2024: null,
      rwm_high_2024: null,
      gps_exp_2024: null,
      gps_high_2024: null
    })
    .not('urn', 'is', null);
  
  if (error) {
    console.error('Error clearing data:', error);
  } else {
    console.log('✅ All year-specific fields cleared');
  }
  
  console.log('🎉 Ready for fresh import');
}

clearPrimaryResults();
