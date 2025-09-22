'use client'

import SchoolsMapNew from './SchoolsMapNew'

export default function ClientSchoolsMap({ city = null, center = null, zoom = null, selectedSchool = null }) {
  return <SchoolsMapNew city={city} center={center} zoom={zoom} selectedSchool={selectedSchool} />
}
