'use client';

import React, { useState, useEffect } from 'react';
import PerformanceGauge from './PerformanceGauge';

const PrimaryResultsCard = ({ schoolData }) => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [primaryResultsData, setPrimaryResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableYears, setAvailableYears] = useState(['2024', '2023', '2020/2022', '2019', '2018']); // Default years
  const [rankings, setRankings] = useState({});
  const [rankingLoading, setRankingLoading] = useState(false);

  useEffect(() => {
    const fetchPrimaryResults = async () => {
      console.log('PrimaryResultsCard useEffect triggered, schoolData:', schoolData, 'selectedYear:', selectedYear);

      if (!schoolData?.urn) {
        console.log('No URN found, setting loading to false');
        setLoading(false);
        return;
      }

      // For COVID-19 period, don't fetch data - just show banner
      if (selectedYear === '2020/2022') {
        console.log('COVID-19 period selected, showing banner only');
        setPrimaryResultsData(null);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        console.log('Fetching primary results for URN:', schoolData.urn, 'year:', selectedYear);
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/primary-results-year-specific?urn=${schoolData.urn}&year=${selectedYear}`);

        console.log('API response status:', response.status);
        console.log('Using year-specific API for year:', selectedYear);

        if (!response.ok) {
          if (response.status === 404) {
            // School doesn't have primary results data for this year
            setPrimaryResultsData(null);
            setLoading(false);
            return;
          }
          throw new Error(`Failed to fetch primary results: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Primary results data received:', data);
        console.log('School RWM data:', {
          rwm_expected: data.school?.rwm_expected_percentage,
          rwm_higher: data.school?.rwm_higher_percentage,
          reading: data.school?.reading_average_score,
          maths: data.school?.maths_average_score
        });
        setPrimaryResultsData(data);
      } catch (err) {
        console.error('Error fetching primary results:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrimaryResults();
  }, [schoolData?.urn, selectedYear]);

  // Function to fetch available years for this school
  const fetchAvailableYears = async () => {
    if (!schoolData?.urn) return;
    
    try {
      const response = await fetch(`/api/primary-results/years?urn=${schoolData.urn}`);
      if (response.ok) {
        const data = await response.json();
        // Map database years to display years based on your folder structure
        const yearMapping = {
          '2024': '2024', // Database year 2024 → Display year 2024
          '2023': '2023', // Database year 2023 → Display year 2023
          '2019': '2019', // Database year 2019 → Display year 2019
          '2018': '2018'  // Database year 2018 → Display year 2018
        };
        
        const displayYears = data.years?.map(year => yearMapping[year] || year) || [];
        // Always show all expected years, regardless of data availability
        const allYears = ['2024', '2023', '2020/2022', '2019', '2018'];
        setAvailableYears(allYears);
      }
    } catch (error) {
      console.error('Error fetching available years:', error);
    }
  };

  // Fetch rankings for all years
  const fetchRankings = async () => {
    if (!schoolData?.urn) return;
    
    try {
      setRankingLoading(true);
      const response = await fetch(`/api/school-rankings?urn=${schoolData.urn}`);
      if (response.ok) {
        const data = await response.json();
        const rankingsByYear = {};
        data.rankings?.forEach(ranking => {
          rankingsByYear[ranking.data_year] = ranking;
        });
        setRankings(rankingsByYear);
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setRankingLoading(false);
    }
  };

  // Fetch available years when component mounts
  useEffect(() => {
    fetchAvailableYears();
    fetchRankings();
  }, [schoolData?.urn]);

  // Map display years back to database years for API calls
  const getDatabaseYear = (displayYear) => {
    const reverseMapping = {
      '2024': '2024', // Display year 2024 maps to database year 2024
      '2023': '2023', // Display year 2023 maps to database year 2023
      '2020/2022': null, // COVID-19 period - no data to fetch
      '2019': '2019', // Display year 2019 maps to database year 2019
      '2018': '2018'  // Display year 2018 maps to database year 2018
    };
    return reverseMapping[displayYear] || displayYear;
  };

  const years = availableYears;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center text-gray-500 py-8">
          Loading primary results...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-sm text-red-800">
            <strong>Error loading primary results:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-4">
        <div className="text-sm text-amber-800">
          <strong>2025 exam results have not yet been published.</strong> You can check the DfE publication timetable{' '}
          <a href="https://www.compare-school-performance.service.gov.uk/publication-timetable" target="_blank" rel="noopener noreferrer" className="text-amber-600 underline hover:text-amber-800">here</a>.
        </div>
      </div>

      {/* Year Selection Tabs */}
      <div className="flex space-x-2 pb-4">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-2 text-sm font-medium rounded transition-all duration-200 flex-1 ${
              selectedYear === year
                ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 border border-gray-200'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Ranking Display */}
      {(() => {
        const databaseYear = getDatabaseYear(selectedYear);
        const ranking = databaseYear ? rankings[databaseYear] : null;
        
        if (ranking && !rankingLoading) {
          // Calculate the percentage of schools that are BETTER than this school
          const betterPercentage = ((ranking.rwm_rank - 1) / ranking.total_schools) * 100;
          
          const percentileText = betterPercentage <= 1 ? 'top 1%' :
                                betterPercentage <= 5 ? 'top 5%' :
                                betterPercentage <= 10 ? 'top 10%' :
                                betterPercentage <= 25 ? 'top 25%' :
                                betterPercentage <= 50 ? 'top 50%' : 'bottom 50%';
          
          return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-base font-medium text-gray-700">
                  Ranked {ranking.rwm_rank.toLocaleString()} of {ranking.total_schools.toLocaleString()} schools ({percentileText})
                </span>
                <span className="text-sm text-gray-500">¹</span>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Content based on selected year and data availability */}
      {selectedYear === '2020/2022' ? (
        <div className="space-y-6">
          <div className="space-y-4 text-base text-gray-700">
            <p>
              Primary school assessment results (SATs) were not published at individual school level during 2020, 2021, and 2022 due to the COVID-19 pandemic.
            </p>
            <p>
              No national assessments took place in 2020 and 2021. While SATs resumed in 2022, the results were not made publicly available at school level. School-level performance data publication returned in 2023.
            </p>
            <p>
              For more information, visit <a href="https://www.gov.uk" className="text-blue-600 underline hover:text-blue-700">www.gov.uk</a>.
            </p>
          </div>
        </div>
      ) : !primaryResultsData ? (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-base text-blue-800">
              <strong>Primary Results Not Available</strong>
            </div>
            <div className="text-base text-blue-700 mt-2">
              This school does not have Key Stage 2 (Primary) results data. This typically means it's a secondary school or a school that doesn't participate in KS2 assessments.
            </div>
          </div>
          <div className="text-center text-gray-500 py-8 text-base">
            Primary results data is only available for schools that teach Key Stage 2 (ages 7-11).
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Data tables will be rendered here */}
          {(() => {
            const { school, laAverages, englandAverages } = primaryResultsData;
            return (
              <>


      {/* Performance Gauge for Reading, Writing and Maths */}
      <PerformanceGauge
        schoolValue={school.rwm_expected_percentage}
        laValue={laAverages?.rwm_expected_percentage}
        englandValue={englandAverages?.rwm_expected_percentage}
        title="Reading, Writing and Maths Performance"
        showLabels={true}
      />

      {/* Reading, Writing and Maths Table */}
      <div className="border border-blue-200 rounded overflow-hidden bg-white shadow-sm">
        <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800">Reading, writing and maths</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-blue-25 border-b border-blue-100">
                <th className="text-left py-3 px-6 font-semibold text-blue-900"></th>
                <th className="text-center py-3 px-6 font-semibold text-blue-900">School</th>
                <th className="text-center py-3 px-6 font-semibold text-blue-900">LA</th>
                <th className="text-center py-3 px-6 font-semibold text-blue-900">England</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              <tr className="hover:bg-blue-25">
                <td className="py-3 px-6 font-semibold text-blue-900">Pupils meeting the expected standard</td>
                <td className="py-3 px-6 text-center text-blue-800 font-medium">{school.rwm_expected_percentage || 'N/A'}%</td>
                <td className="py-3 px-6 text-center text-blue-700">{laAverages?.rwm_expected_percentage || 'N/A'}%</td>
                <td className="py-3 px-6 text-center text-blue-700">{englandAverages?.rwm_expected_percentage || 'N/A'}%</td>
              </tr>
              <tr className="hover:bg-blue-25">
                <td className="py-3 px-6 font-semibold text-blue-900">Pupils achieving at a higher standard</td>
                <td className="py-3 px-6 text-center text-blue-800 font-medium">{school.rwm_higher_percentage || 'N/A'}%</td>
                <td className="py-3 px-6 text-center text-blue-700">{laAverages?.rwm_higher_percentage || 'N/A'}%</td>
                <td className="py-3 px-6 text-center text-blue-700">{englandAverages?.rwm_higher_percentage || 'N/A'}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


      {/* Average Scaled Score Table */}
      <div className="border border-emerald-200 rounded overflow-hidden bg-white shadow-sm">
        <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-200">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-emerald-800">Average scaled score</h3>
            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-emerald-25 border-b border-emerald-100">
                <th className="text-left py-3 px-6 font-semibold text-emerald-900"></th>
                <th className="text-center py-3 px-6 font-semibold text-emerald-900">School</th>
                <th className="text-center py-3 px-6 font-semibold text-emerald-900">LA</th>
                <th className="text-center py-3 px-6 font-semibold text-emerald-900">England</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50">
              <tr className="hover:bg-emerald-25">
                <td className="py-3 px-6 font-semibold text-emerald-900">Reading</td>
                <td className="py-3 px-6 text-center text-emerald-800 font-medium">
                  {school.reading_average_score ? school.reading_average_score : 'N/A'}
                </td>
                <td className="py-3 px-6 text-center text-emerald-700">
                  {laAverages?.reading_average_score ? laAverages.reading_average_score : 'N/A'}
                </td>
                <td className="py-3 px-6 text-center text-emerald-700">
                  {englandAverages?.reading_average_score ? englandAverages.reading_average_score : 'N/A'}
                </td>
              </tr>
              <tr className="hover:bg-emerald-25">
                <td className="py-3 px-6 font-semibold text-emerald-900">Maths</td>
                <td className="py-3 px-6 text-center text-emerald-800 font-medium">
                  {school.maths_average_score ? school.maths_average_score : 'N/A'}
                </td>
                <td className="py-3 px-6 text-center text-emerald-700">
                  {laAverages?.maths_average_score ? laAverages.maths_average_score : 'N/A'}
                </td>
                <td className="py-3 px-6 text-center text-emerald-700">
                  {englandAverages?.maths_average_score ? englandAverages.maths_average_score : 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Scaled Scores Note */}
      {(!school.reading_average_score || !school.maths_average_score) && (
        <div className="bg-amber-50 border border-amber-200 rounded p-4">
          <div className="text-sm text-amber-800">
            Average scaled scores are not available for this year. This may be due to data collection changes or the year being before scaled scores were introduced.
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <div className="text-sm text-blue-800">
          The Department for Education have not produced KS1 to KS2 progress (value-added) measures for this year. 
          This is because there is no KS1 baseline available to calculate primary progress measures for 2023/24 and 2024/25 due to Covid-19 disruption.
        </div>
      </div>

      {/* Grammar, Punctuation and Spelling Table - Only show for 2023 and 2024 */}
      {(selectedYear === '2023' || selectedYear === '2024') && (
        <div className="border border-purple-200 rounded overflow-hidden bg-white shadow-sm">
          <div className="bg-purple-50 px-6 py-4 border-b border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800">Grammar, punctuation and spelling</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="bg-purple-25 border-b border-purple-100">
                  <th className="text-left py-3 px-6 font-semibold text-purple-900"></th>
                  <th className="text-center py-3 px-6 font-semibold text-purple-900">School</th>
                  <th className="text-center py-3 px-6 font-semibold text-purple-900">LA</th>
                  <th className="text-center py-3 px-6 font-semibold text-purple-900">England</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                <tr className="hover:bg-purple-25">
                  <td className="py-3 px-6 font-semibold text-purple-900">Pupils meeting the expected standard</td>
                  <td className="py-3 px-6 text-center text-purple-800 font-medium">{school.gps_expected_percentage || 'N/A'}%</td>
                  <td className="py-3 px-6 text-center text-purple-700">{laAverages?.gps_expected_percentage || 'N/A'}%</td>
                  <td className="py-3 px-6 text-center text-purple-700">{englandAverages?.gps_expected_percentage || 'N/A'}%</td>
                </tr>
                <tr className="hover:bg-purple-25">
                  <td className="py-3 px-6 font-semibold text-purple-900">Pupils achieving at a higher standard</td>
                  <td className="py-3 px-6 text-center text-purple-800 font-medium">{school.gps_higher_percentage || 'N/A'}%</td>
                  <td className="py-3 px-6 text-center text-purple-700">{laAverages?.gps_higher_percentage || 'N/A'}%</td>
                  <td className="py-3 px-6 text-center text-purple-700">{englandAverages?.gps_higher_percentage || 'N/A'}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* External Link */}
      <div className="text-center">
        <a 
          href="#" 
          className="text-indigo-600 hover:text-indigo-800 text-sm underline font-medium"
        >
          View these results and more on <strong>gov.uk</strong>
        </a>
      </div>

      {/* Footnotes */}
      <div className="space-y-2 text-sm text-slate-600 bg-slate-50 p-4 rounded border border-slate-200">
        <div>
          <strong className="text-slate-800">¹</strong> Rankings are calculated by sorting schools first by the percentage of pupils who meet the expected standard and then by the percentage of pupils who achieve a higher standard.
        </div>
        <div>
          <strong className="text-slate-800">²</strong> It's important to not confuse exam results with pupil progress. As an analogy, think of two mountain climbers. One starts at the bottom and progresses half way up. The other starts a third of the way up and progresses another third. So, the second progressed less up the mountain (one third compared to one half) but ended up higher (two thirds compared to one half). An exam result shows how high up the mountain a pupil finished, whereas a progress score shows how much of the mountain they climbed. We rank based on exam results (height up the mountain) and not progress (distance climbed). Progress scores are a good indication of how much 'value' a school is adding (like a Sherpa helping a climber up the mountain). There are many reasons as to why some children start from a higher starting point than others, e.g. natural ability and socio-economic factors.
        </div>
      </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default PrimaryResultsCard;
