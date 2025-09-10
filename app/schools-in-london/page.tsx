import ClientSchoolsMap from '@/components/ClientSchoolsMap'

export const metadata = {
  title: "Schools in London - Find the Best Schools in London | SchoolChecker.io",
  description: "Discover the best schools in London with detailed Ofsted ratings, performance data, and catchment areas. Free school finder for London schools.",
  keywords: "schools in london, london schools, best schools london, primary schools london, secondary schools london, london school finder",
  openGraph: {
    title: "Schools in London - Find the Best Schools in London | SchoolChecker.io",
    description: "Discover the best schools in London with detailed Ofsted ratings, performance data, and catchment areas.",
    type: "website",
  },
}

export default function SchoolsInLondon() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Content Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Schools in London
          </h1>
          <p className="text-sm text-gray-700 mb-3">
            Find the best schools in London with detailed Ofsted ratings, performance data, and catchment areas. 
            Explore over 2,000 schools across all London boroughs.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <span className="flex items-center">
              <span className="text-green-500 mr-1">✓</span>
              All London boroughs
            </span>
            <span className="flex items-center">
              <span className="text-green-500 mr-1">✓</span>
              Ofsted ratings
            </span>
            <span className="flex items-center">
              <span className="text-green-500 mr-1">✓</span>
              Performance data
            </span>
            <span className="flex items-center">
              <span className="text-green-500 mr-1">✓</span>
              Catchment areas
            </span>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="h-screen">
        <ClientSchoolsMap />
      </div>

      {/* Additional SEO Content */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Best Schools in London
            </h2>
            <div className="prose text-gray-700">
              <p className="mb-4">
                London is home to some of the UK&apos;s most prestigious schools, from outstanding primary schools 
                to world-renowned secondary institutions. Our comprehensive database covers all schools across 
                London&apos;s 32 boroughs, helping parents find the perfect educational environment for their children.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                London School Types
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Primary Schools:</strong> Over 1,500 primary schools serving ages 4-11</li>
                <li><strong>Secondary Schools:</strong> 400+ secondary schools for ages 11-16/18</li>
                <li><strong>Nurseries:</strong> Early years provision across all boroughs</li>
                <li><strong>Special Schools:</strong> Specialist provision for children with additional needs</li>
                <li><strong>Independent Schools:</strong> Private schools including some of the UK's most prestigious</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Popular London Boroughs
              </h3>
              <p className="mb-4">
                Each London borough has its own unique educational landscape. Some of the most popular areas 
                for families include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Kensington & Chelsea:</strong> Home to some of London&apos;s most prestigious schools</li>
                <li><strong>Westminster:</strong> Central London with excellent transport links</li>
                <li><strong>Camden:</strong> Diverse community with strong educational options</li>
                <li><strong>Islington:</strong> Popular with families, good school choices</li>
                <li><strong>Hackney:</strong> Vibrant area with improving school standards</li>
                <li><strong>Richmond upon Thames:</strong> Excellent schools and green spaces</li>
                <li><strong>Barnet:</strong> Strong grammar school provision</li>
                <li><strong>Harrow:</strong> Well-regarded schools and family-friendly</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Why Use SchoolChecker.io for London Schools?
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Complete Coverage:</strong> Every school in every London borough</li>
                <li><strong>Real-time Data:</strong> Up-to-date Ofsted ratings and performance data</li>
                <li><strong>Interactive Maps:</strong> See schools in their geographical context</li>
                <li><strong>Free Access:</strong> No subscription required, unlike other school finders</li>
                <li><strong>Detailed Information:</strong> Pupil data, catchment areas, and more</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
