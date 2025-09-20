import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help | SchoolChecker.io',
  description: 'Help and support for SchoolChecker.io - Get assistance with using the platform and finding school information.',
  robots: 'index, follow',
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Help & Support
            </h1>
            <p className="text-xl text-gray-300">
              Get assistance with using SchoolChecker.io
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
                <div className="flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-blue-900 mb-4">
                  Help Center Coming Soon
                </h2>
                <p className="text-blue-800 text-lg mb-6">
                  A comprehensive help center is being developed to assist with using SchoolChecker.io.
                </p>
                <p className="text-blue-700">
                  In the meantime, feel free to contact for any questions or support needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
