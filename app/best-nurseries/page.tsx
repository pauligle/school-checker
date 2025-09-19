import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Best Nurseries in England | SchoolChecker.io',
  description: 'Find the best nurseries in England. Compare Ofsted ratings, early years provision, and detailed nursery information to find the perfect early education for your child.',
  keywords: 'best nurseries England, nursery rankings, early years, Ofsted ratings, nursery schools, pre-school education',
  openGraph: {
    title: 'Best Nurseries in England | SchoolChecker.io',
    description: 'Find the best nurseries in England. Compare Ofsted ratings and early years provision.',
    type: 'website',
    url: 'https://schoolchecker.io/best-nurseries',
  },
  alternates: {
    canonical: 'https://schoolchecker.io/best-nurseries',
  },
};

export default function BestNurseriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-8">
          {/* Breadcrumbs */}
          <nav className="text-sm text-gray-500 mb-6 mt-3 md:mt-0">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">Best Nurseries</span>
          </nav>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Best Nurseries in England
            </h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Comprehensive nursery rankings, Ofsted ratings, and detailed early years provision information to help you find the perfect nursery for your child.
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
              Nurseries Data Coming Soon
            </h2>
            <p className="text-blue-800 mb-6">
              Comprehensive nursery rankings, Ofsted ratings, early years foundation stage data, and detailed nursery comparisons 
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

