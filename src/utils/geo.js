/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 * 
 * @param {number} lat1 Latitude of point 1 in decimal degrees
 * @param {number} lon1 Longitude of point 1 in decimal degrees
 * @param {number} lat2 Latitude of point 2 in decimal degrees
 * @param {number} lon2 Longitude of point 2 in decimal degrees
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if ((lat1 === lat2) && (lon1 === lon2)) {
    return 0;
  }
  
  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  
  if (dist > 1) {
    dist = 1;
  }
  
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  
  // Convert miles to kilometers
  dist = dist * 1.609344;
  
  // Return distance rounded to 1 decimal place
  return Math.round(dist * 10) / 10;
}

/**
 * Validates geographical coordinates
 * @param {*} lat 
 * @param {*} lng 
 * @returns {boolean}
 */
export function isValidCoordinate(lat, lng) {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return false;
  }
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (isNaN(nLat) || isNaN(nLng)) {
    return false;
  }
  // Reject 0,0 null island / uninitialized coordinate
  if (Math.abs(nLat) < 0.0001 && Math.abs(nLng) < 0.0001) {
    return false;
  }
  if (nLat < -90 || nLat > 90 || nLng < -180 || nLng > 180) {
    return false;
  }
  return true;
}

