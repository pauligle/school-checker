'use client'

import dynamic from 'next/dynamic'

// Dynamically import the map component to avoid SSR issues
const SchoolsMapNew = dynamic(() => import('@/components/SchoolsMapNew'), {
  ssr: false,
  loading: () => <div className="h-screen flex items-center justify-center bg-gray-100">Loading map...</div>
})

export default function ClientSchoolsMap() {
  return <SchoolsMapNew />
}
