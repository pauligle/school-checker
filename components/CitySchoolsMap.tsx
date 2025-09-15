"use client"

import dynamic from 'next/dynamic'

const SchoolsMapNew = dynamic(() => import('@/components/SchoolsMapNew'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
})

interface SchoolData {
  id: string
  establishmentname: string
  urn: string
  la__name_: string
  typeofestablishment__name_: string
  numberofpupils: number
  postcode: string | null
  lat: number | null
  lon: number | null
}

interface CitySchoolsMapProps {
  schools: SchoolData[]
  city: string
}

export default function CitySchoolsMap({ schools, city }: CitySchoolsMapProps) {
  // Get city center coordinates (you might want to expand this with more cities)
  const cityCoordinates: { [key: string]: [number, number] } = {
    // London Postcode Areas
    'East London': [51.5388, -0.0598], // Tower Hamlets area
    'Eastern Central London': [51.5154, -0.0915], // City of London
    'North London': [51.5416, -0.1462], // Camden/Islington area
    'North West London': [51.5320, -0.1773], // Brent/Camden area
    'South East London': [51.4756, -0.0523], // Greenwich/Lewisham area
    'South West London': [51.4578, -0.1960], // Wandsworth/Richmond area
    'West London': [51.5074, -0.1958], // Westminster/Kensington area
    'Western Central London': [51.5154, -0.1278], // Camden/Westminster area
    
    // London Districts
    'Bow': [51.5274, -0.0207],
    'Bethnal Green': [51.5274, -0.0550],
    'Hackney': [51.5450, -0.0550],
    'Stratford': [51.5416, -0.0032],
    'Walthamstow': [51.5856, -0.0194],
    'Tottenham': [51.5906, -0.0394],
    'Stoke Newington': [51.5619, -0.0744],
    'Chingford': [51.6326, -0.0126],
    'Clapton': [51.5619, -0.0550],
    'East Ham': [51.5388, 0.0523],
    'Forest Gate': [51.5494, -0.0244],
    'Homerton': [51.5450, -0.0394],
    'Leyton': [51.5681, -0.0131],
    'Leytonstone': [51.5681, 0.0081],
    'Manor Park': [51.5494, 0.0523],
    'Plaistow': [51.5319, 0.0244],
    'Poplar': [51.5074, -0.0126],
    'Victoria Docks and North Woolwich': [51.4994, 0.0644],
    'Woodford and South Woodford': [51.5906, 0.0244],
    'Olympic Park': [51.5388, -0.0126],
    'Hampstead': [51.5551, -0.1744],
    'Kilburn': [51.5472, -0.1944],
    'Willesden': [51.5406, -0.2244],
    'Greenwich': [51.4769, -0.0006],
    'Lewisham': [51.4556, -0.0119],
    'Peckham': [51.4744, -0.0694],
    'Camberwell': [51.4744, -0.0919],
    'Woolwich': [51.4994, 0.0644],
    'Clapham': [51.4619, -0.1381],
    'Battersea': [51.4744, -0.1556],
    'Wimbledon': [51.4219, -0.2069],
    'Putney': [51.4619, -0.2169],
    'Chelsea': [51.4875, -0.1688],
    'Fulham': [51.4744, -0.1944],
    'Kensington': [51.5074, -0.1875],
    'Notting Hill': [51.5156, -0.1969],
    'Hammersmith': [51.4925, -0.2225],
    'Ealing': [51.5156, -0.3044],
    'Acton': [51.5074, -0.2625],
    'Chiswick': [51.4944, -0.2544],
    'Paddington': [51.5156, -0.1756],
    'Maida Hill': [51.5274, -0.1831],
    'Ladbroke Grove': [51.5219, -0.2069],
    'Shepherds Bush': [51.5056, -0.2244],
    'West Kensington': [51.4944, -0.2069],
    'West Ealing': [51.5156, -0.3244],
    'Hanwell': [51.5156, -0.3344],
    
    // Other Cities
    'Sheffield': [53.3811, -1.4701],
    'Bradford': [53.7960, -1.7594],
    'Bromley': [51.4058, 0.0144],
    'Croydon': [51.3762, -0.0982],
    'Rotherham': [53.4302, -1.3568],
    'Bexley': [51.4560, 0.1500],
    'Havering': [51.5775, 0.1850],
    'Enfield': [51.6520, -0.0810],
    'Brent': [51.5588, -0.2818],
    'Harrow': [51.5804, -0.3420],
    'Barnet': [51.6252, -0.1527],
    'Haringey': [51.5906, -0.1100],
    'Hillingdon': [51.5350, -0.4480],
    'Barking and Dagenham': [51.5367, 0.0814],
    'Westminster': [51.4975, -0.1357],
    'Wigan': [53.5450, -2.6315],
    'Leeds': [53.8008, -1.5491],
    'Manchester': [53.4808, -2.2426],
    'Birmingham': [52.4862, -1.8904],
    'Liverpool': [53.4084, -2.9916],
    'London': [51.5074, -0.1278],
    
    // Additional Cities from city-pages-to-create.json
    'Nottingham': [52.9548, -1.1581],
    'Newcastle upon Tyne': [54.9783, -1.6178],
    'Bristol': [51.4545, -2.5879],
    'Leicester': [52.6369, -1.1398],
    'Coventry': [52.4068, -1.5197],
    'Derby': [52.9225, -1.4746],
    'Norwich': [52.6309, 1.2974],
    'Plymouth': [50.3755, -4.1427],
    'Exeter': [50.7184, -3.5339],
    'Oxford': [51.7520, -1.2577],
    'York': [53.9590, -1.0815],
    'Portsmouth': [50.8198, -1.0880],
    'Bath': [51.3811, -2.3590],
    'Southampton': [50.9097, -1.4044],
    'Cambridge': [52.2053, 0.1218],
    
    // Local Authorities
    'Leicestershire': [52.6369, -1.1398], // Same as Leicester
    'Norfolk': [52.6309, 1.2974], // Same as Norwich
    'Suffolk': [52.1872, 0.9708], // Ipswich area
    'Essex': [51.7356, 0.4686], // Chelmsford area
    'Kent': [51.2787, 0.5217], // Maidstone area
    'Surrey': [51.3148, -0.5600], // Guildford area
    'Hampshire': [51.0579, -1.3081], // Winchester area
    'Devon': [50.7156, -3.5309], // Exeter area
    'Cornwall': [50.2660, -5.0527], // Truro area
    'Somerset': [51.1051, -2.9262], // Taunton area
    'Dorset': [50.7156, -2.4264], // Dorchester area
    'Wiltshire': [51.3498, -1.9942], // Salisbury area
    'Gloucestershire': [51.8642, -2.2381], // Gloucester area
    'Oxfordshire': [51.7520, -1.2577], // Same as Oxford
    'Buckinghamshire': [51.8133, -0.8097], // Aylesbury area
    'Hertfordshire': [51.8098, -0.2377], // Hertford area
    'Bedfordshire': [52.1351, -0.4663], // Bedford area
    'Cambridgeshire': [52.2053, 0.1218], // Same as Cambridge
    'Lincolnshire': [53.2307, -0.5408], // Lincoln area
    'Nottinghamshire': [52.9548, -1.1581], // Same as Nottingham
    'Derbyshire': [53.1056, -1.4756], // Derby area
    'Leicestershire': [52.6369, -1.1398], // Same as Leicester
    'Northamptonshire': [52.2405, -0.9027], // Northampton area
    'Warwickshire': [52.2819, -1.5845], // Warwick area
    'Staffordshire': [52.8067, -2.1167], // Stafford area
    'Shropshire': [52.7069, -2.7528], // Shrewsbury area
    'Herefordshire': [52.0567, -2.7167], // Hereford area
    'Worcestershire': [52.1936, -2.2206], // Worcester area
    'West Midlands': [52.4862, -1.8904], // Same as Birmingham
    'Cheshire': [53.1906, -2.8919], // Chester area
    'Greater Manchester': [53.4808, -2.2426], // Same as Manchester
    'Lancashire': [53.7632, -2.7031], // Preston area
    'Merseyside': [53.4084, -2.9916], // Same as Liverpool
    'Greater London': [51.5074, -0.1278], // Same as London
    'West Yorkshire': [53.8008, -1.5491], // Same as Leeds
    'South Yorkshire': [53.3811, -1.4701], // Same as Sheffield
    'North Yorkshire': [53.9590, -1.0815], // Same as York
    'East Yorkshire': [53.7676, -0.3274], // Hull area
    'Tyne and Wear': [54.9783, -1.6178], // Same as Newcastle
    'Northumberland': [55.2083, -2.0785], // Morpeth area
    'Durham': [54.7794, -1.5756], // Durham area
    'Cumbria': [54.8952, -2.9441], // Carlisle area
    'North East': [54.9783, -1.6178], // Newcastle area
    'North West': [53.4808, -2.2426], // Manchester area
    'Yorkshire and the Humber': [53.8008, -1.5491], // Leeds area
    'East Midlands': [52.6369, -1.1398], // Leicester area
    'West Midlands': [52.4862, -1.8904], // Birmingham area
    'East of England': [52.2053, 0.1218], // Cambridge area
    'London': [51.5074, -0.1278], // London
    'South East': [51.2787, 0.5217], // Kent area
    'South West': [50.7156, -3.5309] // Devon area
  }

  // Find city coordinates with improved lookup logic
  const cityKey = Object.keys(cityCoordinates).find(key => {
    const keyLower = key.toLowerCase()
    const cityLower = city.toLowerCase()
    
    // Direct match
    if (keyLower === cityLower) return true
    
    // Handle common variations
    if (cityLower === 'leicestershire' && keyLower === 'leicester') return true
    if (cityLower === 'newcastle-upon-tyne' && keyLower === 'newcastle upon tyne') return true
    if (cityLower === 'barking-and-dagenham' && keyLower === 'barking and dagenham') return true
    if (cityLower === 'woodford-and-south-woodford' && keyLower === 'woodford and south woodford') return true
    if (cityLower === 'victoria-docks-and-north-woolwich' && keyLower === 'victoria docks and north woolwich') return true
    if (cityLower === 'stoke-newington' && keyLower === 'stoke newington') return true
    if (cityLower === 'east-ham' && keyLower === 'east ham') return true
    if (cityLower === 'forest-gate' && keyLower === 'forest gate') return true
    if (cityLower === 'manor-park' && keyLower === 'manor park') return true
    if (cityLower === 'west-ealing' && keyLower === 'west ealing') return true
    if (cityLower === 'maida-hill' && keyLower === 'maida hill') return true
    if (cityLower === 'ladbroke-grove' && keyLower === 'ladbroke grove') return true
    if (cityLower === 'shepherds-bush' && keyLower === 'shepherds bush') return true
    if (cityLower === 'west-kensington' && keyLower === 'west kensington') return true
    if (cityLower === 'notting-hill' && keyLower === 'notting hill') return true
    if (cityLower === 'south-east-london' && keyLower === 'south east london') return true
    if (cityLower === 'south-west-london' && keyLower === 'south west london') return true
    if (cityLower === 'north-west-london' && keyLower === 'north west london') return true
    if (cityLower === 'eastern-central-london' && keyLower === 'eastern central london') return true
    if (cityLower === 'western-central-london' && keyLower === 'western central london') return true
    
    return false
  })
  
  const center = cityKey ? cityCoordinates[cityKey] : [51.5074, -0.1278] // Default to London instead of Leeds
  const zoom = 10

  return (
    <div className="h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-lg">
      <SchoolsMapNew
        center={center as any}
        zoom={zoom as any}
        schools={schools as any}
        city={city as any}
      />
    </div>
  )
}
