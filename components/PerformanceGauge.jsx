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
    <div className="w-full mb-2">
      {showLabels && (
        <div className="text-xs font-semibold text-gray-700 mb-1 text-center">{title}</div>
      )}
      
      {/* Main Performance Card */}
      <div className={`p-2 rounded border ${performance.bgColor} ${performance.borderColor}`}>
        <div className="text-center">
          {/* School Score */}
          <div className={`text-xl font-bold ${performance.textColor} mb-1`}>
            {school}%
          </div>
          
          {/* Status */}
          <div className={`text-sm font-semibold ${performance.textColor} mb-1`}>
            {performance.icon} {performance.status}
          </div>
          
          {/* Comparison Bars */}
          <div className="space-y-1">
            {/* vs England */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">vs England:</span>
              <div className="flex items-center space-x-1">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${vsEngland >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(Math.abs(vsEngland), 20) * 5}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold ${vsEngland >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {vsEngland >= 0 ? '+' : ''}{vsEngland.toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* vs LA */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">vs LA:</span>
              <div className="flex items-center space-x-1">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${vsLA >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(Math.abs(vsLA), 20) * 5}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold ${vsLA >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {vsLA >= 0 ? '+' : ''}{vsLA.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reference Values */}
      <div className="mt-1 text-center text-xs text-gray-500">
        England: {england}% • LA: {la}%
      </div>
    </div>
  );
};

export default PerformanceGauge;
