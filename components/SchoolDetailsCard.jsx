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
  const [isCheckingPrimaryResults, setIsCheckingPrimaryResults] = useState(false);
  const [primaryRanking, setPrimaryRanking] = useState(null);

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

  // Check if school has primary results data
  useEffect(() => {
    const checkPrimaryResults = async () => {
      if (!selectedSchool?.urn) {
        setHasPrimaryResults(false);
        return;
      }

      setIsCheckingPrimaryResults(true);
      try {
        // Check if school has any primary results data by checking the years endpoint
        const response = await fetch(`/api/primary-results/years?urn=${selectedSchool.urn}`);
        if (response.ok) {
          const data = await response.json();
          const hasResults = data.years && data.years.length > 0;
          setHasPrimaryResults(hasResults);
          
          // If school has primary results, fetch ranking
          if (hasResults) {
            fetchPrimaryRanking();
          }
          
          // If user is on primary-results tab but school doesn't have primary data, switch to gcse-results
          if (!hasResults && activeTab === 'primary-results') {
            setActiveTab('gcse-results');
          }
        } else {
          setHasPrimaryResults(false);
          // If there's an error and user is on primary-results tab, switch to gcse-results
          if (activeTab === 'primary-results') {
            setActiveTab('gcse-results');
          }
        }
      } catch (error) {
        console.error('Error checking primary results:', error);
        setHasPrimaryResults(false);
        // If there's an error and user is on primary-results tab, switch to gcse-results
        if (activeTab === 'primary-results') {
          setActiveTab('gcse-results');
        }
      } finally {
        setIsCheckingPrimaryResults(false);
      }
    };

    checkPrimaryResults();
  }, [selectedSchool?.urn, activeTab, setActiveTab]);

  if (!selectedSchool) return null;

  return (
    <div className="fixed right-0 top-14 md:top-16 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] w-full md:w-96 bg-white shadow-xl border-l border-gray-200 z-[1000] overflow-y-auto">
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
          {/* Show loading indicator while checking primary results */}
          {isCheckingPrimaryResults && (
            <div className="text-xs text-gray-500 text-center py-2">
              Checking available data...
            </div>
          )}
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
              <span>Pupils</span>
              {(() => {
                const gender = selectedSchool.gender__name_ || 'Mixed';
                const totalPupils = selectedSchool.numberofpupils;
                return totalPupils ? (
                  <span className="bg-slate-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {gender} • {totalPupils.toLocaleString()}
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
              <span>Inspections</span>
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
          <div className={`overflow-hidden transition-all duration-300 ${activeTab === 'details' ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-2 pt-2">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-600">Phase:</span>
                <span className="text-sm text-gray-800">{selectedSchool.phaseofeducation__name_ || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-600">Type:</span>
                <span className="text-sm text-gray-800">{selectedSchool.typeofestablishment__name_ || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-600">Age Range:</span>
                <span className="text-sm text-gray-800">{selectedSchool.statutorylowage}-{selectedSchool.statutoryhighage}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-600">Gender:</span>
                <span className="text-sm text-gray-800">{selectedSchool.gender__name_ || 'Mixed'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-600">Coeducational Sixth Form:</span>
                <span className="text-sm text-gray-800">Yes</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-600">Has Nursery:</span>
                <span className="text-sm text-gray-800">Yes</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-600">Religious Character:</span>
                <span className="text-sm text-gray-800">{selectedSchool.religiouscharacter__name_ || 'Does not apply'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-600">Principal:</span>
                <span className="text-sm text-gray-800">{selectedSchool.headtitle__name_ || ''} {selectedSchool.headfirstname || ''} {selectedSchool.headlastname || ''}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-600">Address:</span>
                <span className="text-sm text-gray-800 text-right max-w-[60%]">{selectedSchool.street}, {selectedSchool.town}, {selectedSchool.postcode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-600">Phone Number:</span>
                <span className="text-sm text-gray-800">{selectedSchool.telephonenum || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-600">Website:</span>
                {selectedSchool.schoolwebsite ? (
                  <a 
                    href={selectedSchool.schoolwebsite.startsWith('http') ? selectedSchool.schoolwebsite : `https://${selectedSchool.schoolwebsite}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline max-w-[60%] text-right"
                  >
                    {selectedSchool.schoolwebsite.length > 20 ? selectedSchool.schoolwebsite.substring(0, 20) + '...' : selectedSchool.schoolwebsite}
                  </a>
                ) : (
                  <span className="text-sm text-gray-800">N/A</span>
                )}
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-600">Academy Sponsor:</span>
                {selectedSchool.trusts__code_ && selectedSchool.trusts__name_ ? (
                  <a 
                    href={`https://www.compare-school-performance.service.gov.uk/multi-academy-trust/${selectedSchool.trusts__code_}/${selectedSchool.trusts__name_.toLowerCase().replace(/\s+/g, '-')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline max-w-[60%] text-right"
                  >
                    {selectedSchool.trusts__name_.length > 20 ? selectedSchool.trusts__name_.substring(0, 20) + '...' : selectedSchool.trusts__name_}
                  </a>
                ) : (
                  <span className="text-sm text-gray-800">N/A</span>
                )}
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-600">Local Authority:</span>
                <span className="text-sm text-gray-800">{selectedSchool.la__name_ || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-600">Unique Reference Number:</span>
                <span className="text-sm text-gray-800">{selectedSchool.urn || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Pupils Tab Content */}
          <div className={`overflow-hidden transition-all duration-300 ${activeTab === 'pupils' ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-2">
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-800">Pupil Summary</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {/* Age Range */}
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">Age Range</span>
                    <span className="text-sm text-gray-900">{selectedSchool.statutorylowage}-{selectedSchool.statutoryhighage}</span>
                  </div>
                  
                  {/* Gender */}
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">Gender</span>
                    <span className="text-sm text-gray-900">{selectedSchool.gender__name_ || 'Mixed'}</span>
                  </div>
                  
                  {/* Total Pupils */}
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">Total Pupils</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {selectedSchool.numberofpupils ? selectedSchool.numberofpupils.toLocaleString() : 'N/A'}
                      </span>
                      {selectedSchool.schoolcapacity && selectedSchool.numberofpupils && (
                        <span className="text-xs text-gray-500 ml-2">
                          At {Math.round((selectedSchool.numberofpupils / selectedSchool.schoolcapacity) * 100)}% Capacity
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Boy/Girl Ratio */}
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">Boy/Girl Ratio</span>
                    <span className="text-sm text-gray-900">
                      {selectedSchool.numberofboys && selectedSchool.numberofgirls && selectedSchool.numberofpupils
                        ? `${((selectedSchool.numberofboys / selectedSchool.numberofpupils) * 100).toFixed(1)}% Boys, ${((selectedSchool.numberofgirls / selectedSchool.numberofpupils) * 100).toFixed(1)}% Girls`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  
                  {/* Pupils per Teacher - Placeholder */}
                  <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
                    <span className="text-sm font-medium text-gray-500">Pupils per Teacher</span>
                    <span className="text-sm text-gray-400">Coming Soon</span>
                  </div>
                  
                  {/* Eligible for Free School Meals */}
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">Eligible for Free School Meals</span>
                    <span className="text-sm text-gray-900">
                      {selectedSchool.percentagefsm ? `${selectedSchool.percentagefsm}%` : 'N/A'}
                    </span>
                  </div>
                  
                  {/* First Language is not English - Placeholder */}
                  <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
                    <span className="text-sm font-medium text-gray-500">First Language is not English</span>
                    <span className="text-sm text-gray-400">Coming Soon</span>
                  </div>
                  
                  {/* Persistent Absence - Placeholder */}
                  <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
                    <span className="text-sm font-medium text-gray-500">Persistent Absence</span>
                    <span className="text-sm text-gray-400">Coming Soon</span>
                  </div>
                  
                  {/* Pupils with SEN Support - Placeholder */}
                  <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
                    <span className="text-sm font-medium text-gray-500">Pupils with SEN Support</span>
                    <span className="text-sm text-gray-400">Coming Soon</span>
                  </div>
                </div>
              </div>
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