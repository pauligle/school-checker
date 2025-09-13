"use client"

import dynamic from 'next/dynamic'

const SchoolsMapNew = dynamic(() => import('@/components/SchoolsMapNew'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
})

interface SchoolData {
  id: string
  establishmentname: string
  urn: string
  la__name_: string
  typeofestablishment__name_: string
  numberofpupils: number
  postcode: string | null
  lat: number | null
  lon: number | null
}

interface LeedsSchoolsMapProps {
  schools: SchoolData[]
}

export default function LeedsSchoolsMap({ schools }: LeedsSchoolsMapProps) {
  return (
    <div className="h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-lg">
      <SchoolsMapNew
        center={[53.8008, -1.5491]} // Leeds city center coordinates
        zoom={10}
        schools={schools}
        city="leeds" // This tells SchoolsMapNew to use pre-loaded schools instead of viewport fetching
      />
    </div>
  )
}
