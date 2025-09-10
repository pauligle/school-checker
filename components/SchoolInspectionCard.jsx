'use client';

import React from 'react';

const SchoolInspectionCard = ({ inspections }) => {
  // Helper function to get Ofsted provider type code
  const getProviderTypeCode = (schoolType) => {
    // Provider type codes for Ofsted URLs
    // 28 = State-funded schools (most common)
    // 31 = Further education and skills providers
    // Other codes exist for different provider types
    
    if (!schoolType) return '28'; // Default to state-funded schools
    
    const type = schoolType.toLowerCase();
    if (type.includes('academy') || type.includes('maintained') || type.includes('community')) {
      return '28'; // State-funded schools
    }
    // Add more conditions as needed for other school types
    return '28'; // Default fallback
  };

  if (!inspections || inspections.length === 0) {
    return (
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Ofsted Inspections</h3>
          <div className="text-sm text-gray-500">
            No inspection data available for this school.
          </div>
        </div>
      </div>
    );
  }

  const getRatingBadge = (rating) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded";
    switch (rating) {
      case 1: return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case 2: return `${baseClasses} bg-yellow-200 text-yellow-900 border border-yellow-300`;
      case 3: return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      case 4: return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      default: return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
    }
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Outstanding';
      case 2: return 'Good';
      case 3: return 'Requires improvement';
      case 4: return 'Inadequate';
      default: return 'N/A';
    }
  };

  // Calculate School Checker Inspection Rating based on category judgments
  const calculateSchoolCheckerRating = (inspection) => {
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
  };

  const latestInspection = inspections[0];

  // Calculate the School Checker Inspection Rating
  const schoolCheckerRating = calculateSchoolCheckerRating(latestInspection);

  // Check if we have any rating (official or calculated)
  const hasNoRating = !schoolCheckerRating;

  return (
    <div className="space-y-4">
      {/* Latest Inspection */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">Latest Inspection</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1">
            <span className="text-sm font-bold text-gray-600">
              {schoolCheckerRating?.isCalculated ? 'Schoolchecker.io Rating:' : 'Overall Rating:'}
            </span>
            {hasNoRating ? (
              <div className="bg-pink-50 border border-pink-200 rounded px-2 py-1 flex items-center space-x-1">
                <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-gray-700">No Rating Available</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className={getRatingBadge(schoolCheckerRating.rating)}>
                  {getRatingText(schoolCheckerRating.rating)}
                </span>
                {schoolCheckerRating.isCalculated && (
                  <span className="text-xs text-gray-500 italic">
                    (calculated)
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-sm font-bold text-gray-600">Inspection Date:</span>
            <span className="text-sm text-gray-800">{latestInspection.inspection_date || 'N/A'}</span>
          </div>
          {latestInspection.ofsted_report_url && (
            <div className="flex justify-between items-center py-1">
              <span className="text-sm font-bold text-gray-600">Ofsted Report:</span>
              <a 
                href={latestInspection.ofsted_report_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                View report
              </a>
            </div>
          )}
          {/* View All Ofsted Inspections Link */}
          {/* Note: Provider type "28" is for state-funded schools. Other types may use different codes */}
          {/* TODO: Could be enhanced to use school type from selectedSchool prop to determine correct provider code */}
          <div className="flex justify-between items-center py-1">
            <span className="text-sm font-bold text-gray-600">All Inspections:</span>
            <a 
              href={`https://reports.ofsted.gov.uk/provider/28/${latestInspection.urn}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              View on Ofsted Website
            </a>
          </div>
          {latestInspection.category_of_concern && (
            <div className="flex justify-between items-center py-1">
              <span className="text-sm font-bold text-gray-600">Category of Concern:</span>
              <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800 border border-red-200">
                {latestInspection.category_of_concern}
              </span>
            </div>
          )}
          
          {/* Rating Explanation */}
          {schoolCheckerRating && schoolCheckerRating.isCalculated && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 space-y-1">
                <div>
                  <span className="font-medium">About this rating:</span> Ofsted stopped providing overall effectiveness ratings in September 2024. Schools now only receive individual category assessments.
                </div>
                <div>
                  Our 'Schoolchecker.io Rating' combines these category judgements using Ofsted's historical weighting system to provide a comparable overall score.
                </div>
                <div>
                  This helps parents quickly compare schools using the same inspection data that Ofsted provides.
                </div>
                <div className="font-medium text-gray-600">
                  Please note: This is our calculated rating, not an official Ofsted judgement. We'll update our approach when Ofsted's new 'Report Card' system is introduced.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Judgements */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">Category Judgements</h3>
        <div className="overflow-hidden border border-gray-200 rounded">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="text-left py-3 px-3 font-semibold text-gray-800">Inspection Area</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-800">Judgement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3 px-3 font-semibold text-gray-800">The quality of education</td>
                <td className="py-3 px-3 text-right">
                  <span className={getRatingBadge(latestInspection.quality_of_education)}>
                    {getRatingText(latestInspection.quality_of_education)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-gray-800">Behaviour and attitudes</td>
                <td className="py-3 px-3 text-right">
                  <span className={getRatingBadge(latestInspection.behaviour_and_attitudes)}>
                    {getRatingText(latestInspection.behaviour_and_attitudes)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-gray-800">Personal development</td>
                <td className="py-3 px-3 text-right">
                  <span className={getRatingBadge(latestInspection.personal_development)}>
                    {getRatingText(latestInspection.personal_development)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-semibold text-gray-800">Leadership and management</td>
                <td className="py-3 px-3 text-right">
                  <span className={getRatingBadge(latestInspection.effectiveness_of_leadership)}>
                    {getRatingText(latestInspection.effectiveness_of_leadership)}
                  </span>
                </td>
              </tr>
              {latestInspection.sixth_form_provision && (
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-800">Sixth form provision</td>
                  <td className="py-3 px-3 text-right">
                    <span className={getRatingBadge(latestInspection.sixth_form_provision)}>
                      {getRatingText(latestInspection.sixth_form_provision)}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection History */}
      {inspections.length > 1 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">Inspection History</h3>
          <div className="overflow-hidden">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-700">Date</th>
                <th className="text-center py-2 font-medium text-gray-700">Rating</th>
                <th className="text-right py-2 font-medium text-gray-700">Ofsted Report</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-gray-100">
                {inspections.slice(1, 4).map((inspection, index) => (
                  <tr key={index}>
                    <td className="py-2 text-gray-700">{inspection.inspection_date || 'N/A'}</td>
                    <td className="py-2 text-center">
                      <span className={getRatingBadge(inspection.outcome)}>
                        {getRatingText(inspection.outcome)}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      {inspection.ofsted_report_url ? (
                        <a 
                          href={inspection.ofsted_report_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolInspectionCard;
