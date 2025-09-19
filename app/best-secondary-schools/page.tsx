import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Best Secondary Schools in England | SchoolChecker.io',
  description: 'Find the best secondary schools in England. Compare GCSE results, A-Level performance, and Ofsted ratings to find the perfect secondary school for your child.',
  keywords: 'best secondary schools England, secondary school rankings, GCSE results, A-Level results, Ofsted ratings, secondary education',
  openGraph: {
    title: 'Best Secondary Schools in England | SchoolChecker.io',
    description: 'Find the best secondary schools in England. Compare GCSE results, A-Level performance, and Ofsted ratings.',
    type: 'website',
    url: 'https://schoolchecker.io/best-secondary-schools',
  },
  alternates: {
    canonical: 'https://schoolchecker.io/best-secondary-schools',
  },
};

export default function BestSecondarySchoolsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          {/* Breadcrumbs */}
          <nav className="text-sm text-gray-500 mb-6 mt-3 md:mt-0">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">Best Secondary Schools</span>
          </nav>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Best Secondary Schools in England
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Comprehensive secondary school rankings, GCSE and A-Level results, and detailed school information to help you find the perfect secondary education for your child.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Coming Soon Message */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-3">
              Secondary Schools Data Coming Soon
            </h2>
            <p className="text-blue-800 mb-6">
              Comprehensive secondary school rankings, GCSE results, A-Level performance data, and detailed school comparisons 
              will be available soon.
            </p>
            <div className="text-sm text-blue-700">
              <p className="mb-2">In the meantime, explore:</p>
              <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                <li>Browse <Link href="/best-primary-schools" className="underline hover:text-blue-900">primary school rankings</Link></li>
                <li>Use the <Link href="/" className="underline hover:text-blue-900">interactive map</Link> to find schools near you</li>
                <li>Search for individual schools to view their details</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
