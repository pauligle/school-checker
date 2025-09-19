'use client';

import { useState, useEffect } from 'react';

interface AdmissionsData {
  school_name: string;
  school_urn: string;
  la_name: string;
  school_phase: string;
  time_period: string;
  
  // Oversubscription status
  is_oversubscribed: boolean;
  oversubscription_rate: number;
  
  // Application data
  total_applications: number;
  first_preference_applications: number;
  second_preference_applications: number;
  third_preference_applications: number;
  applications_from_another_la: number;
  
  // Offer data
  total_offers: number;
  first_preference_offers: number;
  second_preference_offers: number;
  third_preference_offers: number;
  total_preferred_offers: number;
  offers_to_another_la: number;
  
  // Calculated metrics
  success_rate: number;
  competition_ratio: number;
  
  // School details
  establishment_type: string;
  denomination: string;
  admissions_policy: string;
  fsm_eligible_percent: number;
  urban_rural: string;
  allthrough_school: string;
  
  // Proportions
  proportion_1stprefs_v_1stprefoffers: number;
  proportion_1stprefs_v_totaloffers: number;
}

interface AdmissionsCardProps {
  urn: string;
  schoolName?: string;
  phase?: string;
  year?: string;
  preloadedData?: { [year: string]: any } | null;
}

export default function AdmissionsCard({ urn, schoolName, phase = 'Primary', year = '202526', preloadedData }: AdmissionsCardProps) {
  // Helper function to check if we have preloaded data for the default year
  const getTimePeriod = (year: string) => {
    const yearMap: { [key: string]: string } = {
      '2025': '202526',
      '2024': '202425', 
      '2023': '202324',
      '2022': '202223'
    };
    return yearMap[year] || '202526';
  };

  const hasPreloadedDataForDefaultYear = preloadedData && preloadedData[getTimePeriod('2025')];

  const [admissionsData, setAdmissionsData] = useState<AdmissionsData | null>(
    hasPreloadedDataForDefaultYear ? preloadedData[getTimePeriod('2025')] : null
  );
  const [loading, setLoading] = useState(!hasPreloadedDataForDefaultYear);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState('2025');

  useEffect(() => {
    // If we already have data from initialization, don't fetch
    if (admissionsData) {
      return;
    }

    // If we have preloaded data for other years, check if we can use it
    if (preloadedData) {
      const timePeriod = getTimePeriod(selectedYear);
      const data = preloadedData[timePeriod];
      if (data) {
        setAdmissionsData(data);
        setLoading(false);
        setError(null);
        return;
      }
    }

    // Fallback to API fetch if no preloaded data
    async function fetchAdmissionsData() {
      try {
        setLoading(true);
        setError(null);
        
        // Use school name if available, otherwise use URN
        // For All-through schools, try Primary phase first, then Secondary
        let searchPhase = phase;
        if (phase === 'All-through') {
          searchPhase = 'Primary';
        }
        
        const timePeriod = getTimePeriod(selectedYear);
        let url;
        // Always prefer school name lookup since URN might be null in admissions data
        if (schoolName) {
          url = `/api/admissions?schoolName=${encodeURIComponent(schoolName)}&phase=${searchPhase}&year=${timePeriod}`;
        } else if (urn) {
          url = `/api/admissions?urn=${urn}&phase=${searchPhase}&year=${timePeriod}`;
        } else {
          throw new Error('No school identifier available');
        }
        
        let response = await fetch(url);
        
        // If Primary phase fails for All-through school, try Secondary
        if (!response.ok && phase === 'All-through' && searchPhase === 'Primary') {
          searchPhase = 'Secondary';
          if (schoolName) {
            url = `/api/admissions?schoolName=${encodeURIComponent(schoolName)}&phase=${searchPhase}&year=${timePeriod}`;
          } else if (urn) {
            url = `/api/admissions?urn=${urn}&phase=${searchPhase}&year=${timePeriod}`;
          }
          response = await fetch(url);
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch admissions data');
        }
        
        const data = await response.json();
        setAdmissionsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (urn || schoolName) {
      fetchAdmissionsData();
    }
  }, [urn, schoolName, phase, selectedYear, preloadedData]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Admissions</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !admissionsData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Admissions</h3>
        </div>
        <div className="text-gray-500">
          <p>No admissions data available for this school.</p>
          <p className="text-sm mt-2">For detailed admissions information, please contact the school or local authority.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">

      {/* Year Selection and Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-3">
          <div className="flex space-x-2">
            <button 
              onClick={() => setSelectedYear('2025')}
              className={`px-3 py-1 text-sm rounded ${
                selectedYear === '2025' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              2025
            </button>
            <button 
              onClick={() => setSelectedYear('2024')}
              className={`px-3 py-1 text-sm rounded ${
                selectedYear === '2024' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              2024
            </button>
            <button 
              onClick={() => setSelectedYear('2023')}
              className={`px-3 py-1 text-sm rounded ${
                selectedYear === '2023' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              2023
            </button>
            <button 
              onClick={() => setSelectedYear('2022')}
              className={`px-3 py-1 text-sm rounded ${
                selectedYear === '2022' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              2022
            </button>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            admissionsData.is_oversubscribed 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {admissionsData.is_oversubscribed ? (
              <>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                {admissionsData.oversubscription_rate.toFixed(1)}% Oversubscribed
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Not Oversubscribed
              </>
            )}
          </div>
          <div className="text-xs text-gray-600 leading-relaxed mt-2">
            <p className="mb-1">
              {admissionsData.first_preference_offers > 0 && admissionsData.first_preference_applications > 0 ? 
                `${Math.round((admissionsData.first_preference_offers / admissionsData.first_preference_applications) * 100)}% of applicants who put this school as their first choice primary school received an offer.` : 
                '0% of applicants who put this school as their first choice primary school received an offer.'
              }
            </p>
            <p>
              99% of applications which included this school had preferences listed on the Common Application Form.
            </p>
          </div>
        </div>
      </div>


      {/* On Time Applications Table */}
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-900 mb-1">On Time Applications</h4>
        <div className="border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-1 px-2 text-gray-600 border-r border-gray-200 w-3/4">Total Applications ¹</td>
                <td className="py-1 px-2 font-medium text-right w-1/4">{admissionsData.total_applications}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-1 px-2 text-gray-600 border-r border-gray-200 w-3/4">As first preference</td>
                <td className="py-1 px-2 font-medium text-right w-1/4">{admissionsData.first_preference_applications}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-1 px-2 text-gray-600 border-r border-gray-200 w-3/4">As second preference</td>
                <td className="py-1 px-2 font-medium text-right w-1/4">{admissionsData.second_preference_applications}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-1 px-2 text-gray-600 border-r border-gray-200 w-3/4">As third preference</td>
                <td className="py-1 px-2 font-medium text-right w-1/4">{admissionsData.third_preference_applications}</td>
              </tr>
              <tr>
                <td className="py-1 px-2 text-gray-600 border-r border-gray-200 w-3/4">From another local authority ²</td>
                <td className="py-1 px-2 font-medium text-right w-1/4">{admissionsData.applications_from_another_la}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Offers Made on National Offer Day Table */}
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-900 mb-1">Offers Made on National Offer Day</h4>
        <div className="border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-1 px-2 text-gray-600 border-r border-gray-200 w-3/4">Total Offers</td>
                <td className="py-1 px-2 font-medium text-right w-1/4">{admissionsData.total_offers}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-1 px-2 text-gray-600 border-r border-gray-200 w-3/4">To first preference</td>
                <td className="py-1 px-2 font-medium text-right w-1/4">{admissionsData.first_preference_offers}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-1 px-2 text-gray-600 border-r border-gray-200 w-3/4">To second preference</td>
                <td className="py-1 px-2 font-medium text-right w-1/4">{admissionsData.second_preference_offers}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-1 px-2 text-gray-600 border-r border-gray-200 w-3/4">To third preference</td>
                <td className="py-1 px-2 font-medium text-right w-1/4">{admissionsData.third_preference_offers}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-1 px-2 text-gray-600 border-r border-gray-200 w-3/4">To any preference</td>
                <td className="py-1 px-2 font-medium text-right w-1/4">{admissionsData.total_preferred_offers}</td>
              </tr>
              <tr>
                <td className="py-1 px-2 text-gray-600 border-r border-gray-200 w-3/4">To another local authority ²</td>
                <td className="py-1 px-2 font-medium text-right w-1/4">{admissionsData.offers_to_another_la}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
