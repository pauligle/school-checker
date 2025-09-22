'use client'

import dynamic from 'next/dynamic';

const SchoolPageClient = dynamic(() => import('@/components/SchoolPageClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-lg text-gray-600">Loading school information...</p>
        </div>
      </div>
    </div>
  )
});

interface SchoolPageClientWrapperProps {
  school: any;
  gcseData: any;
  gcseMultiYearData: any;
  parentViewData: any;
}

export default function SchoolPageClientWrapper(props: SchoolPageClientWrapperProps) {
  return <SchoolPageClient {...props} />;
}
