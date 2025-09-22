'use client';

import React, { useState, useEffect } from 'react';

// Tooltip component for info icons
const InfoTooltip: React.FC<{ 
  content: string; 
  linkText?: string; 
  linkUrl?: string; 
}> = ({ content, linkText, linkUrl }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
  const [tooltipRef, setTooltipRef] = useState<HTMLDivElement | null>(null);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  return (
    <>
      <button
        ref={setButtonRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="text-gray-400 hover:text-blue-500 transition-colors ml-2"
        aria-label="More information"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isVisible && buttonRef && (
        <div 
          ref={setTooltipRef}
          className="fixed w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg"
          style={{
            zIndex: 99999,
            top: buttonRef.getBoundingClientRect().top - 20, // Position at same level as button
            left: buttonRef.getBoundingClientRect().left + 20, // Position closer to the right of the button
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="text-center">
            <p className="mb-2">{content}</p>
            {linkText && linkUrl && (
              <a 
                href={linkUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-100 underline"
              >
                {linkText}
              </a>
            )}
          </div>
          {/* Arrow pointing left to the button */}
          <div 
            className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"
          ></div>
        </div>
      )}
    </>
  );
};

interface GCSEResultsData {
  school: {
    urn: string;
    school_name: string;
    attainment8_score: number | null;
    progress8_score: number | null;
    grade5_eng_maths_percent: number | null;
    grade4_eng_maths_percent: number | null;
    five_gcses_grade4_percent: number | null;
    five_gcses_grade5_percent: number | null;
    entering_ebacc_percent: number | null;
    ebacc_average_point_score: number | null;
    ebacc_grade4_percent: number | null;
    ebacc_grade5_percent: number | null;
    progress8_lower_bound: number | null;
    progress8_upper_bound: number | null;
    progress8_banding: string | null;
  };
  rankings: {
    attainment8_rank: number | null;
    attainment8_total_schools: number | null;
    attainment8_percentile: number | null;
    progress8_rank: number | null;
    progress8_total_schools: number | null;
    progress8_percentile: number | null;
    grade5_eng_maths_rank: number | null;
    grade5_eng_maths_total_schools: number | null;
    grade5_eng_maths_percentile: number | null;
    ebacc_rank: number | null;
    ebacc_total_schools: number | null;
    ebacc_percentile: number | null;
  };
  averages: {
    england: {
      attainment8_avg: number | null;
      progress8_avg: number | null;
      grade5_eng_maths_avg: number | null;
      grade4_eng_maths_avg: number | null;
      five_gcses_grade4_avg: number | null;
      five_gcses_grade5_avg: number | null;
      entering_ebacc_avg: number | null;
      ebacc_avg_point_score: number | null;
    };
    la: {
      attainment8_avg: number | null;
      progress8_avg: number | null;
      grade5_eng_maths_avg: number | null;
      grade4_eng_maths_avg: number | null;
      five_gcses_grade4_avg: number | null;
      five_gcses_grade5_avg: number | null;
      entering_ebacc_avg: number | null;
      ebacc_avg_point_score: number | null;
    } | null;
  };
}

interface GCSEResultsCardProps {
  urn: string;
  academicYear?: string;
  preloadedData?: GCSEResultsData | null;
}

export default function GCSEResultsCard({ urn, academicYear = '2023-24', preloadedData }: GCSEResultsCardProps) {
  const [data, setData] = useState<GCSEResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If preloaded data is available, use it immediately
    if (preloadedData) {
      setData(preloadedData);
      setLoading(false);
      setError(null);
      return;
    }

    // Otherwise, fetch data client-side (fallback)
    async function fetchGCSEData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch GCSE results (this already includes averages data)
        const resultsResponse = await fetch(`/api/gcse-results?urn=${urn}&academic_year=${academicYear}`);
        if (!resultsResponse.ok) {
          throw new Error('Failed to fetch GCSE results');
        }
        const resultsData = await resultsResponse.json();

        console.log('GCSE API Response:', resultsData);
        
        setData({
          school: resultsData.school,
          rankings: resultsData.rankings,
          averages: {
            england: resultsData.englandAverages,
            la: resultsData.laAverages
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (urn) {
      fetchGCSEData();
    }
  }, [urn, academicYear, preloadedData]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-red-600">
          <p>Error loading GCSE results: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <p>No GCSE results available for this school.</p>
        </div>
      </div>
    );
  }

  const { school, rankings, averages } = data;

  // Helper function to format values
  const formatValue = (value: number | null, isPercentage: boolean = false, decimals: number = 1) => {
    if (value === null || value === undefined) return 'N/A';
    if (isPercentage) {
      return `${value.toFixed(decimals)}%`;
    }
    return value.toFixed(decimals);
  };

  // Safe access to averages data
  const safeAverages = averages || { england: {}, la: null };
  const englandAverages = safeAverages.england || {};
  const laAverages = safeAverages.la || {};

  // Helper function to get Progress 8 banding description
  const getProgress8Description = (banding: string | null) => {
    switch (banding?.toLowerCase()) {
      case 'well above average':
        return 'Well above average (about 16% of schools)';
      case 'above average':
        return 'Above average (about 18% of schools)';
      case 'average':
        return 'Average (about 33% of schools)';
      case 'below average':
        return 'Below average (about 17% of schools)';
      case 'well below average':
        return 'Well below average (about 16% of schools)';
      default:
        return 'Average (about 33% of schools)';
    }
  };

  // Helper function to get Progress 8 banding color
  const getProgress8BandingColor = (banding: string | null) => {
    switch (banding?.toLowerCase()) {
      case 'well above average':
        return 'bg-green-500';
      case 'above average':
        return 'bg-green-300';
      case 'average':
        return 'bg-yellow-400 border-2 border-yellow-600';
      case 'below average':
        return 'bg-orange-300';
      case 'well below average':
        return 'bg-red-400';
      default:
        return 'bg-yellow-400 border-2 border-yellow-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">GCSE Results ({academicYear})</h3>
          <a 
            href="/understanding-gcse-ks4-results" 
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            📖 Understanding GCSE Results
          </a>
        </div>
      </div>
      
      <div className="p-6">
        {/* School Performance Metrics Table */}
        <div className="mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LA</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">England</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Attainment 8 score
                    <InfoTooltip 
                      content="Measures performance across 8 key subjects including English, maths, sciences, humanities, and languages."
                      linkText="Learn more about GCSE results"
                      linkUrl="/understanding-gcse-ks4-results#attainment-8"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatValue(school.attainment8_score)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatValue(laAverages.attainment8_avg)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatValue(englandAverages.attainment8_avg)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Grade 5 or above in English and maths
                    <InfoTooltip 
                      content="Percentage of students achieving at least Grade 5 (strong pass) in both English and maths GCSEs."
                      linkText="Learn more about GCSE results"
                      linkUrl="/understanding-gcse-ks4-results#grade-5-english-maths"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatValue(school.grade5_eng_maths_percent, true)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatValue(laAverages.grade5_eng_maths_avg, true)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatValue(englandAverages.grade5_eng_maths_avg, true)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    5 or more GCSEs at grade 9-4 (or A-C)
                    <InfoTooltip 
                      content="Percentage of students achieving at least 5 GCSEs at Grade 4 or above (standard pass) in any subjects."
                      linkText="Learn more about GCSE results"
                      linkUrl="/understanding-gcse-ks4-results#five-gcses-grade-4"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatValue(school.five_gcses_grade4_percent, true)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatValue(laAverages.five_gcses_grade4_avg, true) || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatValue(englandAverages.five_gcses_grade4_avg, true) || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Entering EBacc
                    <InfoTooltip 
                      content="Percentage of students studying the full English Baccalaureate (English, maths, sciences, humanities, and a language)."
                      linkText="Learn more about GCSE results"
                      linkUrl="/understanding-gcse-ks4-results#entering-ebacc"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatValue(school.entering_ebacc_percent, true)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatValue(laAverages.entering_ebacc_avg, true)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatValue(englandAverages.entering_ebacc_avg, true)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    EBacc average point score
                    <InfoTooltip 
                      content="Average points score across all EBacc subjects (English, maths, sciences, humanities, and languages)."
                      linkText="Learn more about GCSE results"
                      linkUrl="/understanding-gcse-ks4-results#ebacc-average-point-score"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatValue(school.ebacc_average_point_score, false, 2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatValue(laAverages.ebacc_avg_point_score, false, 2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatValue(englandAverages.ebacc_avg_point_score, false, 2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Progress 8 Data Table */}
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress Score²</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Progress 8
                    <InfoTooltip 
                      content="Measures how much progress students make from primary school to GCSEs compared to similar students nationally."
                      linkText="Learn more about GCSE results"
                      linkUrl="/understanding-gcse-ks4-results#progress-8"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 flex items-center">{formatValue(school.progress8_score, false, 2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="bg-yellow-100 px-3 py-2 rounded-md">
                      <span className="font-medium">{getProgress8Description(school.progress8_banding)}</span>
                      <div className="mt-2 flex space-x-1">
                        <div className="bg-red-400 text-white text-xs px-2 py-1 rounded">16%</div>
                        <div className="bg-orange-300 text-white text-xs px-2 py-1 rounded">18%</div>
                        <div className={`text-xs px-2 py-1 rounded ${getProgress8BandingColor(school.progress8_banding)}`}>
                          33%
                        </div>
                        <div className="bg-green-300 text-white text-xs px-2 py-1 rounded">17%</div>
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">16%</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}