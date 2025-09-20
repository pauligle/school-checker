"use client";

import React from 'react';

const MapLegend = ({ position = 'bottom-right', className = '' }) => {
  const legendItems = [
    { color: '#00C851', label: 'Outstanding', rating: '1' },
    { color: '#FFC107', label: 'Good', rating: '2' },
    { color: '#F44336', label: 'Requires Improvement', rating: '3' },
    { color: '#DC2626', label: 'Inadequate', rating: '4' },
    { color: '#9E9E9E', label: 'Not Inspected', rating: 'N/A' }
  ];

  // Position classes based on prop
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4', 
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  return (
    <div className={`absolute ${positionClasses[position]} z-[1300] ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1 sm:p-3 max-w-[120px] sm:max-w-none">
        <h4 className="text-[10px] sm:text-xs font-semibold text-gray-900 mb-1 sm:mb-2">Ofsted Ratings</h4>
        <div className="space-y-0.5 sm:space-y-1">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-1 sm:space-x-2">
              <div 
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-[9px] sm:text-xs text-gray-700 leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-gray-100">
          <p className="text-[8px] sm:text-xs text-gray-500 leading-tight">
            Based on latest Ofsted inspection
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;

