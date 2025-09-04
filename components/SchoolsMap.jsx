"use client";

import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { createClient } from '@supabase/supabase-js';

import 'leaflet/dist/leaflet.css';

// Supabase configuration - using environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("Failed to create Supabase client:", e.message);
  }
} else {
  console.error("Supabase environment variables are not set. Please check your .env.local file.");
}

/**
 * @typedef {object} School
 * @property {string} urn
 * @property {string} name
 * @property {number} lat
 * @property {number} lon
 */

// A component that fetches data based on map events
const MapEventUpdater = ({ onBoundsChange }) => {
  const map = useMap();

  useEffect(() => {
    // Initial fetch on mount
    onBoundsChange(map.getBounds(), map.getZoom());

    const handleMoveEnd = () => onBoundsChange(map.getBounds(), map.getZoom());
    const handleZoomEnd = () => onBoundsChange(map.getBounds(), map.getZoom());

    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleZoomEnd);

    // Cleanup function to remove event listeners
    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, onBoundsChange]);

  return null;
};

// Tab Component
const Tab = ({ icon, title, summary, isExpanded, onClick }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="text-gray-600 text-xl">{icon}</div>
          <div className="text-left">
            <h3 className="font-medium text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600">{summary}</p>
          </div>
        </div>
        <div className="text-gray-400 text-xl transition-transform duration-200">
          {isExpanded ? '−' : '+'}
        </div>
      </button>
      
      {isExpanded && (
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="space-y-3">
            {/* Tab content will be rendered here */}
            <div className="text-gray-600">
              {title === 'Details' && <DetailsContent />}
              {title === 'Pupils' && <PupilsContent />}
              {title === 'Ofsted Inspections' && <OfstedContent />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Details Tab Content
const DetailsContent = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-3 rounded border">
        <span className="text-sm font-medium text-gray-600">School Type:</span>
        <p className="text-gray-800">Primary School</p>
      </div>
      <div className="bg-white p-3 rounded border">
        <span className="text-sm font-medium text-gray-600">Phase:</span>
        <p className="text-gray-800">Primary</p>
      </div>
      <div className="bg-white p-3 rounded border">
        <span className="text-sm font-medium text-gray-600">Local Authority:</span>
        <p className="text-gray-800">Hackney</p>
      </div>
      <div className="bg-white p-3 rounded border">
        <span className="text-sm font-medium text-gray-600">URN:</span>
        <p className="text-gray-800">126599</p>
      </div>
    </div>
  </div>
);

// Pupils Tab Content
const PupilsContent = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-3 rounded border">
        <span className="text-sm font-medium text-gray-600">Total Pupils:</span>
        <p className="text-gray-800 font-semibold">245</p>
      </div>
      <div className="bg-white p-3 rounded border">
        <span className="text-sm font-medium text-gray-600">Gender:</span>
        <p className="text-gray-800">Mixed</p>
      </div>
      <div className="bg-white p-3 rounded border">
        <span className="text-sm font-medium text-gray-600">Age Range:</span>
        <p className="text-gray-800">3-11 years</p>
      </div>
      <div className="bg-white p-3 rounded border">
        <span className="text-sm font-medium text-gray-600">Capacity:</span>
        <p className="text-gray-800">300</p>
      </div>
    </div>
  </div>
);

// Ofsted Inspections Tab Content
const OfstedContent = () => (
  <div className="space-y-4">
    <div className="bg-white p-4 rounded border">
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-gray-800">Latest Inspection</h5>
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">Good</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Inspection Date:</span>
          <span className="text-gray-800">15 March 2023</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Overall Rating:</span>
          <span className="text-gray-800 font-medium">Good</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Previous Rating:</span>
          <span className="text-gray-800">Good</span>
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <div className="bg-white p-2 rounded border text-center">
        <div className="text-xs text-gray-600">Quality of Education</div>
        <div className="font-medium text-green-600">Good</div>
      </div>
      <div className="bg-white p-2 rounded border text-center">
        <div className="text-xs text-gray-600">Behaviour & Attitudes</div>
        <div className="font-medium text-green-600">Good</div>
      </div>
      <div className="bg-white p-2 rounded border text-center">
        <div className="text-xs text-gray-600">Personal Development</div>
        <div className="font-medium text-green-600">Good</div>
      </div>
      <div className="bg-white p-2 rounded border text-center">
        <div className="text-xs text-gray-600">Leadership & Management</div>
        <div className="font-medium text-green-600">Good</div>
      </div>
    </div>
  </div>
);

// School Sidebar Component
const SchoolSidebar = ({ school, isOpen, onClose }) => {
  const [expandedTab, setExpandedTab] = useState(null);

  if (!isOpen || !school) return null;

  const tabs = [
    {
      id: 'details',
      icon: '📋',
      title: 'Details',
      summary: 'Primary School'
    },
    {
      id: 'pupils',
      icon: '👥',
      title: 'Pupils',
      summary: 'Mixed, 245 Pupils'
    },
    {
      id: 'ofsted',
      icon: '🔍',
      title: 'Ofsted Inspections',
      summary: 'Good (Mar 2023)'
    }
  ];

  const handleTabClick = (tabId) => {
    setExpandedTab(expandedTab === tabId ? null : tabId);
  };

  return (
    <>
      {/* Mobile Overlay Background */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[999] md:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-14 md:top-16 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] w-full md:w-96 bg-white shadow-xl border-l border-gray-200 z-[1000] overflow-y-auto md:absolute">
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 pr-4">{school.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl flex-shrink-0"
            >
              ×
            </button>
          </div>
          
          {/* Basic Info */}
          <div className="space-y-3 mb-6">
            <div>
              <span className="text-sm font-medium text-gray-600">URN:</span>
              <span className="ml-2 text-gray-800">{school.urn}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Location:</span>
              <span className="ml-2 text-gray-800 text-xs md:text-sm">{school.lat.toFixed(4)}, {school.lon.toFixed(4)}</span>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="space-y-2">
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                icon={tab.icon}
                title={tab.title}
                summary={tab.summary}
                isExpanded={expandedTab === tab.id}
                onClick={() => handleTabClick(tab.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// Version: 2024-09-03T22:30:00Z - Force cache busting
export default function SchoolsMap() {
  /** @type {[School[], React.Dispatch<React.SetStateAction<School[]>>]} */
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tooManySchools, setTooManySchools] = useState(false);
  
  // New state for sidebar
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fix for default Leaflet marker icons by referencing them from a CDN.
  // This is necessary because the default icon image assets are not included in the bundle.
  useEffect(() => {
    if (L.Icon) {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  // Memoize fetchSchools to prevent unnecessary re-creations
  const fetchSchools = useCallback(async (mapBounds, zoomLevel) => {
    if (!supabase || !mapBounds) {
      console.log("Supabase client is not initialized.");
      return;
    }

    setLoading(true);

    // Simple logic: if more than 500 schools in view, show "Zoom in" message
    const schoolLimit = 500;

    const { data, error } = await supabase
      .from("schools")
      .select("urn,name,lat,lon")
      .gte('lat', mapBounds.getSouth())
      .lte('lat', mapBounds.getNorth())
      .gte('lon', mapBounds.getWest())
      .lte('lon', mapBounds.getEast())
      .limit(schoolLimit + 1); // Add 1 to check if we exceed the limit

    setLoading(false);

    if (error) {
      console.error("Supabase query error:", error.message);
      return;
    }

    if (data && data.length > schoolLimit) {
      setSchools([]);
      setTooManySchools(true);
      console.log(`Too many schools to display (${data.length}). Please zoom in.`);
    } else {
      setSchools(data || []);
      setTooManySchools(false);
      console.log(`Fetched schools: ${data?.length} (zoom: ${zoomLevel})`);
    }
  }, []);

  // Handle school marker click
  const handleSchoolClick = (school) => {
    console.log('School clicked:', school.name);
    setSelectedSchool(school);
    setSidebarOpen(true);
  };

  // Handle sidebar close
  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setSelectedSchool(null);
  };

  return (
    <div className="relative w-full h-full">
      {/* Sidebar - Overlay */}
      <SchoolSidebar 
        school={selectedSchool} 
        isOpen={sidebarOpen} 
        onClose={handleSidebarClose}
      />
      
      {/* Map Container - Full Screen */}
      <div className="relative w-full h-full">
        {tooManySchools && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-gray-800 bg-opacity-75 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
            Zoom in to see schools
          </div>
        )}
        
        {loading && (
          <div className="absolute top-16 left-4 z-[1000] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            Loading schools...
          </div>
        )}

        <MapContainer
          center={[52.5, -1.5]}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {schools.map((school) => (
            <Marker
              key={school.urn}
              position={[school.lat, school.lon]}
              eventHandlers={{
                click: () => handleSchoolClick(school)
              }}
            />
          ))}

          <MapEventUpdater onBoundsChange={fetchSchools} />
        </MapContainer>
      </div>
    </div>
  );
}
