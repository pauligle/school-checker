'use client';

import React, { useState, useEffect } from 'react';
import SchoolInspectionCard from './SchoolInspectionCard';
import PrimaryResultsCard from './PrimaryResultsCard';

const SchoolDetailsCard = ({ 
  selectedSchool, 
  selectedSchoolInspections, 
  activeTab, 
  setActiveTab, 
  onClose 
}) => {
  const [hasPrimaryResults, setHasPrimaryResults] = useState(false);
  const [primaryRanking, setPrimaryRanking] = useState(null);
  const [primaryResultsChecked, setPrimaryResultsChecked] = useState(false);
  const [pupilData, setPupilData] = useState(null);
  const [pupilDataLoaded, setPupilDataLoaded] = useState(false);

  // Calculate School Checker Inspection Rating (same logic as SchoolInspectionCard)
  const calculateSchoolCheckerRating = (inspection) => {
    if (!inspection) return null;

    // If we have an official Ofsted overall rating (pre-September 2024), use that
    if (inspection.outcome && inspection.outcome >= 1 && inspection.outcome <= 4) {
      return {
        rating: inspection.outcome,
        isCalculated: false,
        source: 'Ofsted Overall Rating'
      };
    }

    // Calculate rating from category judgments (post-September 2024)
    const weights = {
      quality_of_education: 0.4,
      effectiveness_of_leadership: 0.25,
      behaviour_and_attitudes: 0.2,
      personal_development: 0.15
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
      categoriesUsed
    };
  };

  // Get rating text and color
  const getRatingInfo = (rating) => {
    switch (rating) {
      case 1: return { text: 'Outstanding', color: 'bg-green-100 text-green-800' };
      case 2: return { text: 'Good', color: 'bg-yellow-100 text-yellow-800' };
      case 3: return { text: 'Requires Improvement', color: 'bg-orange-100 text-orange-800' };
      case 4: return { text: 'Inadequate', color: 'bg-red-100 text-red-800' };
      default: return { text: 'N/A', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Fetch 2024 ranking for tab label
  const fetchPrimaryRanking = async () => {
    if (!selectedSchool?.urn) return;
    
    try {
      const response = await fetch(`/api/school-rankings?urn=${selectedSchool.urn}&year=2024`);
      if (response.ok) {
        const data = await response.json();
        setPrimaryRanking(data.ranking);
      }
    } catch (error) {
      console.error('Error fetching primary ranking:', error);
    }
  };

  // Reset primary results check when school changes
  useEffect(() => {
    setPrimaryResultsChecked(false);
    setHasPrimaryResults(false);
    setPrimaryRanking(null);
    setPupilData(null);
    setPupilDataLoaded(false);
  }, [selectedSchool?.urn]);

  // Check if school has primary results data (only once per school)
  useEffect(() => {
    const checkPrimaryResults = async () => {
      if (!selectedSchool?.urn || primaryResultsChecked) {
        return;
      }

      try {
        // Check if school has any primary results data by checking the years endpoint
        const response = await fetch(`/api/primary-results/years?urn=${selectedSchool.urn}`);
        if (response.ok) {
          const data = await response.json();
          const hasResults = data.years && data.years.length > 0;
        setHasPrimaryResults(hasResults);
        
          // If school has primary results, fetch ranking immediately
          if (hasResults) {
            fetchPrimaryRanking();
          }
        } else {
          setHasPrimaryResults(false);
        }
      } catch (error) {
        console.error('Error checking primary results:', error);
        setHasPrimaryResults(false);
      } finally {
        setPrimaryResultsChecked(true);
      }
    };

    checkPrimaryResults();
  }, [selectedSchool?.urn, primaryResultsChecked]);

  // Fetch pupil data when pupils tab is accessed
  useEffect(() => {
    const fetchPupilData = async () => {
      if (!selectedSchool?.urn || pupilDataLoaded || activeTab !== 'pupils') {
        return;
      }

      try {
        const response = await fetch(`/api/pupil-summary?urn=${selectedSchool.urn}`);
        if (response.ok) {
          const data = await response.json();
          setPupilData(data);
        } else {
          setPupilData({ hasData: false });
        }
      } catch (error) {
        console.error('Error fetching pupil data:', error);
        setPupilData({ hasData: false });
      } finally {
        setPupilDataLoaded(true);
      }
    };

    fetchPupilData();
  }, [selectedSchool?.urn, activeTab, pupilDataLoaded]);

  // Handle tab switching logic (separate from data fetching)
  useEffect(() => {
    if (primaryResultsChecked && !hasPrimaryResults && activeTab === 'primary-results') {
      setActiveTab('gcse-results');
    }
  }, [primaryResultsChecked, hasPrimaryResults, activeTab, setActiveTab]);

  if (!selectedSchool) return null;

  return (
    <div className="fixed right-0 top-14 md:top-16 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] w-full md:w-96 bg-white shadow-xl border-l border-gray-200 z-[1500] overflow-y-auto">
      <div className="p-3">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-lg font-bold text-gray-800 pr-2 leading-tight">{selectedSchool.establishmentname}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg flex-shrink-0"
          >
            ×
          </button>
        </div>
        
        {/* Vertical Tab Navigation */}
        <div className="space-y-1 mb-4">
          <button
            onClick={() => setActiveTab('details')}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded transition-colors ${
              activeTab === 'details'
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span>📋</span>
              <span>School Details</span>
              {(() => {
                const phase = selectedSchool.phaseofeducation__name_;
                const lowAge = selectedSchool.statutorylowage;
                const highAge = selectedSchool.statutoryhighage;
                const establishmentType = selectedSchool.typeofestablishment__name_;
                
                // Check if school is independent
                const isIndependent = establishmentType && 
                  (establishmentType.toLowerCase().includes('independent') || 
                   establishmentType.toLowerCase().includes('private'));
                
                // Determine phase to display
                let displayPhase = phase;
                if (!phase || 
                    phase === 'Not Available' || 
                    phase === 'N/A' || 
                    phase === 'Not applicable' ||
                    phase === 'Not Applicable' ||
                    phase === 'Not available' ||
                    phase === 'Unknown' ||
                    phase === '') {
                  if (lowAge && highAge) {
                    if (lowAge >= 11 && highAge <= 16) {
                      displayPhase = 'Secondary';
                    } else if (lowAge >= 3 && highAge <= 11) {
                      displayPhase = 'Primary';
                    } else if (lowAge >= 3 && highAge >= 16) {
                      displayPhase = 'All-through';
                    }
                  }
                }
                
                return (
                  <div className="flex items-center space-x-1">
                    {displayPhase && (
                      <span className="bg-slate-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {displayPhase}
                      </span>
                    )}
                    {isIndependent && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Independent
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
            <span className="text-gray-400">+</span>
          </button>
          <button
            onClick={() => setActiveTab('pupils')}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded transition-colors ${
              activeTab === 'pupils'
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span>👥</span>
              <span>Pupils Data</span>
              {(() => {
                const gender = selectedSchool.gender__name_ || 'Mixed';
                const totalPupils = selectedSchool.numberofpupils;
                return totalPupils ? (
                  <span className="bg-slate-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {gender} • {totalPupils.toLocaleString()} pupils
                  </span>
                ) : null;
              })()}
            </div>
            <span className="text-gray-400">+</span>
          </button>
          <button
            onClick={() => setActiveTab('inspections')}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded transition-colors ${
              activeTab === 'inspections'
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span>🏆</span>
              <span>Ofsted Inspections</span>
              {(() => {
                const latestInspection = selectedSchoolInspections?.[0];
                const schoolCheckerRating = calculateSchoolCheckerRating(latestInspection);
                
                if (schoolCheckerRating) {
                  const ratingInfo = getRatingInfo(schoolCheckerRating.rating);
                  return (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${ratingInfo.color}`}>
                      {ratingInfo.text}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
            <span className="text-gray-400">+</span>
          </button>
          {/* Only show Primary Results tab if school has primary results data */}
          {hasPrimaryResults && (
            <button
              onClick={() => setActiveTab('primary-results')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded transition-colors ${
                activeTab === 'primary-results'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>📊</span>
                <span>Primary Results</span>
                {primaryRanking && (
                  <span className="bg-slate-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {(() => {
                      // Calculate the percentage of schools that are BETTER than this school
                      const betterPercentage = ((primaryRanking.rwm_rank - 1) / primaryRanking.total_schools) * 100;
                      
                      if (betterPercentage <= 1) return 'Top 1%';
                      if (betterPercentage <= 5) return 'Top 5%';
                      if (betterPercentage <= 10) return 'Top 10%';
                      if (betterPercentage <= 25) return 'Top 25%';
                      if (betterPercentage <= 50) return 'Top 50%';
                      return 'Bottom 50%';
                    })()}
                  </span>
                )}
              </div>
              <span className="text-gray-400">+</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('gcse-results')}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded transition-colors ${
              activeTab === 'gcse-results'
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span>📈</span>
              <span>GCSE Results</span>
            </div>
            <span className="text-gray-400">+</span>
          </button>
          <button
            onClick={() => setActiveTab('alevel-results')}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded transition-colors ${
              activeTab === 'alevel-results'
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span>🎓</span>
              <span>A-Level Results</span>
            </div>
            <span className="text-gray-400">+</span>
          </button>
        </div>

        {/* Accordion Content */}
        <div className="space-y-1">
          {/* Details Tab Content */}
          <div className={`overflow-hidden transition-all duration-300 ${activeTab === 'details' ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-2">
              {/* School Details */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-200 px-3 py-2 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-800">School Details</h3>
              </div>
                <div className="overflow-visible">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-1 px-2 font-medium text-gray-700 border-r border-gray-200">Detail</th>
                        <th className="text-right py-1 px-2 font-medium text-gray-700">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Phase</td>
                        <td className="py-1 px-2 text-right text-gray-800">{selectedSchool.phaseofeducation__name_ || 'N/A'}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Type</td>
                        <td className="py-1 px-2 text-right text-gray-800">{selectedSchool.typeofestablishment__name_ || 'N/A'}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Age Range</td>
                        <td className="py-1 px-2 text-right text-gray-800">{selectedSchool.statutorylowage}-{selectedSchool.statutoryhighage}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Gender</td>
                        <td className="py-1 px-2 text-right text-gray-800">{selectedSchool.gender__name_ || 'Mixed'}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Coeducational Sixth Form</td>
                        <td className="py-1 px-2 text-right text-gray-800">Yes</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Has Nursery</td>
                        <td className="py-1 px-2 text-right text-gray-800">Yes</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Religious Character</td>
                        <td className="py-1 px-2 text-right text-gray-800">{selectedSchool.religiouscharacter__name_ || 'Does not apply'}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Principal</td>
                        <td className="py-1 px-2 text-right text-gray-800">{selectedSchool.headtitle__name_ || ''} {selectedSchool.headfirstname || ''} {selectedSchool.headlastname || ''}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Address</td>
                        <td className="py-1 px-2 text-right text-gray-800">{selectedSchool.street}, {selectedSchool.town}, {selectedSchool.postcode}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Phone Number</td>
                        <td className="py-1 px-2 text-right text-gray-800">{selectedSchool.telephonenum || 'N/A'}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Website</td>
                        <td className="py-1 px-2 text-right text-gray-800">
                {selectedSchool.schoolwebsite ? (
                  <a 
                    href={selectedSchool.schoolwebsite.startsWith('http') ? selectedSchool.schoolwebsite : `https://${selectedSchool.schoolwebsite}`}
                    target="_blank"
                    rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {selectedSchool.schoolwebsite.length > 20 ? selectedSchool.schoolwebsite.substring(0, 20) + '...' : selectedSchool.schoolwebsite}
                  </a>
                ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Academy Sponsor</td>
                        <td className="py-1 px-2 text-right text-gray-800">
                {selectedSchool.trusts__code_ && selectedSchool.trusts__name_ ? (
                  <a 
                    href={`https://www.compare-school-performance.service.gov.uk/multi-academy-trust/${selectedSchool.trusts__code_}/${selectedSchool.trusts__name_.toLowerCase().replace(/\s+/g, '-')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {selectedSchool.trusts__name_.length > 20 ? selectedSchool.trusts__name_.substring(0, 20) + '...' : selectedSchool.trusts__name_}
                  </a>
                ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Local Authority</td>
                        <td className="py-1 px-2 text-right text-gray-800">{selectedSchool.la__name_ || 'N/A'}</td>
                      </tr>
                      <tr className="border-b border-gray-100 last:border-b-0">
                        <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Unique Reference Number</td>
                        <td className="py-1 px-2 text-right text-gray-800">{selectedSchool.urn || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
              </div>
              </div>
            </div>
          </div>

          {/* Pupils Tab Content */}
          <div className={`overflow-hidden transition-all duration-300 ${activeTab === 'pupils' ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-2">
              {!pupilDataLoaded ? (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading pupil data...</span>
                  </div>
                </div>
              ) : !pupilData?.hasData ? (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-center text-gray-500">
                    <p className="text-sm">No detailed pupil data available for this school.</p>
                    <p className="text-xs mt-1">Using basic data from school records.</p>
                  </div>
                </div>
              ) : (
            <div className="space-y-3">
              {/* Data Source Note */}
              <div className="text-xs text-gray-500 text-center">
                <a 
                  href="https://explore-education-statistics.service.gov.uk/find-statistics/school-pupils-and-their-characteristics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Pupil demographics from UK Government statistics ({pupilData.academicYear})
                </a>
              </div>

                  {/* Pupil Summary */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-200 px-3 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-800">Pupil Summary</h3>
                  </div>
                    <div className="overflow-visible">
                      <table className="w-full text-xs">
                        <tbody>
                          <tr className="border-b border-gray-100">
                            <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Total Pupils</td>
                            <td className="py-1 px-2 text-right text-gray-800">
                              {pupilData.summary.totalPupils?.toLocaleString() || 'N/A'}
                              {selectedSchool.schoolcapacity && pupilData.summary.totalPupils && (
                                <span className="text-gray-500 ml-1">
                                  ({Math.round((pupilData.summary.totalPupils / selectedSchool.schoolcapacity) * 100)}% capacity)
                                </span>
                              )}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Age Range</td>
                            <td className="py-1 px-2 text-right text-gray-800">{selectedSchool.statutorylowage}-{selectedSchool.statutoryhighage}</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Gender</td>
                            <td className="py-1 px-2 text-right text-gray-800">{selectedSchool.gender__name_ || 'Mixed'}</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Boy/Girl Ratio</td>
                            <td className="py-1 px-2 text-right text-gray-800">
                              {pupilData.summary.boys && pupilData.summary.girls && pupilData.summary.totalPupils ? (
                                <>
                                  <div>{((pupilData.summary.girls / pupilData.summary.totalPupils) * 100).toFixed(1)}% Girls</div>
                                  <div>{((pupilData.summary.boys / pupilData.summary.totalPupils) * 100).toFixed(1)}% Boys</div>
                                </>
                              ) : (
                                'N/A'
                              )}
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Eligible for Free School Meals</td>
                            <td className="py-1 px-2 text-right text-gray-800">
                              {pupilData.summary.fsmCount || 0} pupils ({pupilData.summary.fsmPercentage?.toFixed(1) || 0}%)
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-1 px-2 text-gray-800 border-r border-gray-200">First Language is Not English</td>
                            <td className="py-1 px-2 text-right text-gray-800">
                              {pupilData.language.englishFirstLanguage && pupilData.summary.totalPupils ? (
                                <>
                                  {pupilData.summary.totalPupils - pupilData.language.englishFirstLanguage} pupils
                                  <span className="text-gray-500 ml-1">
                                    ({((pupilData.summary.totalPupils - pupilData.language.englishFirstLanguage) / pupilData.summary.totalPupils * 100).toFixed(1)}%)
                    </span>
                                </>
                              ) : (
                                'N/A'
                              )}
                            </td>
                          </tr>
                          {pupilData.summary.youngCarers > 0 && (
                            <tr className="border-b border-gray-100">
                              <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Young Carers</td>
                              <td className="py-1 px-2 text-right text-gray-800">
                                {pupilData.summary.youngCarers} ({pupilData.summary.youngCarersPercentage?.toFixed(1) || 0}%)
                              </td>
                            </tr>
                          )}
         {pupilData.summary.pupilToTeacherRatio && (
           <tr className="border-b border-gray-100">
             <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Pupils per Teacher</td>
             <td className="py-1 px-2 text-right text-gray-800">{pupilData.summary.pupilToTeacherRatio}</td>
           </tr>
         )}
         {((pupilData.summary.senWithStatements && pupilData.summary.senWithStatements !== '') || (pupilData.summary.senWithoutStatements && pupilData.summary.senWithoutStatements !== '')) && (
           <tr className="border-b border-gray-100 last:border-b-0">
             <td className="py-1 px-2 text-gray-800 border-r border-gray-200">Pupils with SEN Support</td>
             <td className="py-1 px-2 text-right text-gray-800">
               {(() => {
                 const senWithStatements = parseInt(pupilData.summary.senWithStatements) || 0;
                 const senWithoutStatements = parseInt(pupilData.summary.senWithoutStatements) || 0;
                 const totalSen = senWithStatements + senWithoutStatements;
                 const totalPupils = pupilData.summary.totalPupils || 1;
                 const percentage = (totalSen / totalPupils * 100).toFixed(1);
                 return `${totalSen} pupils (${percentage}%)`;
               })()}
             </td>
           </tr>
         )}
                        </tbody>
                      </table>
                    </div>
                  </div>


                  {/* Pupil Ethnicities */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-200 px-3 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-800">Pupil Ethnicities</h3>
                    </div>
                    <div className="overflow-visible">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left py-1 px-2 font-medium text-gray-700 border-r border-gray-200">Ethnicity of Pupils</th>
                            <th className="text-right py-1 px-2 font-medium text-gray-700">% of School</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            // Dynamic approach: Get all ethnicities from the data object
                            const ethnicityMapping = {
                              'African': pupilData.ethnicity.blackAfrican,
                              'Bangladeshi': pupilData.ethnicity.asianBangladeshi,
                              'White, Other': pupilData.ethnicity.whiteOther,
                              'Pakistani': pupilData.ethnicity.asianPakistani,
                              'White, British': pupilData.ethnicity.whiteBritish,
                              'Caribbean': pupilData.ethnicity.blackCaribbean,
                              'Mixed, Other': pupilData.ethnicity.mixedOther,
                              'Indian': pupilData.ethnicity.asianIndian,
                              'Other': pupilData.ethnicity.other,
                              'Asian, Other': pupilData.ethnicity.asianOther,
                              'Black, Other': pupilData.ethnicity.blackOther,
                              'White & Black (Caribbean)': pupilData.ethnicity.mixedWhiteBlackCaribbean,
                              'White & Black (African)': pupilData.ethnicity.mixedWhiteBlackAfrican,
                              'White & Asian': pupilData.ethnicity.mixedWhiteAsian,
                              'Unclassified': pupilData.ethnicity.unclassified,
                              'Chinese': pupilData.ethnicity.chinese,
                              'Irish': pupilData.ethnicity.whiteIrish,
                              'Traveller of Irish Heritage': pupilData.ethnicity.travellerIrishHeritage,
                              'Gypsy/Roma': pupilData.ethnicity.gypsyRoma
                            };
                            
                            // Convert to array and filter out ethnicities with 0 count
                            const ethnicities = Object.entries(ethnicityMapping)
                              .map(([name, data]) => ({
                                name,
                                count: data?.count || 0,
                                percentage: data?.percentage || 0
                              }))
                              .filter(eth => eth.count > 0)
                              .sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
                            
                     return ethnicities.map((ethnicity, index) => (
                       <tr key={index} className="border-b border-gray-100 last:border-b-0">
                         <td className="py-1 px-2 text-gray-800 border-r border-gray-200">{ethnicity.name}</td>
                         <td className="py-1 px-2 text-right text-gray-800">
                           <div className="flex items-center justify-end space-x-2">
                             <div className="w-16 bg-gray-200 rounded-full h-2">
                               <div 
                                 className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                                 style={{ width: `${Math.min(ethnicity.percentage || 0, 100)}%` }}
                               ></div>
                             </div>
                             <span className="text-xs font-medium min-w-[3rem]">{ethnicity.percentage?.toFixed(1) || 0}%</span>
                           </div>
                         </td>
                       </tr>
                     ));
                          })()}
                        </tbody>
                      </table>
                  </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Inspections Tab Content */}
          <div className={`overflow-hidden transition-all duration-300 ${activeTab === 'inspections' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-2">
              <SchoolInspectionCard inspections={selectedSchoolInspections} />
            </div>
          </div>

          {/* Primary Results Tab Content - Only show if school has primary results data */}
          {hasPrimaryResults && (
            <div className={`overflow-hidden transition-all duration-300 ${activeTab === 'primary-results' ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="pt-2">
                <PrimaryResultsCard schoolData={selectedSchool} />
              </div>
            </div>
          )}

          {/* GCSE Results Tab Content */}
          <div className={`overflow-hidden transition-all duration-300 ${activeTab === 'gcse-results' ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-2">
              <div className="space-y-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="text-sm font-bold text-blue-600 mb-2">GCSE Results</h3>
                  <div className="text-sm text-gray-500">
                    {!hasPrimaryResults ? (
                      <div>
                        <p className="mb-2">This school appears to be a secondary school or doesn't participate in Key Stage 2 assessments.</p>
                        <p>GCSE results data will be added here for secondary schools.</p>
                      </div>
                    ) : (
                      <p>GCSE results data will be added here.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* A-Level Results Tab Content */}
          <div className={`overflow-hidden transition-all duration-300 ${activeTab === 'alevel-results' ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-2">
              <div className="space-y-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h3 className="text-sm font-bold text-blue-600 mb-2">A-Level Results</h3>
                  <div className="text-sm text-gray-500">
                    A-Level results data will be added here.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetailsCard;