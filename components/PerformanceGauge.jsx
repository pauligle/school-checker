import React from 'react';

const PerformanceGauge = ({ 
  schoolValue, 
  laValue, 
  englandValue, 
  title = "Performance Gauge",
  showLabels = true 
}) => {
  // Ensure we have valid numeric values
  const school = parseFloat(schoolValue) || 0;
  const la = parseFloat(laValue) || 0;
  const england = parseFloat(englandValue) || 0;

  // Calculate differences
  const vsEngland = school - england;
  const vsLA = school - la;

  // Determine performance level and styling
  const getPerformanceInfo = () => {
    if (school >= la) {
      return {
        level: 'Above Local Authority',
        status: 'Excellent',
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        icon: '🟢'
      };
    }
    if (school >= england) {
      return {
        level: 'Above England Average',
        status: 'Good',
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        icon: '🟡'
      };
    }
    return {
      level: 'Below England Average',
      status: 'Needs Improvement',
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      icon: '🔴'
    };
  };

  const performance = getPerformanceInfo();

  return (
    <div className="flex justify-center mb-4">
      <div className="w-full max-w-xs">
        {showLabels && (
          <div className="text-sm font-semibold text-gray-700 mb-3 text-center">{title}</div>
        )}
        
        {/* Main Performance Card */}
        <div className={`p-6 rounded-lg shadow-lg border ${performance.bgColor} ${performance.borderColor} mx-auto`}>
          <div className="text-center">
            {/* School Score */}
            <div className={`text-3xl font-bold ${performance.textColor} mb-2`}>
              {school}%
            </div>
            
            {/* Status */}
            <div className={`text-base font-semibold ${performance.textColor} mb-4`}>
              {performance.icon} {performance.status}
            </div>
            
            {/* Comparison Text */}
            <div className="text-center space-y-2 mb-4">
              <div className={`text-sm font-medium ${vsEngland >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(vsEngland).toFixed(1)}% {vsEngland >= 0 ? 'better than' : 'worse than'} England Average
              </div>
              <div className={`text-sm font-medium ${vsLA >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(vsLA).toFixed(1)}% {vsLA >= 0 ? 'better than' : 'worse than'} LA
              </div>
            </div>
            
            {/* Reference Values */}
            <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
              England: {england}% • LA: {la}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceGauge;
