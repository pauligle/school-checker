'use client';

import { useState, useEffect } from 'react';

interface ParentViewResponse {
  stronglyAgree: number;
  agree: number;
  disagree: number;
  stronglyDisagree: number;
  dontKnow: number;
  notApplicable?: number;
  yes?: number;
  no?: number;
}

interface ParentViewQuestion {
  question: string;
  responses: ParentViewResponse;
}

interface ParentViewData {
  urn: string;
  schoolName: string;
  localAuthority: string;
  ofstedRegion: string;
  ofstedPhase: string;
  submissions: number;
  responseRate: string;
  dataDate: string;
  questions: {
    q1: ParentViewQuestion;
    q2: ParentViewQuestion;
    q3: ParentViewQuestion;
    q4: ParentViewQuestion;
    q5: ParentViewQuestion;
    q6: ParentViewQuestion;
    q8: ParentViewQuestion;
    q9: ParentViewQuestion;
    q10: ParentViewQuestion;
    q11: ParentViewQuestion;
    q12: ParentViewQuestion;
    q13: ParentViewQuestion;
    q14: ParentViewQuestion;
  };
}

interface OfstedParentViewCardProps {
  urn: string;
  schoolName?: string;
  preloadedData?: {
    parentViewData: ParentViewData | null;
    availableYears: any[];
    selectedYear: string;
  } | null;
}

// Component for individual question bar chart
const QuestionChart = ({ question, responses }: { question: ParentViewQuestion; responses: ParentViewResponse }) => {
  // Handle Q14 (Yes/No question) differently
  if ('yes' in responses && 'no' in responses) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
      <h4 className="text-xs font-semibold text-gray-900 mb-2">{question.question}</h4>
      <div className="space-y-1">
        <div className="flex items-center">
          <span className="w-16 text-xs text-gray-600">Yes</span>
          <div className="flex-1 bg-gray-200 rounded-full h-4 mx-2">
            <div 
              className="bg-green-500 h-4 rounded-full flex items-center justify-end pr-2" 
              style={{ width: `${responses.yes || 0}%` }}
            >
              {(responses.yes || 0) > 0 && <span className="text-white text-xs font-medium">{responses.yes}%</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <span className="w-16 text-xs text-gray-600">No</span>
          <div className="flex-1 bg-gray-200 rounded-full h-4 mx-2">
            <div 
              className="bg-red-500 h-4 rounded-full flex items-center justify-end pr-2" 
              style={{ width: `${responses.no || 0}%` }}
            >
              {(responses.no || 0) > 0 && <span className="text-white text-xs font-medium">{responses.no}%</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Figures based on {(((responses.yes || 0) + (responses.no || 0)) * 0.01 * 100).toFixed(0)} responses
      </div>
    </div>
    );
  }

  // Regular 5-point scale questions
  const responseData = [
    { label: 'Strongly Agree', value: responses.stronglyAgree, color: 'bg-green-600' },
    { label: 'Agree', value: responses.agree, color: 'bg-yellow-500' },
    { label: 'Disagree', value: responses.disagree, color: 'bg-orange-500' },
    { label: 'Strongly Disagree', value: responses.stronglyDisagree, color: 'bg-red-600' },
    { label: "Don't Know", value: responses.dontKnow, color: 'bg-gray-400' }
  ];

  // Add "Not Applicable" for questions that have it
  if (responses.notApplicable !== undefined) {
    responseData.push({ label: 'Not Applicable', value: responses.notApplicable, color: 'bg-gray-300' });
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
      <h4 className="text-xs font-semibold text-gray-900 mb-2">{question.question}</h4>
      <div className="space-y-1">
        {responseData.map((item, index) => (
          item.value > 0 && (
            <div key={index} className="flex items-center">
              <span className="w-20 text-xs text-gray-600">{item.label}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-4 mx-2">
                <div 
                  className={`${item.color} h-4 rounded-full flex items-center justify-end pr-2`}
                  style={{ width: `${item.value}%` }}
                >
                  {item.value > 0 && <span className="text-white text-xs font-medium">{item.value}%</span>}
                </div>
              </div>
            </div>
          )
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Figures based on {Math.round((responses.stronglyAgree + responses.agree + responses.disagree + responses.stronglyDisagree + responses.dontKnow + (responses.notApplicable || 0)) * 0.01 * 100)} responses
      </div>
    </div>
  );
};

export default function OfstedParentViewCard({ urn, schoolName, preloadedData }: OfstedParentViewCardProps) {
  const [parentViewData, setParentViewData] = useState<ParentViewData | null>(null);
  const [availableYears, setAvailableYears] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize with preloaded data or fetch available years when component mounts
  useEffect(() => {
    // If preloaded data is available, use it immediately
    if (preloadedData) {
      setParentViewData(preloadedData.parentViewData);
      setAvailableYears(preloadedData.availableYears);
      setSelectedYear(preloadedData.selectedYear);
      setLoading(false);
      setError(null);
      return;
    }

    // Otherwise, fetch data client-side (fallback)
    async function fetchAvailableYears() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/parent-view/years?urn=${urn}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('No parent view data available for this school');
          }
          throw new Error('Failed to fetch parent view years');
        }
        
        const data = await response.json();
        setAvailableYears(data.years);
        
        // Set the most recent year as default
        if (data.years.length > 0) {
          setSelectedYear(data.years[0].dataDate);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }

    if (urn) {
      fetchAvailableYears();
    }
  }, [urn, preloadedData]);

  // Fetch data for selected year (only if not using preloaded data)
  useEffect(() => {
    // Skip if we have preloaded data
    if (preloadedData) return;
    
    async function fetchParentViewData() {
      if (!selectedYear) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/parent-view?urn=${urn}&year=${selectedYear}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // No data for this specific year - set parentViewData to null but don't set error
            // This way we can still show year selector but indicate no data for selected year
            setParentViewData(null);
            setLoading(false);
            return;
          }
          throw new Error('Failed to fetch parent view data');
        }
        
        const data = await response.json();
        setParentViewData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchParentViewData();
  }, [urn, selectedYear, preloadedData]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900">Ofsted Parent View</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Only show error state if there's a real error OR no available years at all
  if (error || (availableYears.length === 0 && !loading)) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900">Ofsted Parent View</h3>
        </div>
        <div className="text-gray-500">
          <p className="text-xs">No parent view data available for this school.</p>
          <p className="text-xs mt-1">This may be because the school hasn't received enough parent responses to publish the data.</p>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'numeric', 
      year: 'numeric' 
    });
  };


  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900">Ofsted Parent View</h3>
      </div>

      <div className="mb-3">
        <p className="text-xs text-gray-600 mb-1">
          Latest Ofsted parent questionnaire responses.
        </p>
        <a 
          href="https://www.gov.uk/government/statistical-data-sets/ofsted-parent-view-management-information"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-xs underline"
        >
          View on Ofsted Parent View
        </a>
      </div>

      {/* Year Selector */}
      {availableYears.length > 1 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {availableYears.map((yearData) => (
              <button
                key={yearData.dataDate}
                onClick={() => setSelectedYear(yearData.dataDate)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  selectedYear === yearData.dataDate
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {yearData.dateLabel}
              </button>
            ))}
          </div>
          {parentViewData && (
            <p className="text-xs text-gray-500 mt-1">
              Showing data from {availableYears.find(y => y.dataDate === selectedYear)?.dateLabel} 
              ({parentViewData.submissions} responses)
            </p>
          )}
        </div>
      )}

      {/* Show message when no data for selected year */}
      {!parentViewData && availableYears.length > 0 && selectedYear && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h4 className="text-sm font-medium text-yellow-800">No Data Available</h4>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            No parent view data is available for {availableYears.find(y => y.dataDate === selectedYear)?.dateLabel || 'this period'}. 
            Please select a different year to view available data.
          </p>
        </div>
      )}

      {/* All Questions - Boxed Display - Only show if we have data */}
      {parentViewData && (
        <>
          <div className="space-y-2">
            {[
              { key: 'q1', question: parentViewData.questions.q1 },
              { key: 'q2', question: parentViewData.questions.q2 },
              { key: 'q3', question: parentViewData.questions.q3 },
              { key: 'q4', question: parentViewData.questions.q4 },
              { key: 'q5', question: parentViewData.questions.q5 },
              { key: 'q6', question: parentViewData.questions.q6 },
              { key: 'q8', question: parentViewData.questions.q8 },
              { key: 'q9', question: parentViewData.questions.q9 },
              { key: 'q10', question: parentViewData.questions.q10 },
              { key: 'q11', question: parentViewData.questions.q11 },
              { key: 'q12', question: parentViewData.questions.q12 },
              { key: 'q13', question: parentViewData.questions.q13 },
              { key: 'q14', question: parentViewData.questions.q14 }
            ].map(({ key, question }) => (
              <QuestionChart key={key} question={question} responses={question.responses} />
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-4 pt-2 border-t text-xs text-gray-500">
            <p>
              <strong>Responses:</strong> {parentViewData.submissions} parents • 
              <strong> Data:</strong> {formatDate(parentViewData.dataDate)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
