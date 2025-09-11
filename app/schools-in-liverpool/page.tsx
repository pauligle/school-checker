import ClientSchoolsMap from '@/components/ClientSchoolsMap'

export const metadata = {
  title: "Schools in Liverpool - Find the Best Schools in Liverpool | SchoolChecker.io",
  description: "Discover the best schools in Liverpool with detailed Ofsted ratings, performance data, and catchment areas. Free school finder for Liverpool schools.",
  keywords: "schools in liverpool, liverpool schools, best schools liverpool, primary schools liverpool, secondary schools liverpool, liverpool school finder",
  openGraph: {
    title: "Schools in Liverpool - Find the Best Schools in Liverpool | SchoolChecker.io",
    description: "Discover the best schools in Liverpool with detailed Ofsted ratings, performance data, and catchment areas.",
    type: "website",
  },
}

export default function SchoolsInLiverpool() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Content Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Schools in Liverpool
          </h1>
          <p className="text-sm text-gray-700 mb-3">
            Find the best schools in Liverpool with detailed Ofsted ratings, performance data, and catchment areas. 
            Explore schools across Liverpool and Merseyside.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <span className="flex items-center">
              <span className="text-green-500 mr-1">✓</span>
              Merseyside
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
              Best Schools in Liverpool
            </h2>
            <div className="prose text-gray-700">
              <p className="mb-4">
                Liverpool is a vibrant city with a rich educational heritage. From outstanding primary schools 
                to excellent secondary institutions, Liverpool offers families a wide choice of high-quality schools 
                across the city and surrounding areas.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Liverpool School Types
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Primary Schools:</strong> Excellent primary education across all areas</li>
                <li><strong>Secondary Schools:</strong> Strong secondary provision including grammar schools</li>
                <li><strong>Nurseries:</strong> Early years provision throughout the city</li>
                <li><strong>Special Schools:</strong> Specialist support for children with additional needs</li>
                <li><strong>Independent Schools:</strong> Private schools including some of the region&apos;s best</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Popular Liverpool Areas
              </h3>
              <p className="mb-4">
                Liverpool offers diverse neighborhoods, each with their own educational strengths:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Woolton:</strong> Popular with families, excellent schools</li>
                <li><strong>Allerton:</strong> Vibrant community with good educational options</li>
                <li><strong>Childwall:</strong> Strong schools and family-friendly environment</li>
                <li><strong>Mossley Hill:</strong> Well-regarded schools and community feel</li>
                <li><strong>Aigburth:</strong> Good schools and transport links</li>
                <li><strong>West Derby:</strong> Excellent schools and affordable housing</li>
                <li><strong>Formby:</strong> Strong grammar school provision</li>
                <li><strong>Crosby:</strong> Good value with improving school standards</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Why Choose Liverpool Schools?
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Diverse Options:</strong> Wide range of school types and approaches</li>
                <li><strong>Strong Performance:</strong> Many schools with excellent Ofsted ratings</li>
                <li><strong>Affordable Living:</strong> Good value compared to London and the South</li>
                <li><strong>Transport Links:</strong> Excellent public transport and road connections</li>
                <li><strong>Cultural Diversity:</strong> Schools reflect Liverpool&apos;s multicultural community</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
