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
const MapEventUpdater = ({ onBoundsChange, city }) => {
  const map = useMap();

  useEffect(() => {
    // Only do initial fetch if no city is specified (for home page)
    if (!city) {
      // Wait for map to be fully initialized before initial fetch
      const initializeMap = () => {
        // Small delay to ensure map is fully rendered
        setTimeout(() => {
          onBoundsChange(map.getBounds(), map.getZoom());
        }, 100);
      };

      // Initial fetch on mount with delay
      initializeMap();
    }

    // Listen to map events for both home page and city pages
    // This allows users to explore and see new schools when moving the map
    const handleMoveEnd = () => onBoundsChange(map.getBounds(), map.getZoom());
    const handleZoomEnd = () => onBoundsChange(map.getBounds(), map.getZoom());

    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleZoomEnd);

    // Cleanup function to remove event listeners
    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, onBoundsChange, city]);

  return null;
};

// City coordinates for focusing maps
const CITY_COORDINATES = {
  london: { lat: 51.5074, lng: -0.1278, zoom: 10 },
  manchester: { lat: 53.4808, lng: -2.2426, zoom: 11 },
  leeds: { lat: 53.8008, lng: -1.5491, zoom: 11 },
  birmingham: { lat: 52.4862, lng: -1.8904, zoom: 11 },
  liverpool: { lat: 53.4084, lng: -2.9916, zoom: 11 }
};

// Main SchoolsMap Component
export default function SchoolsMap({ city = null, center = null, zoom = null, selectedSchool: propSelectedSchool = null }) {
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
  
  // Auto-focus on selected school from URL parameter
  useEffect(() => {
    if (propSelectedSchool && !city && !center) {
      console.log('Auto-focusing on school:', propSelectedSchool);
      
      // Fetch school data and auto-open card
      const fetchAndSelectSchool = async () => {
        if (!supabase) {
          console.error('Supabase not available');
          return;
        }
        
        try {
          // Fetch school data
          const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .select('*')
            .eq('urn', propSelectedSchool)
            .single();
          
          if (schoolError || !schoolData) {
            console.error('Error fetching selected school:', schoolError);
            return;
          }
          
          console.log('Fetched school data:', schoolData.establishmentname);
          
          // Set the selected school and open card
          setSelectedSchool(schoolData);
          setCardOpen(true);
          console.log('Set selected school and opened card');
          
          // Center map on school with a delay to ensure map is ready
          setTimeout(() => {
            if (mapRef.current && schoolData.lat && schoolData.lon) {
              console.log('Centering map on school:', schoolData.lat, schoolData.lon);
              mapRef.current.setView([schoolData.lat, schoolData.lon], 15);
            } else {
              console.log('Map ref not ready or coordinates missing');
            }
          }, 1000);
          
          // Fetch inspection data
          const { data: inspectionData } = await supabase
            .from('inspections')
            .select('*')
            .eq('urn', propSelectedSchool)
            .order('inspection_date', { ascending: false });
          
          setSelectedSchoolInspections(inspectionData || []);
          console.log('Fetched inspection data:', inspectionData?.length || 0, 'inspections');
          
        } catch (error) {
          console.error('Error fetching selected school data:', error);
        }
      };
      
      fetchAndSelectSchool();
    }
  }, [propSelectedSchool, city, center]);
  
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
          // Only trigger school fetching for home page (not city pages)
          if (!city) {
            setTimeout(() => {
              const bounds = mapRef.current.getBounds();
              const zoom = mapRef.current.getZoom();
              console.log('Triggering school fetch after location centering:', { bounds, zoom });
              fetchSchools(bounds, zoom);
            }, 500); // Small delay to ensure map has finished centering
          }
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
    
    // Try to get user's location automatically only if no city is specified and no specific center/zoom is provided
    if (!city && !center) {
      getCurrentLocation();
    }
  }, [getCurrentLocation, city, center]);

  // Memoize fetchSchools to prevent unnecessary re-creations
  const fetchSchools = useCallback(async (mapBounds, zoomLevel) => {
    console.log("fetchSchools called with:", { mapBounds, zoomLevel, supabase: !!supabase });
    if (!supabase || !mapBounds) {
      console.log("Supabase client is not initialized.");
      return;
    }

    setLoading(true);

    // Increased limits for better school visibility, especially for city pages
    const schoolLimit = zoomLevel >= 12 ? 800 : zoomLevel >= 10 ? 600 : zoomLevel >= 8 ? 400 : 300;
    console.log('School limit for zoom', zoomLevel, ':', schoolLimit);

    // Handle both Leaflet bounds object and plain object
    const bounds = mapBounds.getSouth ? {
      south: mapBounds.getSouth(),
      north: mapBounds.getNorth(),
      west: mapBounds.getWest(),
      east: mapBounds.getEast()
    } : mapBounds; // If it's already a plain object, use it directly
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
    
    // For city pages, add schools to existing ones instead of replacing
    if (city) {
      setSchools(prevSchools => {
        // Create a map of existing schools by URN for quick lookup
        const existingSchoolsMap = new Map(prevSchools.map(school => [school.urn, school]));
        
        // Add new schools that aren't already in the map
        const newSchools = allSchools.filter(school => !existingSchoolsMap.has(school.urn));
        
        console.log(`City page: Adding ${newSchools.length} new schools to existing ${prevSchools.length}`);
        return [...prevSchools, ...newSchools];
      });
    } else {
      // For home page, replace schools as before
      setSchools(allSchools);
    }
    
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

  // Generate simple circle icon with inspection color
  const generatePhaseIcon = (phases, rating, isIndependent = false, isSelected = false) => {
    const colors = {
      1: '#00C851', // Green - Outstanding
      2: '#FFC107', // Yellow - Good  
      3: '#FF9800', // Orange - Requires Improvement
      4: '#F44336', // Red - Inadequate
      unknown: '#9E9E9E' // Grey - Unknown
    };
    
    // Use blue for independent schools, otherwise use inspection rating color
    const color = isIndependent ? '#3B82F6' : (colors[rating] || colors.unknown);
    
    // Simple circle - consistent size
    const size = 24;
    const radius = size / 2;
    
    // If this is the selected school, add a highlighter circle overlay
    if (isSelected) {
      const highlighterSize = 60; // Size of the highlighter circle
      const centerX = highlighterSize / 2;
      const centerY = highlighterSize / 2;
      const pinSize = 24; // Size of the school pin
      const pinRadius = pinSize / 2;
      
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="${highlighterSize}" height="${highlighterSize}" viewBox="0 0 ${highlighterSize} ${highlighterSize}" xmlns="http://www.w3.org/2000/svg">
          <!-- Highlighter circle background -->
          <circle cx="${centerX}" cy="${centerY}" r="${centerX - 2}" fill="url(#highlighter-gradient)" stroke="#FFD700" stroke-width="3" stroke-dasharray="4,4" opacity="0.8"/>
          <!-- School pin in the center -->
          <circle cx="${centerX}" cy="${centerY}" r="${pinRadius - 1}" fill="${color}" stroke="black" stroke-width="1"/>
          <!-- Gradient definition for highlighter effect -->
          <defs>
            <radialGradient id="highlighter-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style="stop-color:#FFFF00;stop-opacity:0.3" />
              <stop offset="70%" style="stop-color:#FFD700;stop-opacity:0.6" />
              <stop offset="100%" style="stop-color:#FFA500;stop-opacity:0.2" />
            </radialGradient>
          </defs>
        </svg>
      `)}`;
    }
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${radius}" cy="${radius}" r="${radius - 1}" fill="${color}" stroke="black" stroke-width="1"/>
      </svg>
    `)}`;
  };

  // Get icon for school with phase and inspection rating
  const getOfstedIcon = (urn, school, isSelected = false) => {
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
    
    console.log(`School ${urn}: phases=${phases.join(',')}, rating=${rating}, independent=${isIndependent}, selected=${isSelected}`);
    
    // Calculate dynamic size based on number of phases (vertical stacking)
    const iconSize = 24;
    let iconWidth, iconHeight;
    
    if (phases.length === 0 || phases.length === 1 || phases.length === 4) {
      iconWidth = isSelected ? 60 : iconSize;
      iconHeight = isSelected ? 60 : iconSize;
    } else if (phases.length === 2) {
      iconWidth = isSelected ? 60 : iconSize;
      iconHeight = isSelected ? 60 : iconSize * 2;
    } else if (phases.length === 3) {
      iconWidth = isSelected ? 60 : iconSize;
      iconHeight = isSelected ? 60 : iconSize * 3;
    }
    
    // Generate dynamic icon based on phases, rating, independence, and selection
    const iconUrl = generatePhaseIcon(phases, rating, isIndependent, isSelected);
    
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

  // City-specific initialization effect
  useEffect(() => {
    if (city && CITY_COORDINATES[city]) {
      console.log(`Initializing city-specific schools for: ${city}`);
      
      // Fetch schools directly for this city
      const fetchCitySchools = async () => {
        if (!supabase || !CITY_COORDINATES[city]) {
          console.log('Cannot fetch schools for city:', city);
          return;
        }

        const cityCoords = CITY_COORDINATES[city];
        console.log(`Fetching schools directly for ${city}:`, cityCoords);

        setLoading(true);

        try {
          // Use a generous buffer around the city
          const buffer = 0.15; // ~17km buffer
          const bounds = {
            south: cityCoords.lat - buffer,
            north: cityCoords.lat + buffer,
            west: cityCoords.lng - buffer,
            east: cityCoords.lng + buffer
          };

          console.log(`Direct city query bounds for ${city}:`, bounds);

          const { data, error } = await supabase
            .from("schools")
            .select("urn,establishmentname,lat,lon,phaseofeducation__name_,statutorylowage,statutoryhighage,typeofestablishment__name_")
            .gte('lat', bounds.south)
            .lte('lat', bounds.north)
            .gte('lon', bounds.west)
            .lte('lon', bounds.east)
            .not('lat', 'is', null)
            .not('lon', 'is', null)
            .order('urn')
            .limit(1000);

          setLoading(false);

          if (error) {
            console.error(`Error fetching schools for ${city}:`, error);
            setSchools([]);
            return;
          }

          const allSchools = data || [];
          setSchools(allSchools);
          setTooManySchools(false);
          
          console.log(`Direct city fetch for ${city}: ${allSchools.length} schools found`);
          
          // Fetch Ofsted ratings for the schools
          fetchSchoolRatings(allSchools);
          
        } catch (err) {
          console.error(`Error in direct city fetch for ${city}:`, err);
          setLoading(false);
          setSchools([]);
        }
      };
      
      fetchCitySchools();
    }
  }, [city, supabase, fetchSchoolRatings]);

  // Effect to handle propSelectedSchool changes
  useEffect(() => {
    if (propSelectedSchool) {
      setSelectedSchool(propSelectedSchool);
      setCardOpen(true);
    }
  }, [propSelectedSchool]);

  // Effect to focus map on selected school when center and zoom are provided
  useEffect(() => {
    if (center && zoom && mapRef.current) {
      // Small delay to ensure map is fully initialized
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.setView(center, zoom);
          console.log('Map focused on school at:', center, 'with zoom:', zoom);
          
          // Fetch schools around the focused area
          const bounds = mapRef.current.getBounds();
          fetchSchools(bounds, zoom);
        }
      }, 100);
    }
  }, [center, zoom, fetchSchools]);

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    console.log(`Filter changed to: ${filter}`);
  };

  // Handle school marker click - disabled for school pages
  const handleSchoolClick = async (school) => {
    // Don't show school cards on individual school pages (when center and zoom are provided)
    if (center && zoom) {
      return;
    }
    
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
      {/* School Details Card - Only show on home page, not on individual school pages */}
      {!center && !zoom && cardOpen && selectedSchool && (
        <SchoolDetailsCard
          selectedSchool={selectedSchool}
          selectedSchoolInspections={selectedSchoolInspections}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={handleCardClose}
        />
      )}
      
      {/* Filter Buttons - Only show on home page, not on individual school pages */}
      {!center && !zoom && (
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
      )}
      
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
          center={center || (city && CITY_COORDINATES[city] ? [CITY_COORDINATES[city].lat, CITY_COORDINATES[city].lng] : [52.5, -1.5])}
          zoom={zoom || (city && CITY_COORDINATES[city] ? CITY_COORDINATES[city].zoom : 6)}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
          whenReady={() => {
            console.log('Map is ready, triggering initial school fetch');
            // Only fetch schools for home page (not city pages) and when no specific center/zoom is provided
            if (!city && !center) {
              setTimeout(() => {
                if (mapRef.current) {
                  const bounds = mapRef.current.getBounds();
                  const zoom = mapRef.current.getZoom();
                  fetchSchools(bounds, zoom);
                }
              }, 200);
            }
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
            
            const isSelected = propSelectedSchool === school.urn;
            const icon = getOfstedIcon(school.urn, school, isSelected);
            
            return (
              <Marker
                key={school.urn}
                position={[offsetLat, offsetLon]}
                {...(icon && { icon })}
                eventHandlers={{
                  click: () => handleSchoolClick(school)
                }}
                {...(isSelected && { 
                  zIndexOffset: 1000,
                  opacity: 1.2
                })}
              />
            );
          })}

          <MapEventUpdater onBoundsChange={fetchSchools} city={city} />
        </MapContainer>
      </div>
    </div>
  );
}