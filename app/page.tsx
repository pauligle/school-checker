"use client";

import dynamic from 'next/dynamic';

// Dynamically import the SchoolsMap component to ensure it's
// rendered on the client side, as it relies on the browser's
// environment (Leaflet requires window object).
const SchoolsMap = dynamic(() => import('../components/SchoolsMapNew'), {
  ssr: false, // This line ensures the component is not rendered on the server
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading map...</div>,
});

export default function Home() {
  return (
    <main className="w-full h-screen pt-14 md:pt-16">
      <SchoolsMap />
    </main>
  );
}
