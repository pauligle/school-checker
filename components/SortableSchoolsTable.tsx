'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'

// Types
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
  statutorylowage: number | null
  statutoryhighage: number | null
}

type SortField = 'name' | 'rating' | 'ageRange' | 'pupils' | 'postcode' | 'localAuthority'
type SortDirection = 'asc' | 'desc'
type FilterType = 'all' | 'outstanding' | 'good'

// Utility functions
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Function to calculate SchoolChecker.io rating from category judgments
function calculateSchoolCheckerRating(inspection: any) {
  if (!inspection) return null;

  // If we have an official Ofsted overall rating (pre-September 2024), use that
  if (inspection.outcome && inspection.outcome >= 1 && inspection.outcome <= 4) {
    return {
      rating: inspection.outcome,
      isCalculated: false,
      source: 'Official Ofsted Rating'
    };
  }

  // Calculate rating from category judgments (post-September 2024)
  const weights = {
    quality_of_education: 0.40,      // Most important
    effectiveness_of_leadership: 0.30, // Leadership and management
    behaviour_and_attitudes: 0.20,    // Behaviour and attitudes
    personal_development: 0.10        // Personal development
  };

  let weightedScore = 0;
  let totalWeight = 0;
  let categoriesUsed = [];

  Object.keys(weights).forEach(category => {
    const rating = inspection[category];
    if (rating && rating >= 1 && rating <= 4) {
      // Invert rating so 1=Outstanding=4 points, 4=Inadequate=1 point
      weightedScore += (5 - rating) * weights[category];
      totalWeight += weights[category];
      categoriesUsed.push(category);
    }
  });

  if (totalWeight === 0) return null;

  const averageScore = weightedScore / totalWeight;

  // Convert to rating
  let calculatedRating;
  if (averageScore >= 3.5) calculatedRating = 1; // Outstanding
  else if (averageScore >= 2.5) calculatedRating = 2; // Good  
  else if (averageScore >= 1.5) calculatedRating = 3; // Requires improvement
  else calculatedRating = 4; // Inadequate

  return {
    rating: calculatedRating,
    isCalculated: true,
    source: 'Schoolchecker.io Rating',
    categoriesUsed: categoriesUsed.length,
    totalCategories: Object.keys(weights).length
  };
}

// Function to get rating color and text
function getRatingDisplay(inspection: any) {
  const schoolCheckerRating = calculateSchoolCheckerRating(inspection);
  
  if (!schoolCheckerRating) {
    return {
      text: 'Not Rated',
      color: 'bg-gray-100 text-gray-800',
      type: 'none'
    }
  }
  
  const rating = schoolCheckerRating.rating
  const isCalculated = schoolCheckerRating.isCalculated
  
  switch (rating) {
    case 1: // Outstanding
      return {
        text: 'Outstanding',
        color: 'bg-green-100 text-green-800',
        type: isCalculated ? 'SchoolChecker' : 'Ofsted',
        isCalculated
      }
    case 2: // Good
      return {
        text: 'Good',
        color: 'bg-blue-100 text-blue-800',
        type: isCalculated ? 'SchoolChecker' : 'Ofsted',
        isCalculated
      }
    case 3: // Requires improvement
      return {
        text: 'Requires Improvement',
        color: 'bg-yellow-100 text-yellow-800',
        type: isCalculated ? 'SchoolChecker' : 'Ofsted',
        isCalculated
      }
    case 4: // Inadequate
      return {
        text: 'Inadequate',
        color: 'bg-red-100 text-red-800',
        type: isCalculated ? 'SchoolChecker' : 'Ofsted',
        isCalculated
      }
    default:
      return {
        text: 'Not Rated',
        color: 'bg-gray-100 text-gray-800',
        type: 'none'
      }
  }
}

// Sortable header component
function SortableHeader({ 
  field, 
  currentSort, 
  onSort, 
  children,
  widthClass = "w-24"
}: { 
  field: SortField
  currentSort: { field: SortField | null; direction: SortDirection }
  onSort: (field: SortField) => void
  children: React.ReactNode
  widthClass?: string
}) {
  const isActive = currentSort.field === field
  const direction = isActive ? currentSort.direction : null
  
  return (
    <th 
      className={`${widthClass} px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        <div className="flex flex-col">
          <span className={`text-xs ${isActive && direction === 'asc' ? 'text-blue-600' : 'text-gray-300'}`}>
            ▲
          </span>
          <span className={`text-xs ${isActive && direction === 'desc' ? 'text-blue-600' : 'text-gray-300'}`}>
            ▼
          </span>
        </div>
      </div>
    </th>
  )
}

// Main sortable table component
export default function SortableSchoolsTable({ 
  schools, 
  inspections, 
  city,
  initialFilter = 'all'
}: { 
  schools: SchoolData[]
  inspections: { [urn: string]: any }
  city: string
  initialFilter?: FilterType
}) {
  const [sort, setSort] = useState<{ field: SortField | null; direction: SortDirection }>({
    field: null,
    direction: 'asc'
  })
  
  const [filter, setFilter] = useState<FilterType>(initialFilter)

  const handleSort = (field: SortField) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const filteredAndSortedSchools = useMemo(() => {
    // First apply filter
    let filteredSchools = schools
    
    if (filter === 'outstanding') {
      filteredSchools = schools.filter(school => {
        const inspection = inspections[school.urn]
        const rating = calculateSchoolCheckerRating(inspection)
        return rating?.rating === 1 // Outstanding rating
      })
    } else if (filter === 'good') {
      filteredSchools = schools.filter(school => {
        const inspection = inspections[school.urn]
        const rating = calculateSchoolCheckerRating(inspection)
        return rating?.rating === 2 // Good rating
      })
    }
    
    // Then apply sorting
    if (!sort.field) return filteredSchools

    return [...filteredSchools].sort((a, b) => {
      let aValue: any, bValue: any

      switch (sort.field) {
        case 'name':
          aValue = a.establishmentname.toLowerCase()
          bValue = b.establishmentname.toLowerCase()
          break
        case 'rating':
          const aInspection = inspections[a.urn]
          const bInspection = inspections[b.urn]
          const aRating = calculateSchoolCheckerRating(aInspection)
          const bRating = calculateSchoolCheckerRating(bInspection)
          aValue = aRating?.rating || 999 // Put unrated schools at end
          bValue = bRating?.rating || 999
          break
        case 'ageRange':
          aValue = a.statutorylowage || 999
          bValue = b.statutorylowage || 999
          break
        case 'pupils':
          aValue = a.numberofpupils || 0
          bValue = b.numberofpupils || 0
          break
        case 'postcode':
          aValue = a.postcode || 'zzz'
          bValue = b.postcode || 'zzz'
          break
        case 'localAuthority':
          aValue = a.la__name_.toLowerCase()
          bValue = b.la__name_.toLowerCase()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [schools, inspections, sort, filter])

  return (
    <div className="overflow-hidden">
      {/* Filter Buttons */}
      <div className="mb-4 py-2">
        <div className="flex flex-wrap items-center gap-3 pl-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Show All Schools ({schools.length})
          </button>
          <button
            onClick={() => setFilter('outstanding')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filter === 'outstanding'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Show Only Outstanding ({schools.filter(school => {
              const inspection = inspections[school.urn]
              const rating = calculateSchoolCheckerRating(inspection)
              return rating?.rating === 1
            }).length})
          </button>
          <button
            onClick={() => setFilter('good')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filter === 'good'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Show Only Good ({schools.filter(school => {
              const inspection = inspections[school.urn]
              const rating = calculateSchoolCheckerRating(inspection)
              return rating?.rating === 2
            }).length})
          </button>
        </div>
      </div>
      
      <table className="w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <SortableHeader field="name" currentSort={sort} onSort={handleSort} widthClass="w-1/3">
              School Name
            </SortableHeader>
            <SortableHeader field="rating" currentSort={sort} onSort={handleSort} widthClass="w-24">
              Rating
            </SortableHeader>
            <SortableHeader field="ageRange" currentSort={sort} onSort={handleSort} widthClass="w-20">
              Age Range
            </SortableHeader>
            <SortableHeader field="pupils" currentSort={sort} onSort={handleSort} widthClass="w-20">
              Pupils
            </SortableHeader>
            <SortableHeader field="postcode" currentSort={sort} onSort={handleSort} widthClass="w-24">
              Postcode
            </SortableHeader>
            <SortableHeader field="localAuthority" currentSort={sort} onSort={handleSort} widthClass="w-32">
              Local Authority
            </SortableHeader>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredAndSortedSchools.map((school, index) => {
            const inspection = inspections[school.urn]
            const ratingDisplay = getRatingDisplay(inspection)
            return (
              <tr key={school.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 text-sm font-medium text-gray-900 text-center">
                  #{index + 1}
                </td>
                <td className="px-3 py-3">
                  <Link 
                    href={`/school/${createSlug(school.establishmentname)}-${school.urn}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline break-words"
                  >
                    {school.establishmentname}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ratingDisplay.color} w-fit`}>
                      {ratingDisplay.text}
                    </span>
                    {ratingDisplay.isCalculated && (
                      <Link 
                        href="/schoolchecker-rating" 
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        title="Learn about our rating methodology"
                      >
                        (calculated)
                      </Link>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-sm text-gray-900 text-center">
                  {school.statutorylowage && school.statutoryhighage ? 
                    `${school.statutorylowage}-${school.statutoryhighage}` : 
                    'N/A'
                  }
                </td>
                <td className="px-3 py-3 text-sm text-gray-900 text-center">
                  {school.numberofpupils ? school.numberofpupils.toLocaleString() : 'N/A'}
                </td>
                <td className="px-3 py-3 text-sm text-gray-500 font-mono text-center">
                  {school.postcode || 'N/A'}
                </td>
                <td className="px-3 py-3 text-sm text-gray-500">
                  {school.la__name_}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
