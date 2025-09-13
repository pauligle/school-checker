require('dotenv').config({ path: '../.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Major English cities with their postcode prefixes
const majorCities = [
  { name: 'Manchester', postcodes: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24', 'M25', 'M26', 'M27', 'M28', 'M29', 'M30', 'M31', 'M32', 'M33', 'M34', 'M35', 'M36', 'M37', 'M38', 'M39', 'M40', 'M41', 'M42', 'M43', 'M44', 'M45', 'M46', 'M47', 'M48', 'M49', 'M50'] },
  { name: 'Birmingham', postcodes: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15', 'B16', 'B17', 'B18', 'B19', 'B20', 'B21', 'B22', 'B23', 'B24', 'B25', 'B26', 'B27', 'B28', 'B29', 'B30', 'B31', 'B32', 'B33', 'B34', 'B35', 'B36', 'B37', 'B38', 'B39', 'B40', 'B41', 'B42', 'B43', 'B44', 'B45', 'B46', 'B47', 'B48', 'B49', 'B50'] },
  { name: 'Leeds', postcodes: ['LS1', 'LS2', 'LS3', 'LS4', 'LS5', 'LS6', 'LS7', 'LS8', 'LS9', 'LS10', 'LS11', 'LS12', 'LS13', 'LS14', 'LS15', 'LS16', 'LS17', 'LS18', 'LS19', 'LS20', 'LS21', 'LS22', 'LS23', 'LS24', 'LS25', 'LS26', 'LS27', 'LS28', 'LS29'] },
  { name: 'Liverpool', postcodes: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12', 'L13', 'L14', 'L15', 'L16', 'L17', 'L18', 'L19', 'L20', 'L21', 'L22', 'L23', 'L24', 'L25', 'L26', 'L27', 'L28', 'L29', 'L30', 'L31', 'L32', 'L33', 'L34', 'L35', 'L36', 'L37', 'L38', 'L39', 'L40', 'L41', 'L42', 'L43', 'L44', 'L45', 'L46', 'L47', 'L48', 'L49', 'L50'] },
  { name: 'Bristol', postcodes: ['BS1', 'BS2', 'BS3', 'BS4', 'BS5', 'BS6', 'BS7', 'BS8', 'BS9', 'BS10', 'BS11', 'BS12', 'BS13', 'BS14', 'BS15', 'BS16', 'BS17', 'BS18', 'BS19', 'BS20', 'BS21', 'BS22', 'BS23', 'BS24', 'BS25', 'BS26', 'BS27', 'BS28', 'BS29', 'BS30', 'BS31', 'BS32', 'BS33', 'BS34', 'BS35', 'BS36', 'BS37', 'BS38', 'BS39', 'BS40', 'BS41', 'BS42', 'BS43', 'BS44', 'BS45', 'BS46', 'BS47', 'BS48', 'BS49', 'BS50'] },
  { name: 'Newcastle upon Tyne', postcodes: ['NE1', 'NE2', 'NE3', 'NE4', 'NE5', 'NE6', 'NE7', 'NE8', 'NE9', 'NE10', 'NE11', 'NE12', 'NE13', 'NE14', 'NE15', 'NE16', 'NE17', 'NE18', 'NE19', 'NE20', 'NE21', 'NE22', 'NE23', 'NE24', 'NE25', 'NE26', 'NE27', 'NE28', 'NE29', 'NE30', 'NE31', 'NE32', 'NE33', 'NE34', 'NE35', 'NE36', 'NE37', 'NE38', 'NE39', 'NE40', 'NE41', 'NE42', 'NE43', 'NE44', 'NE45', 'NE46', 'NE47', 'NE48', 'NE49', 'NE50'] },
  { name: 'Nottingham', postcodes: ['NG1', 'NG2', 'NG3', 'NG4', 'NG5', 'NG6', 'NG7', 'NG8', 'NG9', 'NG10', 'NG11', 'NG12', 'NG13', 'NG14', 'NG15', 'NG16', 'NG17', 'NG18', 'NG19', 'NG20', 'NG21', 'NG22', 'NG23', 'NG24', 'NG25', 'NG26', 'NG27', 'NG28', 'NG29', 'NG30', 'NG31', 'NG32', 'NG33', 'NG34', 'NG35', 'NG36', 'NG37', 'NG38', 'NG39', 'NG40', 'NG41', 'NG42', 'NG43', 'NG44', 'NG45', 'NG46', 'NG47', 'NG48', 'NG49', 'NG50'] },
  { name: 'Leicester', postcodes: ['LE1', 'LE2', 'LE3', 'LE4', 'LE5', 'LE6', 'LE7', 'LE8', 'LE9', 'LE10', 'LE11', 'LE12', 'LE13', 'LE14', 'LE15', 'LE16', 'LE17', 'LE18', 'LE19', 'LE20', 'LE21', 'LE22', 'LE23', 'LE24', 'LE25', 'LE26', 'LE27', 'LE28', 'LE29', 'LE30', 'LE31', 'LE32', 'LE33', 'LE34', 'LE35', 'LE36', 'LE37', 'LE38', 'LE39', 'LE40', 'LE41', 'LE42', 'LE43', 'LE44', 'LE45', 'LE46', 'LE47', 'LE48', 'LE49', 'LE50'] },
  { name: 'Coventry', postcodes: ['CV1', 'CV2', 'CV3', 'CV4', 'CV5', 'CV6', 'CV7', 'CV8', 'CV9', 'CV10', 'CV11', 'CV12', 'CV13', 'CV14', 'CV15', 'CV16', 'CV17', 'CV18', 'CV19', 'CV20', 'CV21', 'CV22', 'CV23', 'CV24', 'CV25', 'CV26', 'CV27', 'CV28', 'CV29', 'CV30', 'CV31', 'CV32', 'CV33', 'CV34', 'CV35', 'CV36', 'CV37', 'CV38', 'CV39', 'CV40', 'CV41', 'CV42', 'CV43', 'CV44', 'CV45', 'CV46', 'CV47', 'CV48', 'CV49', 'CV50'] },
  { name: 'Oxford', postcodes: ['OX1', 'OX2', 'OX3', 'OX4', 'OX5', 'OX6', 'OX7', 'OX8', 'OX9', 'OX10', 'OX11', 'OX12', 'OX13', 'OX14', 'OX15', 'OX16', 'OX17', 'OX18', 'OX19', 'OX20', 'OX21', 'OX22', 'OX23', 'OX24', 'OX25', 'OX26', 'OX27', 'OX28', 'OX29', 'OX30', 'OX31', 'OX32', 'OX33', 'OX34', 'OX35', 'OX36', 'OX37', 'OX38', 'OX39', 'OX40', 'OX41', 'OX42', 'OX43', 'OX44', 'OX45', 'OX46', 'OX47', 'OX48', 'OX49', 'OX50'] },
  { name: 'Cambridge', postcodes: ['CB1', 'CB2', 'CB3', 'CB4', 'CB5', 'CB6', 'CB7', 'CB8', 'CB9', 'CB10', 'CB11', 'CB12', 'CB13', 'CB14', 'CB15', 'CB16', 'CB17', 'CB18', 'CB19', 'CB20', 'CB21', 'CB22', 'CB23', 'CB24', 'CB25', 'CB26', 'CB27', 'CB28', 'CB29', 'CB30', 'CB31', 'CB32', 'CB33', 'CB34', 'CB35', 'CB36', 'CB37', 'CB38', 'CB39', 'CB40', 'CB41', 'CB42', 'CB43', 'CB44', 'CB45', 'CB46', 'CB47', 'CB48', 'CB49', 'CB50'] },
  { name: 'York', postcodes: ['YO1', 'YO2', 'YO3', 'YO4', 'YO5', 'YO6', 'YO7', 'YO8', 'YO9', 'YO10', 'YO11', 'YO12', 'YO13', 'YO14', 'YO15', 'YO16', 'YO17', 'YO18', 'YO19', 'YO20', 'YO21', 'YO22', 'YO23', 'YO24', 'YO25', 'YO26', 'YO27', 'YO28', 'YO29', 'YO30', 'YO31', 'YO32', 'YO33', 'YO34', 'YO35', 'YO36', 'YO37', 'YO38', 'YO39', 'YO40', 'YO41', 'YO42', 'YO43', 'YO44', 'YO45', 'YO46', 'YO47', 'YO48', 'YO49', 'YO50'] },
  { name: 'Plymouth', postcodes: ['PL1', 'PL2', 'PL3', 'PL4', 'PL5', 'PL6', 'PL7', 'PL8', 'PL9', 'PL10', 'PL11', 'PL12', 'PL13', 'PL14', 'PL15', 'PL16', 'PL17', 'PL18', 'PL19', 'PL20', 'PL21', 'PL22', 'PL23', 'PL24', 'PL25', 'PL26', 'PL27', 'PL28', 'PL29', 'PL30', 'PL31', 'PL32', 'PL33', 'PL34', 'PL35', 'PL36', 'PL37', 'PL38', 'PL39', 'PL40', 'PL41', 'PL42', 'PL43', 'PL44', 'PL45', 'PL46', 'PL47', 'PL48', 'PL49', 'PL50'] },
  { name: 'Southampton', postcodes: ['SO1', 'SO2', 'SO3', 'SO4', 'SO5', 'SO6', 'SO7', 'SO8', 'SO9', 'SO10', 'SO11', 'SO12', 'SO13', 'SO14', 'SO15', 'SO16', 'SO17', 'SO18', 'SO19', 'SO20', 'SO21', 'SO22', 'SO23', 'SO24', 'SO25', 'SO26', 'SO27', 'SO28', 'SO29', 'SO30', 'SO31', 'SO32', 'SO33', 'SO34', 'SO35', 'SO36', 'SO37', 'SO38', 'SO39', 'SO40', 'SO41', 'SO42', 'SO43', 'SO44', 'SO45', 'SO46', 'SO47', 'SO48', 'SO49', 'SO50'] },
  { name: 'Derby', postcodes: ['DE1', 'DE2', 'DE3', 'DE4', 'DE5', 'DE6', 'DE7', 'DE8', 'DE9', 'DE10', 'DE11', 'DE12', 'DE13', 'DE14', 'DE15', 'DE16', 'DE17', 'DE18', 'DE19', 'DE20', 'DE21', 'DE22', 'DE23', 'DE24', 'DE25', 'DE26', 'DE27', 'DE28', 'DE29', 'DE30', 'DE31', 'DE32', 'DE33', 'DE34', 'DE35', 'DE36', 'DE37', 'DE38', 'DE39', 'DE40', 'DE41', 'DE42', 'DE43', 'DE44', 'DE45', 'DE46', 'DE47', 'DE48', 'DE49', 'DE50'] },
  { name: 'Portsmouth', postcodes: ['PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12', 'PO13', 'PO14', 'PO15', 'PO16', 'PO17', 'PO18', 'PO19', 'PO20', 'PO21', 'PO22', 'PO23', 'PO24', 'PO25', 'PO26', 'PO27', 'PO28', 'PO29', 'PO30', 'PO31', 'PO32', 'PO33', 'PO34', 'PO35', 'PO36', 'PO37', 'PO38', 'PO39', 'PO40', 'PO41', 'PO42', 'PO43', 'PO44', 'PO45', 'PO46', 'PO47', 'PO48', 'PO49', 'PO50'] },
  { name: 'Norwich', postcodes: ['NR1', 'NR2', 'NR3', 'NR4', 'NR5', 'NR6', 'NR7', 'NR8', 'NR9', 'NR10', 'NR11', 'NR12', 'NR13', 'NR14', 'NR15', 'NR16', 'NR17', 'NR18', 'NR19', 'NR20', 'NR21', 'NR22', 'NR23', 'NR24', 'NR25', 'NR26', 'NR27', 'NR28', 'NR29', 'NR30', 'NR31', 'NR32', 'NR33', 'NR34', 'NR35', 'NR36', 'NR37', 'NR38', 'NR39', 'NR40', 'NR41', 'NR42', 'NR43', 'NR44', 'NR45', 'NR46', 'NR47', 'NR48', 'NR49', 'NR50'] },
  { name: 'Exeter', postcodes: ['EX1', 'EX2', 'EX3', 'EX4', 'EX5', 'EX6', 'EX7', 'EX8', 'EX9', 'EX10', 'EX11', 'EX12', 'EX13', 'EX14', 'EX15', 'EX16', 'EX17', 'EX18', 'EX19', 'EX20', 'EX21', 'EX22', 'EX23', 'EX24', 'EX25', 'EX26', 'EX27', 'EX28', 'EX29', 'EX30', 'EX31', 'EX32', 'EX33', 'EX34', 'EX35', 'EX36', 'EX37', 'EX38', 'EX39', 'EX40', 'EX41', 'EX42', 'EX43', 'EX44', 'EX45', 'EX46', 'EX47', 'EX48', 'EX49', 'EX50'] },
  { name: 'Bath', postcodes: ['BA1', 'BA2', 'BA3', 'BA4', 'BA5', 'BA6', 'BA7', 'BA8', 'BA9', 'BA10', 'BA11', 'BA12', 'BA13', 'BA14', 'BA15', 'BA16', 'BA17', 'BA18', 'BA19', 'BA20', 'BA21', 'BA22', 'BA23', 'BA24', 'BA25', 'BA26', 'BA27', 'BA28', 'BA29', 'BA30', 'BA31', 'BA32', 'BA33', 'BA34', 'BA35', 'BA36', 'BA37', 'BA38', 'BA39', 'BA40', 'BA41', 'BA42', 'BA43', 'BA44', 'BA45', 'BA46', 'BA47', 'BA48', 'BA49', 'BA50'] }
]

async function addMajorCities() {
  try {
    console.log('Adding major English cities with postcode prefixes...')
    
    const existingCities = JSON.parse(fs.readFileSync(
      path.join(process.cwd(), 'city-pages-to-create.json'), 
      'utf8'
    ))
    
    const existingCityNames = existingCities.map(city => city.city.toLowerCase())
    
    const newCities = []
    
    for (const cityData of majorCities) {
      if (existingCityNames.includes(cityData.name.toLowerCase())) {
        console.log(`Skipping ${cityData.name} - already exists`)
        continue
      }
      
      console.log(`Processing ${cityData.name}...`)
      
      // Count schools for this city using postcode prefixes
      const postcodePatterns = cityData.postcodes.map(pc => `${pc}%`)
      
      const { count: totalSchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .or(postcodePatterns.map(pattern => `postcode.like.${pattern}`).join(','))
      
      const { count: primarySchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .or(postcodePatterns.map(pattern => `postcode.like.${pattern}`).join(','))
        .in('phaseofeducation__name_', ['Primary', 'All-through'])
      
      const { count: secondarySchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .or(postcodePatterns.map(pattern => `postcode.like.${pattern}`).join(','))
        .in('phaseofeducation__name_', ['Secondary', 'All-through'])
      
      if (primarySchools > 0) {
        newCities.push({
          city: cityData.name,
          slug: cityData.name.toLowerCase().replace(/\s+/g, '-'),
          county: 'Unknown',
          region: 'Unknown',
          country: 'England',
          totalSchools: totalSchools || 0,
          primarySchools: primarySchools || 0,
          secondarySchools: secondarySchools || 0,
          postcodeCount: cityData.postcodes.length,
          postcodes: cityData.postcodes.slice(0, 10), // Limit to first 10 postcodes
          pagesToCreate: {
            primary: (primarySchools || 0) >= 10,
            secondary: (secondarySchools || 0) >= 10,
            all: true
          }
        })
        
        console.log(`Added ${cityData.name}: ${primarySchools} primary schools`)
      } else {
        console.log(`Skipping ${cityData.name} - no primary schools found`)
      }
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
