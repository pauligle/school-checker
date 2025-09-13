require('dotenv').config({ path: '../.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Major English cities to add
const majorCities = [
  'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol', 'Newcastle upon Tyne',
  'Nottingham', 'Leicester', 'Coventry', 'Bradford', 'Cardiff', 'Belfast',
  'Sheffield', 'Edinburgh', 'Glasgow', 'Leicester', 'Wakefield', 'Coventry',
  'Nottingham', 'Kingston upon Hull', 'Plymouth', 'Stoke-on-Trent', 'Wolverhampton',
  'Derby', 'Swansea', 'Southampton', 'Salford', 'Aberdeen', 'Westminster',
  'Portsmouth', 'York', 'Peterborough', 'Dundee', 'Lancaster', 'Oxford',
  'Newport', 'Preston', 'St Albans', 'Norwich', 'Chester', 'Cambridge',
  'Salisbury', 'Exeter', 'Gloucester', 'Bath', 'Hereford', 'Worcester',
  'Canterbury', 'Ripon', 'Truro', 'Wells', 'Chichester', 'Winchester'
]

async function addMajorCities() {
  try {
    console.log('Adding major English cities...')
    
    const existingCities = JSON.parse(fs.readFileSync(
      path.join(process.cwd(), 'city-pages-to-create.json'), 
      'utf8'
    ))
    
    const existingCityNames = existingCities.map(city => city.city.toLowerCase())
    
    const newCities = []
    
    for (const cityName of majorCities) {
      if (existingCityNames.includes(cityName.toLowerCase())) {
        console.log(`Skipping ${cityName} - already exists`)
        continue
      }
      
      console.log(`Processing ${cityName}...`)
      
      // Get postcodes for this city using postcodes.io API
      try {
        const response = await fetch(`https://api.postcodes.io/postcodes?q=${encodeURIComponent(cityName)}`)
        const data = await response.json()
        
        if (data.result && data.result.length > 0) {
          const postcodes = data.result.map(item => item.postcode)
          
          // Count schools for this city
          const { count: totalSchools } = await supabase
            .from('schools')
            .select('*', { count: 'exact', head: true })
            .in('postcode', postcodes)
          
          const { count: primarySchools } = await supabase
            .from('schools')
            .select('*', { count: 'exact', head: true })
            .in('postcode', postcodes)
            .in('phaseofeducation__name_', ['Primary', 'All-through'])
          
          const { count: secondarySchools } = await supabase
            .from('schools')
            .select('*', { count: 'exact', head: true })
            .in('postcode', postcodes)
            .in('phaseofeducation__name_', ['Secondary', 'All-through'])
          
          if (primarySchools > 0) {
            newCities.push({
              city: cityName,
              slug: cityName.toLowerCase().replace(/\s+/g, '-'),
              county: 'Unknown',
              region: 'Unknown',
              country: 'England',
              totalSchools: totalSchools || 0,
              primarySchools: primarySchools || 0,
              secondarySchools: secondarySchools || 0,
              postcodeCount: postcodes.length,
              postcodes: postcodes.slice(0, 10), // Limit to first 10 postcodes
              pagesToCreate: {
                primary: (primarySchools || 0) >= 10,
                secondary: (secondarySchools || 0) >= 10,
                all: true
              }
            })
            
            console.log(`Added ${cityName}: ${primarySchools} primary schools`)
          } else {
            console.log(`Skipping ${cityName} - no primary schools found`)
          }
        } else {
          console.log(`No postcodes found for ${cityName}`)
        }
      } catch (error) {
        console.error(`Error processing ${cityName}:`, error.message)
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Combine existing and new cities
    const allCities = [...existingCities, ...newCities]
      .sort((a, b) => b.primarySchools - a.primarySchools)
    
    // Save updated data
    fs.writeFileSync(
      path.join(process.cwd(), 'city-pages-to-create.json'),
      JSON.stringify(allCities, null, 2)
    )
    
    console.log(`\nAdded ${newCities.length} new cities`)
    console.log(`Total cities: ${allCities.length}`)
    console.log('Updated city-pages-to-create.json')
    
  } catch (error) {
    console.error('Error adding major cities:', error)
  }
}

addMajorCities()
