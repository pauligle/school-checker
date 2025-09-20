import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | SchoolChecker.io',
  description: 'Privacy policy for SchoolChecker.io - Learn how data is handled and privacy is protected while providing free access to UK school statistics.',
  robots: 'index, follow',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-300">
              Privacy is important. Learn how information is protected.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                <strong>Last updated:</strong> {new Date().toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Privacy Commitment</h2>
              <p className="text-gray-700 mb-6">
                At SchoolChecker.io, there is a commitment to protecting privacy and ensuring transparency 
                about how information is handled. This privacy policy explains practices regarding data 
                collection and usage.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Collection</h2>
              <p className="text-gray-700 mb-6">
                <strong>No personal data is collected from website visitors.</strong> SchoolChecker.io 
                is designed to provide free access to UK Government Department for Education (DfE) statistics 
                and school data without requiring any personal information from users.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Google Analytics</h2>
              <p className="text-gray-700 mb-6">
                Google Analytics is used to collect anonymous traffic data to help understand how visitors 
                use the website and make improvements to provide a better user experience. This data is:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Completely anonymous and cannot identify individual users</li>
                <li>Used solely to analyze website traffic patterns and user behavior</li>
                <li>Collected in accordance with Google Analytics' privacy policies</li>
                <li>Used to improve website functionality and content relevance</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Purpose of Service</h2>
              <p className="text-gray-700 mb-6">
                SchoolChecker.io is offered completely free to everyone who wants to take a more visual 
                and accessible look into UK Government DfE statistics and school data. The mission is to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Make UK school data more accessible and understandable</li>
                <li>Provide visual representations of educational statistics</li>
                <li>Help parents, educators, and researchers access school information</li>
                <li>Offer insights into school performance and Ofsted ratings</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Sources</h2>
              <p className="text-gray-700 mb-6">
                All school data displayed on the website comes from official UK Government sources, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>
                  <a 
                    href="https://www.gov.uk/government/organisations/department-for-education" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Department for Education (DfE) statistics
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.gov.uk/government/organisations/ofsted" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Ofsted inspection reports and ratings
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.gov.uk/school-performance-tables" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Government school performance data
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.gov.uk/government/statistical-data-sets" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Publicly available educational datasets
                  </a>
                </li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies</h2>
              <p className="text-gray-700 mb-6">
                Cookies are used only for Google Analytics to track anonymous website usage. These cookies 
                do not contain personal information and are used solely for analytical purposes to improve 
                the website's performance and user experience.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
              <p className="text-gray-700 mb-6">
                The website may contain links to external websites and services. There is no responsibility 
                for the privacy practices of these third-party sites. Users are encouraged to review the 
                privacy policies of any external websites they visit.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
              <p className="text-gray-700 mb-6">
                If there are any questions about this privacy policy or data practices, please contact 
                through the website. There is a commitment to addressing any concerns about privacy 
                and data protection.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700 mb-6">
                This privacy policy may be updated from time to time to reflect changes in practices 
                or for other operational, legal, or regulatory reasons. Any changes will be posted on this 
                page with an updated revision date.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Free Service Commitment</h3>
                <p className="text-blue-800">
                  SchoolChecker.io remains completely free for all users. There is a belief that access to 
                  educational data should be available to everyone, and there is a commitment to maintaining 
                  this free service to help parents, educators, and researchers make informed decisions 
                  about education.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
