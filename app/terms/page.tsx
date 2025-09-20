import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | SchoolChecker.io',
  description: 'Terms of service for SchoolChecker.io - Learn about the terms and conditions for using the free school data platform.',
  robots: 'index, follow',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-300">
              Terms and conditions for using the SchoolChecker.io platform.
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

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-700 mb-6">
                By accessing and using SchoolChecker.io, users agree to be bound by these terms of service. 
                If any part of these terms is not acceptable, the service should not be used.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description of Service</h2>
              <p className="text-gray-700 mb-6">
                SchoolChecker.io provides free access to UK school data and statistics derived from official 
                government sources. The service is designed to make educational data more accessible and 
                understandable for parents, educators, and researchers.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use of Service</h2>
              <p className="text-gray-700 mb-6">
                The service is provided for informational purposes only. Users may:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Access and view school data and statistics</li>
                <li>Use the information for personal research and decision-making</li>
                <li>Share links to the service with others</li>
                <li>Reference the service in educational or research contexts</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Prohibited Uses</h2>
              <p className="text-gray-700 mb-6">
                Users may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                <li>Use the service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to the service or its systems</li>
                <li>Use automated tools to scrape or extract large amounts of data</li>
                <li>Reproduce or redistribute the service content without permission</li>
                <li>Use the service in a way that could damage or impair its functionality</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Accuracy</h2>
              <p className="text-gray-700 mb-6">
                While every effort is made to ensure data accuracy, SchoolChecker.io cannot guarantee the 
                completeness or accuracy of all information displayed. Data is sourced from official UK 
                Government sources and is presented as received. Users should verify important information 
                directly with official sources.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
              <p className="text-gray-700 mb-6">
                The SchoolChecker.io platform, including its design, functionality, and presentation, 
                is protected by intellectual property rights. The underlying data is sourced from official 
                government sources and remains in the public domain.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 mb-6">
                SchoolChecker.io is provided "as is" without any warranties. The service shall not be liable 
                for any direct, indirect, incidental, or consequential damages arising from the use of the 
                service or the information provided.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Availability</h2>
              <p className="text-gray-700 mb-6">
                While efforts are made to maintain service availability, there is no guarantee of uninterrupted 
                access. The service may be temporarily unavailable for maintenance, updates, or technical issues.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700 mb-6">
                These terms may be updated from time to time. Users will be notified of significant changes 
                through the service. Continued use of the service after changes constitutes acceptance of the 
                updated terms.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
              <p className="text-gray-700 mb-6">
                Access to the service may be terminated at any time, with or without notice, for violation 
                of these terms or for any other reason at the discretion of the service provider.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
              <p className="text-gray-700 mb-6">
                These terms are governed by the laws of England and Wales. Any disputes arising from the 
                use of the service shall be subject to the jurisdiction of the courts of England and Wales.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
              <p className="text-gray-700 mb-6">
                For questions about these terms of service, please contact through the website. 
                There is a commitment to addressing any concerns about the service or these terms.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Free Service</h3>
                <p className="text-blue-800">
                  SchoolChecker.io is provided completely free of charge. There is a commitment to maintaining 
                  this free service to ensure educational data remains accessible to everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
