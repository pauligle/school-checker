"use client";
// Updated: 2024-12-19 15:30:00

import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { createClient } from '@supabase/supabase-js';
import SchoolDetailsCard from './SchoolDetailsCard';

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

// Main SchoolsMap Component
export default function SchoolsMap() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedSchoolInspections, setSelectedSchoolInspections] = useState([]);
  const [cardOpen, setCardOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [tooManySchools, setTooManySchools] = useState(false);
  
  // Geolocation states
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [showLocationSuccess, setShowLocationSuccess] = useState(false);
  const [showLocationError, setShowLocationError] = useState(false);
  
  // Filter states
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'nursery', 'primary', 'secondary'
  const [filteredSchools, setFilteredSchools] = useState([]);
  
  // Ofsted rating states
  const [schoolRatings, setSchoolRatings] = useState({}); // URN -> rating
  
  // Map reference for programmatic control
  const mapRef = useRef(null);
  
  // Geolocation functions
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);
    setLocationPermissionDenied(false);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        
        setUserLocation(location);
        setLocationLoading(false);
        setShowLocationSuccess(true);
        
        // Center map on user location
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 11); // Lower zoom to show more schools
          // Trigger school fetching after centering
          setTimeout(() => {
            const bounds = mapRef.current.getBounds();
            const zoom = mapRef.current.getZoom();
            console.log('Triggering school fetch after location centering:', { bounds, zoom });
            fetchSchools(bounds, zoom);
          }, 500); // Small delay to ensure map has finished centering
        }
        
        // Hide success message after 2 seconds
        setTimeout(() => {
          setShowLocationSuccess(false);
        }, 2000);
        
        console.log('User location detected:', location);
      },
      (error) => {
        setLocationLoading(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied by user.');
            setLocationPermissionDenied(true);
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred while retrieving location.');
            break;
        }
        
        setShowLocationError(true);
        
        // Hide error message after 2 seconds
        setTimeout(() => {
          setShowLocationError(false);
        }, 2000);
        
        console.error('Geolocation error:', error);
      },
      options
    );
  }, []);

  // Initialize map icons and load marker offsets
  useEffect(() => {
    // Fix for default markers in Leaflet with Next.js
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    
    // Initialize dynamic icon system
    window.ofstedIcons = { initialized: true };
    
    // Load marker offsets for overlapping schools
    fetch('/marker-offsets.json')
      .then(response => response.json())
      .then(data => {
        window.markerOffsets = data;
        console.log('Loaded marker offsets for', data.length, 'schools');
      })
      .catch(error => {
        console.warn('Could not load marker offsets:', error);
        window.markerOffsets = null;
      });
    
    // Try to get user's location automatically
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Memoize fetchSchools to prevent unnecessary re-creations
  const fetchSchools = useCallback(async (mapBounds, zoomLevel) => {
    console.log("fetchSchools called with:", { mapBounds, zoomLevel, supabase: !!supabase });
    if (!supabase || !mapBounds) {
      console.log("Supabase client is not initialized.");
      return;
    }

    setLoading(true);

    // Increased limits for better school visibility
    const schoolLimit = zoomLevel >= 12 ? 500 : zoomLevel >= 10 ? 300 : zoomLevel >= 8 ? 200 : 150;
    console.log('School limit for zoom', zoomLevel, ':', schoolLimit);

    const bounds = {
      south: mapBounds.getSouth(),
      north: mapBounds.getNorth(),
      west: mapBounds.getWest(),
      east: mapBounds.getEast()
    };
    console.log("Querying with bounds:", bounds, "limit:", schoolLimit);
    console.log("Bounds span - Lat:", bounds.north - bounds.south, "Lon:", bounds.east - bounds.west);

    try {
      // Add timeout to prevent hanging queries
      const queryPromise = supabase
      .from("schools")
        .select("urn,establishmentname,lat,lon,phaseofeducation__name_,statutorylowage,statutoryhighage,typeofestablishment__name_")
        .gte('lat', bounds.south)
        .lte('lat', bounds.north)
        .gte('lon', bounds.west)
        .lte('lon', bounds.east)
        .not('lat', 'is', null)
        .not('lon', 'is', null)
        .order('urn') // Add ordering for consistent results
      .limit(schoolLimit + 1); // Add 1 to check if we exceed the limit

      // Add 5 second timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

    setLoading(false);

    if (error) {
      if (error.message === 'Query timeout') {
        console.error("Query timed out - please zoom in more or try again");
      } else {
      console.error("Supabase query error:", error.message);
      }
      setSchools([]);
      setTooManySchools(false);
      return;
    }

    // Always show schools, even if we exceed the limit
    const allSchools = data || [];
    setSchools(allSchools);
    setTooManySchools(false);
    console.log(`Fetched schools: ${allSchools.length} (zoom: ${zoomLevel}, limit: ${schoolLimit})`);
    
    if (allSchools.length > schoolLimit) {
      console.log(`Warning: Showing ${allSchools.length} schools (exceeds limit of ${schoolLimit})`);
    }
    
    // Fetch Ofsted ratings for the schools
    fetchSchoolRatings(allSchools);
    } catch (err) {
      console.error("Error fetching schools:", err);
      setLoading(false);
      setSchools([]);
      setTooManySchools(false);
      
      // Show user-friendly message for timeout
      if (err.message === 'Query timeout') {
        console.log('Query timed out. Please try zooming in to a smaller area.');
        // You could also set a state to show a user-friendly message
        // setErrorMessage('Query timed out. Please zoom in to a smaller area.');
      }
    }
  }, []);

  // Filter schools based on active filter
  const filterSchools = useCallback((schoolsList) => {
    if (activeFilter === 'all') {
      return schoolsList;
    }
    
    return schoolsList.filter(school => {
      const phase = school.phaseofeducation__name_?.toLowerCase();
      const lowAge = school.statutorylowage;
      const highAge = school.statutoryhighage;
      
      // Check if school serves the requested age group
      const isAllThrough = (phase && phase.includes('all-through')) || 
                          (lowAge && highAge && lowAge >= 3 && highAge >= 16);
      
      const servesNursery = (phase && (phase.includes('nursery') || phase.includes('early years'))) || 
                           (lowAge && highAge && lowAge >= 3 && highAge <= 5) ||
                           (isAllThrough && lowAge >= 3 && highAge >= 16); // All-through schools with nursery
      
      const servesPrimary = (phase && phase.includes('primary')) || 
                           (lowAge && highAge && lowAge >= 3 && highAge <= 11) ||
                           (isAllThrough && lowAge >= 3 && highAge >= 16); // All-through schools
      
      const servesSecondary = (phase && phase.includes('secondary')) || 
                             (lowAge && highAge && lowAge >= 11 && highAge <= 16) ||
                             (isAllThrough && lowAge >= 3 && highAge >= 16); // All-through schools
      
      
      // Return true if school serves the requested age group
      switch (activeFilter) {
        case 'nursery':
          return servesNursery;
        case 'primary':
          return servesPrimary;
        case 'secondary':
          return servesSecondary;
        default:
          return false;
      }
    });
  }, [activeFilter]);

  // Apply filter when activeFilter changes
  useEffect(() => {
    const filtered = filterSchools(schools);
    setFilteredSchools(filtered);
    console.log(`Applied filter '${activeFilter}': ${filtered.length} schools`);
  }, [schools, filterSchools]);

  // Determine school phases (N, P, S, 6)
  const getSchoolPhases = (school) => {
    if (!school) return [];
    
    const phase = school.phaseofeducation__name_?.toLowerCase();
    const lowAge = school.statutorylowage;
    const highAge = school.statutoryhighage;
    const phases = [];
    
    // Check for Nursery (ages 3-5 or explicit nursery phase)
    const hasNursery = (phase && (phase.includes('nursery') || phase.includes('early years'))) || 
                      (lowAge && highAge && lowAge >= 3 && lowAge <= 5) ||
                      (phase && phase.includes('all-through') && lowAge && lowAge <= 5);
    if (hasNursery) phases.push('N');
    
    // Check for Primary (ages 4-11 or explicit primary phase)
    const hasPrimary = (phase && phase.includes('primary')) || 
                      (lowAge && highAge && lowAge >= 4 && highAge <= 11) ||
                      (phase && phase.includes('all-through'));
    if (hasPrimary) phases.push('P');
    
    // Check for Secondary (ages 11-16 or explicit secondary phase)
    const hasSecondary = (phase && phase.includes('secondary')) || 
                        (lowAge && highAge && lowAge >= 11 && highAge <= 16) ||
                        (phase && phase.includes('all-through'));
    if (hasSecondary) phases.push('S');
    
    // Check for Sixth Form (ages 16-18 or explicit sixth form phase)
    const hasSixthForm = (phase && (phase.includes('sixth') || phase.includes('16-18'))) || 
                        (lowAge && highAge && lowAge >= 16 && highAge <= 18);
    if (hasSixthForm) phases.push('6');
    
    return phases;
  };

  // Generate SVG icon for phase combination with inspection color
  const generatePhaseIcon = (phases, rating, isIndependent = false) => {
    const colors = {
      1: '#00C851', // Green - Outstanding
      2: '#FFC107', // Yellow - Good  
      3: '#FF9800', // Orange - Requires Improvement
      4: '#F44336', // Red - Inadequate
      unknown: '#9E9E9E' // Grey - Unknown
    };
    
    // Use blue for independent schools, otherwise use inspection rating color
    const color = isIndependent ? '#3B82F6' : (colors[rating] || colors.unknown);
    const boxSize = 16;
    
    if (phases.length === 0) {
      // No phases detected - use unknown icon
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="${boxSize}" height="${boxSize}" viewBox="0 0 ${boxSize} ${boxSize}" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="${boxSize-2}" height="${boxSize-2}" fill="${color}" stroke="black" stroke-width="2"/>
          <text x="${boxSize/2}" y="${boxSize/2 + 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="black">?</text>
        </svg>
      `)}`;
    }
    
    if (phases.length === 1) {
      // Single phase - one square
      const phase = phases[0];
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="${boxSize}" height="${boxSize}" viewBox="0 0 ${boxSize} ${boxSize}" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="${boxSize-2}" height="${boxSize-2}" fill="${color}" stroke="black" stroke-width="2"/>
          <text x="${boxSize/2}" y="${boxSize/2 + 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="black">${phase}</text>
        </svg>
      `)}`;
    }
    
    if (phases.length === 2) {
      // Two phases - two squares stacked vertically (S at top, N at bottom)
      const [phase1, phase2] = phases;
      const totalHeight = boxSize * 2;
      // Sort phases: S first, then P, then N
      const sortedPhases = phases.sort((a, b) => {
        const order = { 'S': 0, 'P': 1, 'N': 2, '6': 3 };
        return order[a] - order[b];
      });
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="${boxSize}" height="${totalHeight}" viewBox="0 0 ${boxSize} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="${boxSize-2}" height="${boxSize-2}" fill="${color}" stroke="black" stroke-width="2"/>
          <rect x="1" y="${boxSize}" width="${boxSize-2}" height="${boxSize-2}" fill="${color}" stroke="black" stroke-width="2"/>
          <text x="${boxSize/2}" y="${boxSize/2 + 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="black">${sortedPhases[0]}</text>
          <text x="${boxSize/2}" y="${boxSize + boxSize/2 + 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="black">${sortedPhases[1]}</text>
        </svg>
      `)}`;
    }
    
    if (phases.length === 3) {
      // Three phases - three squares stacked vertically (S at top, P in middle, N at bottom)
      const [phase1, phase2, phase3] = phases;
      const totalHeight = boxSize * 3;
      // Sort phases: S first, then P, then N
      const sortedPhases = phases.sort((a, b) => {
        const order = { 'S': 0, 'P': 1, 'N': 2, '6': 3 };
        return order[a] - order[b];
      });
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="${boxSize}" height="${totalHeight}" viewBox="0 0 ${boxSize} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="${boxSize-2}" height="${boxSize-2}" fill="${color}" stroke="black" stroke-width="2"/>
          <rect x="1" y="${boxSize}" width="${boxSize-2}" height="${boxSize-2}" fill="${color}" stroke="black" stroke-width="2"/>
          <rect x="1" y="${boxSize * 2}" width="${boxSize-2}" height="${boxSize-2}" fill="${color}" stroke="black" stroke-width="2"/>
          <text x="${boxSize/2}" y="${boxSize/2 + 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="black">${sortedPhases[0]}</text>
          <text x="${boxSize/2}" y="${boxSize + boxSize/2 + 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="black">${sortedPhases[1]}</text>
          <text x="${boxSize/2}" y="${boxSize * 2 + boxSize/2 + 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="black">${sortedPhases[2]}</text>
        </svg>
      `)}`;
    }
    
    if (phases.length === 4) {
      // Four phases - show as "A" for All-through
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="${boxSize}" height="${boxSize}" viewBox="0 0 ${boxSize} ${boxSize}" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="${boxSize-2}" height="${boxSize-2}" fill="${color}" stroke="black" stroke-width="2"/>
          <text x="${boxSize/2}" y="${boxSize/2 + 2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="black">A</text>
        </svg>
      `)}`;
    }
  };

  // Get icon for school with phase and inspection rating
  const getOfstedIcon = (urn, school) => {
    // If icons haven't been initialized yet, return undefined to use default icon
    if (!window.ofstedIcons || !window.ofstedIcons.initialized) {
      console.log('Ofsted icons not ready yet for URN:', urn);
      return undefined;
    }
    
    const phases = getSchoolPhases(school);
    const rating = schoolRatings[urn] || 'unknown';
    
    // Check if school is independent
    const establishmentType = school.typeofestablishment__name_;
    const isIndependent = establishmentType && 
      (establishmentType.toLowerCase().includes('independent') || 
       establishmentType.toLowerCase().includes('private'));
    
    console.log(`School ${urn}: phases=${phases.join(',')}, rating=${rating}, independent=${isIndependent}`);
    
    // Calculate dynamic size based on number of phases (vertical stacking)
    const boxSize = 16;
    let iconWidth, iconHeight;
    
    if (phases.length === 0 || phases.length === 1 || phases.length === 4) {
      iconWidth = boxSize;
      iconHeight = boxSize;
    } else if (phases.length === 2) {
      iconWidth = boxSize;
      iconHeight = boxSize * 2;
    } else if (phases.length === 3) {
      iconWidth = boxSize;
      iconHeight = boxSize * 3;
    }
    
    // Generate dynamic icon based on phases, rating, and independence
    const iconUrl = generatePhaseIcon(phases, rating, isIndependent);
    
    return new L.Icon({
      iconUrl: iconUrl,
      iconSize: [iconWidth, iconHeight],
      iconAnchor: [iconWidth / 2, iconHeight / 2],
      popupAnchor: [0, -iconHeight / 2]
    });
  };

  // Calculate School Checker Inspection Rating (same logic as SchoolInspectionCard)
  const calculateSchoolCheckerRating = (inspection) => {
    if (!inspection) return null;

    // If we have an official Ofsted overall rating (pre-September 2024), use that
    if (inspection.outcome && inspection.outcome >= 1 && inspection.outcome <= 4) {
      return inspection.outcome;
    }

    // Calculate rating from category judgments (post-September 2024)
    const weights = {
      quality_of_education: 0.40,      // Most important
      effectiveness_of_leadership: 0.30, // Leadership and management
      behaviour_and_attitudes: 0.20,    // Behaviour and attitudes
      personal_development: 0.10        // Personal development
    };

    let weightedScore = 0;
    let totalWeight = 0;

    Object.keys(weights).forEach(category => {
      const rating = inspection[category];
      if (rating && rating >= 1 && rating <= 4) {
        // Invert rating so 1=Outstanding=4 points, 4=Inadequate=1 point
        weightedScore += (5 - rating) * weights[category];
        totalWeight += weights[category];
      }
    });

    if (totalWeight === 0) return null;

    const averageScore = weightedScore / totalWeight;

    // Convert to rating
    if (averageScore >= 3.5) return 1; // Outstanding
    else if (averageScore >= 2.5) return 2; // Good  
    else if (averageScore >= 1.5) return 3; // Requires improvement
    else return 4; // Inadequate
  };

  // Fetch Ofsted ratings for schools
  const fetchSchoolRatings = useCallback(async (schoolsList) => {
    if (!supabase || schoolsList.length === 0) return;

    try {
      const urns = schoolsList.map(school => school.urn);
      
      // Fetch latest inspection for each school
      const { data: inspections, error } = await supabase
        .from('inspections')
        .select('urn, outcome, quality_of_education, effectiveness_of_leadership, behaviour_and_attitudes, personal_development')
        .in('urn', urns)
        .order('inspection_date', { ascending: false });

      if (error) {
        console.error('Error fetching inspections:', error);
        return;
      }

      // Group inspections by URN and get the latest one for each school
      const latestInspections = {};
      inspections?.forEach(inspection => {
        if (!latestInspections[inspection.urn]) {
          latestInspections[inspection.urn] = inspection;
        }
      });

      // Calculate ratings for each school
      const ratings = {};
      schoolsList.forEach(school => {
        const inspection = latestInspections[school.urn];
        if (inspection) {
          const rating = calculateSchoolCheckerRating(inspection);
          if (rating) {
            ratings[school.urn] = rating;
          }
        }
      });

      setSchoolRatings(ratings);
      console.log(`Calculated ratings for ${Object.keys(ratings).length} schools`);
    } catch (error) {
      console.error('Error calculating school ratings:', error);
    }
  }, [supabase]);

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    console.log(`Filter changed to: ${filter}`);
  };

  // Handle school marker click
  const handleSchoolClick = async (school) => {
    console.log('School clicked:', school.establishmentname);
    
    // Fetch full school data and inspection data
    if (supabase) {
      try {
        // Fetch school data
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('*')
          .eq('urn', school.urn)
          .single();
        
        if (schoolError) {
          console.error('Error fetching school details:', schoolError);
          return;
        }
        
        // Fetch inspection data
        const { data: inspectionData, error: inspectionError } = await supabase
          .from('inspections')
          .select('*')
          .eq('urn', school.urn)
          .order('inspection_date', { ascending: false });
        
        if (inspectionError) {
          console.error('Error fetching inspection data:', inspectionError);
        }
        
        if (schoolData) {
          setSelectedSchool(schoolData);
          setSelectedSchoolInspections(inspectionData || []);
          setCardOpen(true);
        }
      } catch (err) {
        console.error('Error in handleSchoolClick:', err);
      }
    }
  };

  // Handle card close
  const handleCardClose = () => {
    setCardOpen(false);
    setSelectedSchool(null);
    setSelectedSchoolInspections([]);
  };

  return (
    <div className="relative w-full h-full">
      {/* School Details Card - Optimized Component */}
      {cardOpen && selectedSchool && (
        <SchoolDetailsCard
          selectedSchool={selectedSchool}
          selectedSchoolInspections={selectedSchoolInspections}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={handleCardClose}
        />
      )}
      
      {/* Filter Buttons */}
      <div className="absolute top-4 left-32 z-[1000] flex flex-wrap gap-2 max-w-4xl">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeFilter === 'all'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
          }`}
        >
          All Schools
        </button>
        <button
          onClick={() => handleFilterChange('nursery')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeFilter === 'nursery'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
          }`}
        >
          Nurseries
        </button>
        <button
          onClick={() => handleFilterChange('primary')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeFilter === 'primary'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
          }`}
        >
          Primary Schools
        </button>
        <button
          onClick={() => handleFilterChange('secondary')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeFilter === 'secondary'
              ? 'bg-orange-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
          }`}
        >
          Secondary Schools
        </button>
      </div>
      
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

        {/* Location Status Messages */}
        {locationLoading && (
          <div className="absolute top-16 right-4 z-[1000] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Finding your location...</span>
            </div>
          </div>
        )}

        {showLocationError && (
          <div className="absolute top-16 right-4 z-[1000] bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg max-w-xs">
            <div className="flex items-start space-x-2">
              <span className="text-red-200">⚠️</span>
              <div>
                <p className="font-semibold">Location Error</p>
                <p className="text-sm">{locationError}</p>
                {locationPermissionDenied && (
                  <button
                    onClick={getCurrentLocation}
                    className="mt-2 text-sm underline hover:no-underline"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showLocationSuccess && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[1000] bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <span>✅</span>
              <span>Location found! Showing nearby schools</span>
            </div>
          </div>
        )}


        <MapContainer
          ref={mapRef}
          center={[52.5, -1.5]}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {filteredSchools.map((school, index) => {
            // Use calculated offsets from marker-offsets.json if available
            let offsetLat = school.lat;
            let offsetLon = school.lon;
            
            // Try to find calculated offset for this school
            if (window.markerOffsets) {
              const offset = window.markerOffsets.find(offset => offset.urn === school.urn);
              if (offset) {
                offsetLat = offset.offset_lat;
                offsetLon = offset.offset_lon;
                // Debug: log when offsets are applied
                if (offset.group_size > 1) {
                  console.log(`Applied offset for URN ${school.urn} (${school.establishmentname}): group ${offset.group_id}, size ${offset.group_size}`);
                }
              }
            }
            
            const icon = getOfstedIcon(school.urn, school);
            
            return (
              <Marker
                key={school.urn}
                position={[offsetLat, offsetLon]}
                {...(icon && { icon })}
                eventHandlers={{
                  click: () => handleSchoolClick(school)
                }}
              />
            );
          })}

          <MapEventUpdater onBoundsChange={fetchSchools} />
        </MapContainer>
      </div>
    </div>
  );
}