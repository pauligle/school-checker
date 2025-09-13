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
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function SchoolsNearMe() {
  return (
    <div className="bg-gray-50">
      {/* SEO Content Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Schools Near Me
          </h1>
          <p className="text-sm text-gray-700 mb-3">
            Find the best schools in your area with detailed Ofsted ratings, performance data, and catchment areas.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
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
            <span className="flex items-center">
              <span className="text-green-500 mr-1">✓</span>
              Pupil demographics
            </span>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="h-screen">
        <ClientSchoolsMap />
      </div>
    </div>
  )
}
