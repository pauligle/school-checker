import ClientSchoolsMap from '@/components/ClientSchoolsMap'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Schools Near Me - Find Local Schools | SchoolChecker.io",
  description: "Discover schools near your location with detailed information, Ofsted ratings, and catchment areas. Free school finder tool with comprehensive data.",
  keywords: "schools near me, local schools, find schools, school finder, nearby schools, schools in my area, local school search, nearby education, catchment area schools",
  alternates: {
    canonical: 'https://schoolchecker.io/schools-near-me',
  },
  openGraph: {
    title: "Schools Near Me - Find Local Schools | SchoolChecker.io",
    description: "Discover schools near your location with detailed information, Ofsted ratings, and catchment areas. Free school finder tool with comprehensive data.",
    url: 'https://schoolchecker.io/schools-near-me',
    siteName: 'SchoolChecker.io',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: 'https://schoolchecker.io/api/og?title=Schools%20Near%20Me&location=Your%20Area&rating=Local%20Schools',
        width: 1200,
        height: 630,
        alt: 'Schools Near Me - Find Local Schools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Schools Near Me - Find Local Schools | SchoolChecker.io",
    description: "Discover schools near your location with detailed information, Ofsted ratings, and catchment areas. Free school finder tool with comprehensive data.",
    images: ['https://schoolchecker.io/api/og?title=Schools%20Near%20Me&location=Your%20Area&rating=Local%20Schools'],
    creator: '@schoolcheckerio',
    site: '@schoolcheckerio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
}

export default function SchoolsNearMe() {
  return (
    <div className="bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Schools Near Me
          </h1>
          <p className="text-lg text-gray-700 mb-6 max-w-3xl">
            Find the best schools in your area with detailed Ofsted ratings, performance data, and catchment areas. 
            Use the interactive map to explore schools, compare ratings, and discover the perfect educational fit for your child.
          </p>
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <span className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Ofsted ratings & inspections
            </span>
            <span className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Performance data & rankings
            </span>
            <span className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Admissions & catchment areas
            </span>
            <span className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Parent reviews & feedback
            </span>
          </div>
        </div>
      </div>

      {/* Map Section - Contained */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="h-[600px]">
            <ClientSchoolsMap />
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Data Sources */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sources</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Official Government Data</h3>
                <p className="text-gray-700 text-sm mb-2">
                  All school information comes directly from official government databases, ensuring accuracy and reliability.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Department for Education school data</li>
                  <li>• Ofsted inspection reports and ratings</li>
                  <li>• Key Stage 2 performance results</li>
                  <li>• School admissions data</li>
                  <li>• Parent View survey responses</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Regular Updates</h3>
                <p className="text-gray-700 text-sm">
                  The database is updated regularly with the latest available data to ensure you have access to current information.
                </p>
              </div>
            </div>
          </div>

          {/* How We Calculate Rankings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How Rankings Are Calculated</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Primary School Rankings</h3>
                <p className="text-gray-700 text-sm mb-2">
                  Schools are ranked based on Key Stage 2 results, prioritizing the percentage of pupils meeting expected standards.
                </p>
                <a href="/how-school-rankings-work" className="text-blue-600 hover:text-blue-800 text-sm underline">
                  Learn more about the ranking methodology →
                </a>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Ofsted Ratings</h3>
                <p className="text-gray-700 text-sm mb-2">
                  The latest Ofsted inspection ratings are displayed alongside calculated ratings for schools without recent inspections.
                </p>
                <a href="/schoolchecker-rating" className="text-blue-600 hover:text-blue-800 text-sm underline">
                  Understand the rating system →
                </a>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Parent Reviews</h3>
                <p className="text-gray-700 text-sm">
                  Parent feedback comes directly from Ofsted Parent View surveys, showing real parent experiences and recommendations.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Additional Features */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Comprehensive School Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Performance Data</h3>
              <p className="text-blue-700 text-sm mb-2">
                View detailed academic performance including Key Stage 2 results, progress scores, and year-on-year trends.
              </p>
              <a href="/best-primary-schools-england" className="text-blue-600 hover:text-blue-800 text-sm underline">
                View England rankings →
              </a>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Admissions Data</h3>
              <p className="text-blue-700 text-sm mb-2">
                Check admissions statistics, oversubscription rates, and application success rates for informed school choices.
              </p>
              <a href="/best-primary-schools" className="text-blue-600 hover:text-blue-800 text-sm underline">
                Explore by location →
              </a>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">School Details</h3>
              <p className="text-blue-700 text-sm mb-2">
                Access comprehensive school information including pupil numbers, staff ratios, and special educational needs provision.
              </p>
              <a href="/about" className="text-blue-600 hover:text-blue-800 text-sm underline">
                Learn more about the platform →
              </a>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
