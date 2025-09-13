import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Primary Schools in the UK | SchoolChecker.io',
  description: 'Find the best primary schools across the UK. Compare primary schools by location with Ofsted ratings, pupil numbers, and detailed reviews.',
  keywords: 'primary schools UK, best primary schools, primary school ratings, Ofsted primary schools, primary school finder',
  openGraph: {
    title: 'Best Primary Schools in the UK',
    description: 'Compare primary schools across the UK with detailed ratings and reviews.',
    url: 'https://schoolchecker.io/best-primary-schools',
    siteName: 'SchoolChecker.io',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Primary Schools in the UK',
    description: 'Compare primary schools across the UK with detailed ratings and reviews.',
  },
  alternates: {
    canonical: 'https://schoolchecker.io/best-primary-schools',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const popularLocations = [
  { name: 'London', url: 'london' },
  { name: 'Birmingham', url: 'birmingham' },
  { name: 'Manchester', url: 'manchester' },
  { name: 'Liverpool', url: 'liverpool' },
  { name: 'Leeds', url: 'leeds' },
  { name: 'Sheffield', url: 'sheffield' },
  { name: 'Bristol', url: 'bristol' },
  { name: 'Nottingham', url: 'nottingham' },
  { name: 'Leicester', url: 'leicester' },
  { name: 'Coventry', url: 'coventry' },
  { name: 'Bradford', url: 'bradford' },
  { name: 'Cardiff', url: 'cardiff' },
  { name: 'Belfast', url: 'belfast' },
  { name: 'Glasgow', url: 'glasgow' },
  { name: 'Edinburgh', url: 'edinburgh' },
]

const counties = [
  { name: 'Essex', url: 'essex' },
  { name: 'Kent', url: 'kent' },
  { name: 'Hampshire', url: 'hampshire' },
  { name: 'Surrey', url: 'surrey' },
  { name: 'Hertfordshire', url: 'hertfordshire' },
  { name: 'Cambridgeshire', url: 'cambridgeshire' },
  { name: 'Oxfordshire', url: 'oxfordshire' },
  { name: 'Buckinghamshire', url: 'buckinghamshire' },
  { name: 'Warwickshire', url: 'warwickshire' },
  { name: 'West Yorkshire', url: 'west-yorkshire' },
  { name: 'Greater Manchester', url: 'greater-manchester' },
  { name: 'Merseyside', url: 'merseyside' },
]

export default function BestPrimarySchoolsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-3 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Best Primary Schools</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Best Primary Schools in the UK
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find and compare the best primary schools across the United Kingdom. 
            Search by location, compare Ofsted ratings, and discover schools that match your family's needs.
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Find Primary Schools by Location</h2>
          <p className="text-gray-600 mb-6">
            Browse primary schools by city, town, or county. Each location page shows ranked schools with detailed ratings and statistics.
          </p>
          
          {/* Popular Cities */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Cities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {popularLocations.map((location) => (
                <Link
                  key={location.name}
                  href={`/best-primary-schools/${location.url}`}
                  className="block p-3 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-blue-800">{location.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Counties */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Counties & Regions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {counties.map((county) => (
                <Link
                  key={county.name}
                  href={`/best-primary-schools/${county.url}`}
                  className="block p-3 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-green-800">{county.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-blue-600 text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Rankings</h3>
            <p className="text-gray-600 text-sm">
              Schools are ranked by their latest Ofsted inspection ratings and our SchoolChecker.io scores.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-green-600 text-3xl mb-3">🏆</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Official Data</h3>
            <p className="text-gray-600 text-sm">
              All information comes from official government sources and is updated regularly.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-purple-600 text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Reviews</h3>
            <p className="text-gray-600 text-sm">
              Access detailed school profiles with inspection reports, pupil numbers, and more.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">How Our Rankings Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary School Ratings</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Outstanding (1):</strong> Schools providing exceptional education</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span><strong>Good (2):</strong> Schools providing a good standard of education</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">✓</span>
                  <span><strong>Requires Improvement (3):</strong> Schools that need to improve</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✓</span>
                  <span><strong>Inadequate (4):</strong> Schools with serious weaknesses</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">SchoolChecker.io Ratings</h3>
              <p className="text-gray-600 mb-3">
                For schools without recent Ofsted inspections, we provide our own rating system based on:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Academic performance data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Pupil progress indicators</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>School characteristics and demographics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  <span>Historical inspection trends</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
