"use client";

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

// Dynamically import the SchoolsMap component to ensure it's
// rendered on the client side, as it relies on the browser's
// environment (Leaflet requires window object).
const SchoolsMap = dynamic(() => import('./SchoolsMapNew'), {
  ssr: false, // This line ensures the component is not rendered on the server
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading map...</div>,
});

function HomeContentInner() {
  const searchParams = useSearchParams();
  const schoolParam = searchParams.get('school');

  return (
    <main className="fixed inset-0 w-full h-full">
        <SchoolsMap selectedSchool={schoolParam as any} />
      
      {/* SEO-friendly school links for Google discovery - Only real schools */}
      <div className="hidden">
        <h2>Popular Schools</h2>
        <ul>
          <li><Link href="/school/harris-academy-chobham-139703">Harris Academy Chobham</Link></li>
        </ul>
      </div>
    </main>
  );
}

export default function HomeContent() {
  return (
    <Suspense fallback={<div className="fixed inset-0 w-full h-full flex items-center justify-center">Loading...</div>}>
      <HomeContentInner />
    </Suspense>
  );
}
