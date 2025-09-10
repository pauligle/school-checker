const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Configuration
const PROXIMITY_THRESHOLD = 0.0001; // ~10 meters in degrees
const OFFSET_RADIUS = 0.00035; // ~35 meters in degrees (increased for better visibility)
const MAX_MARKERS_PER_GROUP = 8; // Maximum markers in a cluster

// Function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
}

// Function to calculate offset positions for a group of schools
function calculateOffsets(schools, centerLat, centerLon) {
  const count = schools.length;
  const offsets = [];
  
  if (count === 1) {
    // Single school - no offset needed
    offsets.push({ lat: 0, lon: 0 });
  } else if (count === 2) {
    // Two schools - place on opposite sides
    offsets.push({ lat: OFFSET_RADIUS, lon: 0 });
    offsets.push({ lat: -OFFSET_RADIUS, lon: 0 });
  } else if (count === 3) {
    // Three schools - triangle pattern
    const angle1 = 0;
    const angle2 = 2 * Math.PI / 3;
    const angle3 = 4 * Math.PI / 3;
    
    offsets.push({
      lat: OFFSET_RADIUS * Math.cos(angle1),
      lon: OFFSET_RADIUS * Math.sin(angle1)
    });
    offsets.push({
      lat: OFFSET_RADIUS * Math.cos(angle2),
      lon: OFFSET_RADIUS * Math.sin(angle2)
    });
    offsets.push({
      lat: OFFSET_RADIUS * Math.cos(angle3),
      lon: OFFSET_RADIUS * Math.sin(angle3)
    });
  } else if (count === 4) {
    // Four schools - square pattern
    const positions = [
      { lat: OFFSET_RADIUS, lon: 0 },
      { lat: 0, lon: OFFSET_RADIUS },
      { lat: -OFFSET_RADIUS, lon: 0 },
      { lat: 0, lon: -OFFSET_RADIUS }
    ];
    offsets.push(...positions);
  } else {
    // 5+ schools - circular pattern
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      offsets.push({
        lat: OFFSET_RADIUS * Math.cos(angle),
        lon: OFFSET_RADIUS * Math.sin(angle)
      });
    }
  }
  
  return offsets;
}

// Function to group schools by proximity
function groupSchoolsByProximity(schools) {
  const groups = [];
  const processed = new Set();
  
  for (let i = 0; i < schools.length; i++) {
    if (processed.has(i)) continue;
    
    const group = [schools[i]];
    processed.add(i);
    
    // Find all schools within proximity threshold
    for (let j = i + 1; j < schools.length; j++) {
      if (processed.has(j)) continue;
      
      const distance = calculateDistance(
        schools[i].lat, schools[i].lon,
        schools[j].lat, schools[j].lon
      );
      
      if (distance <= (PROXIMITY_THRESHOLD * 111000)) { // Convert degrees to meters
        group.push(schools[j]);
        processed.add(j);
      }
    }
    
    groups.push(group);
  }
  
  return groups;
}

// Function to calculate final positions for all schools
function calculateMarkerPositions(schools) {
  const groups = groupSchoolsByProximity(schools);
  const results = [];
  
  console.log(`Found ${groups.length} groups of schools`);
  
  groups.forEach((group, groupIndex) => {
    console.log(`Group ${groupIndex + 1}: ${group.length} schools`);
    
    if (group.length > MAX_MARKERS_PER_GROUP) {
      console.warn(`Group ${groupIndex + 1} has ${group.length} schools, limiting to ${MAX_MARKERS_PER_GROUP}`);
      group = group.slice(0, MAX_MARKERS_PER_GROUP);
    }
    
    // Calculate center point of the group
    const centerLat = group.reduce((sum, school) => sum + school.lat, 0) / group.length;
    const centerLon = group.reduce((sum, school) => sum + school.lon, 0) / group.length;
    
    // Calculate offsets for this group
    const offsets = calculateOffsets(group, centerLat, centerLon);
    
    // Apply offsets to each school
    group.forEach((school, index) => {
      const offset = offsets[index] || { lat: 0, lon: 0 };
      
      results.push({
        urn: school.urn,
        original_lat: school.lat,
        original_lon: school.lon,
        offset_lat: school.lat + offset.lat,
        offset_lon: school.lon + offset.lon,
        group_id: groupIndex,
        group_size: group.length,
        offset_distance_meters: Math.sqrt(offset.lat * offset.lat + offset.lon * offset.lon) * 111000
      });
    });
  });
  
  return results;
}

async function main() {
  try {
    console.log('=== Calculating Marker Offsets ===');
    
    // Fetch all schools with valid coordinates
    const { data: schools, error } = await supabase
      .from('schools')
      .select('urn, establishmentname, lat, lon')
      .not('lat', 'is', null)
      .not('lon', 'is', null)
      .order('urn');
    
    if (error) {
      console.error('Error fetching schools:', error);
      return;
    }
    
    console.log(`Processing ${schools.length} schools...`);
    
    // Calculate marker positions
    const markerPositions = calculateMarkerPositions(schools);
    
    // Show statistics
    const groups = markerPositions.reduce((acc, pos) => {
      if (!acc[pos.group_id]) acc[pos.group_id] = 0;
      acc[pos.group_id]++;
      return acc;
    }, {});
    
    console.log('\n=== Results ===');
    console.log(`Total schools processed: ${markerPositions.length}`);
    console.log(`Groups created: ${Object.keys(groups).length}`);
    
    // Show groups with multiple schools
    const multiSchoolGroups = Object.entries(groups).filter(([_, count]) => count > 1);
    if (multiSchoolGroups.length > 0) {
      console.log('\nGroups with multiple schools:');
      multiSchoolGroups.forEach(([groupId, count]) => {
        const groupSchools = markerPositions.filter(pos => pos.group_id == groupId);
        console.log(`Group ${groupId}: ${count} schools`);
        groupSchools.forEach(school => {
          console.log(`  - URN ${school.urn}: ${school.establishmentname}`);
          console.log(`    Original: (${school.original_lat}, ${school.original_lon})`);
          console.log(`    Offset: (${school.offset_lat.toFixed(8)}, ${school.offset_lon.toFixed(8)})`);
          console.log(`    Distance: ${school.offset_distance_meters.toFixed(1)}m`);
        });
      });
    }
    
    // Save results to a file for the map component to use
    const fs = require('fs');
    const outputFile = 'marker-offsets.json';
    fs.writeFileSync(outputFile, JSON.stringify(markerPositions, null, 2));
    console.log(`\nResults saved to ${outputFile}`);
    
    console.log('\n✅ Marker offset calculation completed!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
