"use client";

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Dynamically import the SchoolsMap component to ensure it's
// rendered on the client side, as it relies on the browser's
// environment (Leaflet requires window object).
const SchoolsMap = dynamic(() => import('../components/SchoolsMapNew'), {
  ssr: false, // This line ensures the component is not rendered on the server
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading map...</div>,
});

export default function Home() {
  const searchParams = useSearchParams();
  const schoolParam = searchParams.get('school');

  return (
    <main className="w-full h-screen pt-14 md:pt-16">
      <SchoolsMap selectedSchool={schoolParam} />
      
      {/* SEO-friendly school links for Google discovery */}
      <div className="hidden">
        <h2>Popular Schools</h2>
        <ul>
          <li><Link href="/school/harris-academy-chobham-139703">Harris Academy Chobham</Link></li>
          <li><Link href="/school/st-marys-primary-school-123456">St Mary's Primary School</Link></li>
          <li><Link href="/school/westminster-school-789012">Westminster School</Link></li>
          <li><Link href="/school/eton-college-345678">Eton College</Link></li>
          <li><Link href="/school/harrow-school-901234">Harrow School</Link></li>
        </ul>
      </div>
    </main>
  );
}
