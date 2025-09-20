import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found | SchoolChecker.io',
  description: 'The page you are looking for could not be found. Explore our school data and rankings to find what you need.',
  robots: 'noindex, follow',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-4">404</h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Page Not Found
            </h2>
            <p className="text-xl text-gray-300">
              The page you are looking for could not be found.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700 mb-6">
                Don't worry! Here are some helpful links to get you back on track:
              </p>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Main Navigation */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  Main Pages
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link 
                      href="/" 
                      className="text-blue-700 hover:text-blue-900 hover:underline flex items-center"
                    >
                      <span className="mr-2">🏠</span>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/schools-near-me" 
                      className="text-blue-700 hover:text-blue-900 hover:underline flex items-center"
                    >
                      <span className="mr-2">📍</span>
                      Schools Near Me
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/best-primary-schools" 
                      className="text-blue-700 hover:text-blue-900 hover:underline flex items-center"
                    >
                      <span className="mr-2">🏫</span>
                      Primary Schools
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/schoolchecker-rating" 
                      className="text-blue-700 hover:text-blue-900 hover:underline flex items-center"
                    >
                      <span className="mr-2">⭐</span>
                      School Ratings
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Popular Locations */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">
                  Popular Locations
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link 
                      href="/best-primary-schools/london" 
                      className="text-green-700 hover:text-green-900 hover:underline flex items-center"
                    >
                      <span className="mr-2">🏙️</span>
                      London
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/best-primary-schools/leeds" 
                      className="text-green-700 hover:text-green-900 hover:underline flex items-center"
                    >
                      <span className="mr-2">🏢</span>
                      Leeds
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/best-primary-schools/birmingham" 
                      className="text-green-700 hover:text-green-900 hover:underline flex items-center"
                    >
                      <span className="mr-2">🏗️</span>
                      Birmingham
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/best-primary-schools/manchester" 
                      className="text-green-700 hover:text-green-900 hover:underline flex items-center"
                    >
                      <span className="mr-2">🏭</span>
                      Manchester
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Search Help */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                🔍 Looking for a specific school?
              </h3>
              <p className="text-yellow-800 mb-4">
                Try searching for schools using the "Schools Near Me" feature or browse by location using the links above.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  Search by postcode
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  Browse by city
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  Filter by Ofsted rating
                </span>
              </div>
            </div>

            {/* Additional Help */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-semibold text-gray-900 mb-2">Data Sources</h4>
                <p className="text-sm text-gray-600">
                  All data comes from official UK Government sources
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🆓</div>
                <h4 className="font-semibold text-gray-900 mb-2">Free Service</h4>
                <p className="text-sm text-gray-600">
                  Completely free access to school information
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">📱</div>
                <h4 className="font-semibold text-gray-900 mb-2">Mobile Friendly</h4>
                <p className="text-sm text-gray-600">
                  Optimized for all devices
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Still can't find what you're looking for?
              </p>
              <Link 
                href="/contact" 
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="mr-2">📧</span>
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
