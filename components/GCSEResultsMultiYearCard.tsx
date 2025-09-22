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
          className="fixed w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg"
          style={{
            zIndex: 99999,
            top: buttonRef.getBoundingClientRect().top - 20,
            left: buttonRef.getBoundingClientRect().left + 20,
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
        </div>
      )}
    </>
  );
};

interface GCSEResultsMultiYearCardProps {
  urn: number;
  preloadedData?: {
    years: Array<{
      year: number;
      hasData: boolean;
      covidNote?: string;
    }>;
    defaultYear: number;
  };
}

interface YearData {
  school: any;
  rankings: any;
  laAverages: any;
  englandAverages: any;
  academicYear: number;
}

const GCSEResultsMultiYearCard: React.FC<GCSEResultsMultiYearCardProps> = ({ 
  urn, 
  preloadedData 
}) => {
  const [availableYears, setAvailableYears] = useState<Array<{
    year: number;
    hasData: boolean;
    covidNote?: string;
  }>>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [yearData, setYearData] = useState<YearData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available years and data immediately
  useEffect(() => {
    if (preloadedData) {
      setAvailableYears(preloadedData.years);
      setSelectedYear(preloadedData.defaultYear);
      // Load data immediately if we have preloaded data
      if (preloadedData.defaultYear && urn) {
        fetchYearData(preloadedData.defaultYear);
      }
    } else {
      fetchAvailableYears();
    }
  }, [preloadedData, urn]);

  // Load data immediately when component mounts
  useEffect(() => {
    if (urn && !preloadedData) {
      // Load data immediately for the default year (2024)
      fetchYearData(2024);
    }
  }, [urn]);

  // Load data for selected year
  useEffect(() => {
    if (selectedYear && urn) {
      fetchYearData(selectedYear);
    }
  }, [selectedYear, urn]);

  const fetchAvailableYears = async () => {
    try {
      const response = await fetch(`/api/gcse-years?urn=${urn}`);
      const data = await response.json();
      
      if (data.years) {
        setAvailableYears(data.years);
        setSelectedYear(data.defaultYear);
        // Load data immediately after fetching years
        if (data.defaultYear && urn) {
          fetchYearData(data.defaultYear);
        }
      }
    } catch (err) {
      console.error('Error fetching available years:', err);
    }
  };

  const fetchYearData = async (year: number) => {
    setLoading(true);
    setError(null);

    try {
      // First try the multi-year API
      let response = await fetch(`/api/gcse-results-multi-year?urn=${urn}&year=${year}`);
      let data = await response.json();

      // If multi-year API fails, fall back to regular GCSE results API
      if (data.error || response.status === 404) {
        console.log('Multi-year API failed, falling back to regular GCSE API');
        response = await fetch(`/api/gcse-results?urn=${urn}`);
        data = await response.json();
        
        if (data.error) {
          setError(data.error);
          setYearData(null);
          return;
        }
      }

      setYearData(data);
    } catch (err) {
      setError('Failed to load GCSE results');
      setYearData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number | null, isPercentage: boolean = false, decimals: number = 1): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    
    if (isPercentage) {
      return `${value.toFixed(decimals)}%`;
    }
    return value.toFixed(decimals);
  };

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

  if (loading && !yearData) {
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

  if (!yearData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <p>No GCSE results available for this school.</p>
        </div>
      </div>
    );
  }

  const { school, rankings, laAverages, englandAverages, academicYear } = yearData;
  const safeLaAverages = laAverages || {};
  const safeEnglandAverages = englandAverages || {};

  return (
    <div>
      {/* Year Selector Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {availableYears.map((yearInfo) => (
              <button
                key={yearInfo.year}
                onClick={() => setSelectedYear(yearInfo.year)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedYear === yearInfo.year
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {yearInfo.year}
                {yearInfo.covidNote && (
                  <span className="ml-1 text-xs text-orange-600" title={yearInfo.covidNote}>
                    ⚠️
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        
        {/* COVID Note */}
        {availableYears.find(y => y.year === selectedYear)?.covidNote && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                  COVID-19 Impact Notice
                </h3>
                <div className="mt-2 text-sm text-orange-700">
                  <p>{availableYears.find(y => y.year === selectedYear)?.covidNote}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GCSE Results Content */}
      <div className="mb-4">
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
                <td className="px-4 py-3 text-sm text-gray-900">{formatValue(safeLaAverages.attainment8_la_avg)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatValue(safeEnglandAverages.attainment8_england_avg)}</td>
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
                <td className="px-4 py-3 text-sm text-gray-900">{formatValue(safeLaAverages.grade5_eng_maths_la_avg, true)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatValue(safeEnglandAverages.grade5_eng_maths_england_avg, true)}</td>
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
                <td className="px-4 py-3 text-sm text-gray-900">{formatValue(safeLaAverages.five_gcses_grade4_la_avg, true)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatValue(safeEnglandAverages.five_gcses_grade4_england_avg, true)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  Entering EBacc
                  <InfoTooltip 
                    content="Percentage of students entering the English Baccalaureate (EBacc) qualification."
                    linkText="Learn more about GCSE results"
                    linkUrl="/understanding-gcse-ks4-results#entering-ebacc"
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatValue(school.entering_ebacc_percent, true)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatValue(safeLaAverages.entering_ebacc_la_avg, true)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatValue(safeEnglandAverages.entering_ebacc_england_avg, true)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  EBacc average point score
                  <InfoTooltip 
                    content="Average point score achieved by students in EBacc subjects."
                    linkText="Learn more about GCSE results"
                    linkUrl="/understanding-gcse-ks4-results#ebacc-average-point-score"
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatValue(school.ebacc_avg_point_score)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatValue(safeLaAverages.ebacc_avg_point_score_la_avg)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatValue(safeEnglandAverages.ebacc_avg_point_score_england_avg)}</td>
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
                      <div className="bg-orange-300 text-white text-xs px-2 py-1 rounded">17%</div>
                      <div className="bg-red-400 text-white text-xs px-2 py-1 rounded">16%</div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GCSEResultsMultiYearCard;
