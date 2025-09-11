import ClientSchoolsMap from '@/components/ClientSchoolsMap'

export const metadata = {
  title: "Schools in Birmingham - Find the Best Schools in Birmingham | SchoolChecker.io",
  description: "Discover the best schools in Birmingham with detailed Ofsted ratings, performance data, and catchment areas. Free school finder for Birmingham schools. 150+ monthly searches.",
  keywords: "schools in birmingham, birmingham schools, best schools birmingham, primary schools birmingham, secondary schools birmingham, birmingham school finder, schools near me birmingham",
  openGraph: {
    title: "Schools in Birmingham - Find the Best Schools in Birmingham | SchoolChecker.io",
    description: "Discover the best schools in Birmingham with detailed Ofsted ratings, performance data, and catchment areas.",
    type: "website",
  },
}

export default function SchoolsInBirmingham() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section with More Spacing */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Schools in Birmingham
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              Find the best schools in Birmingham with detailed Ofsted ratings, performance data, and catchment areas. 
              Explore schools across Birmingham and the West Midlands region.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <span className="flex items-center bg-green-50 px-4 py-2 rounded-full">
                <span className="text-green-500 mr-2">✓</span>
                West Midlands
              </span>
              <span className="flex items-center bg-green-50 px-4 py-2 rounded-full">
                <span className="text-green-500 mr-2">✓</span>
                Ofsted ratings
              </span>
              <span className="flex items-center bg-green-50 px-4 py-2 rounded-full">
                <span className="text-green-500 mr-2">✓</span>
                Performance data
              </span>
              <span className="flex items-center bg-green-50 px-4 py-2 rounded-full">
                <span className="text-green-500 mr-2">✓</span>
                Catchment areas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section - Contained in Box */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Interactive School Map
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Click on any school marker to view detailed information
              </p>
            </div>
            <div className="h-[600px] md:h-[700px]">
              <ClientSchoolsMap city="birmingham" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional SEO Content */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Best Schools in Birmingham
            </h2>
            <div className="prose text-gray-700">
              <p className="mb-4">
                Birmingham, the UK&apos;s second-largest city, offers a diverse range of educational opportunities. 
                From outstanding primary schools to excellent secondary institutions, Birmingham provides families 
                with access to high-quality education across the city and surrounding areas.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Birmingham School Types
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Primary Schools:</strong> Strong primary education across all areas</li>
                <li><strong>Secondary Schools:</strong> Excellent secondary provision including grammar schools</li>
                <li><strong>Nurseries:</strong> Early years provision throughout the city</li>
                <li><strong>Special Schools:</strong> Specialist support for children with additional needs</li>
                <li><strong>Independent Schools:</strong> Private schools including some of the region&apos;s best</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Popular Birmingham Areas
              </h3>
              <p className="mb-4">
                Birmingham offers diverse neighborhoods, each with their own educational strengths:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Edgbaston:</strong> Home to some of Birmingham&apos;s most prestigious schools</li>
                <li><strong>Moseley:</strong> Popular with families, excellent schools</li>
                <li><strong>Solihull:</strong> Strong grammar school provision</li>
                <li><strong>Sutton Coldfield:</strong> Well-regarded schools and family-friendly</li>
                <li><strong>Harborne:</strong> Good schools and community feel</li>
                <li><strong>Kings Heath:</strong> Vibrant area with improving school standards</li>
                <li><strong>Bournville:</strong> Excellent schools and green spaces</li>
                <li><strong>Hall Green:</strong> Diverse educational options</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                Why Choose Birmingham Schools?
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Diverse Options:</strong> Wide range of school types and approaches</li>
                <li><strong>Strong Performance:</strong> Many schools with excellent Ofsted ratings</li>
                <li><strong>Affordable Living:</strong> Good value compared to London and the South</li>
                <li><strong>Transport Links:</strong> Excellent public transport and road connections</li>
                <li><strong>Cultural Diversity:</strong> Schools reflect Birmingham&apos;s multicultural community</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
