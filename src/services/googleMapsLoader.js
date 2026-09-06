import { Loader } from '@googlemaps/js-api-loader';

let loaderInstance = null;
let mapsLoadingPromise = null;

// Custom BigBites Editorial Map Style
export const BIGBITES_MAP_STYLES = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#f5f2eb' }] // Warm cream base land
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#111111' }] // Dark high-contrast typography
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }, { weight: 3 }]
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#F20D0D' }, { weight: 700 }] // Brand red locality titles
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#eee9de' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#dcedd9' }] // Muted sage green parks
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#3d6e3d' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }] // Crisp white roads
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#ded7c8' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#ffd966' }] // Warm turmeric highway
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#111111' }, { weight: 1 }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#e5e0d5' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#c7dfea' }] // Soft atmospheric water
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#2b5f75' }]
  }
];

/**
 * Dynamically loads the Google Maps JavaScript API with required libraries
 */
export function loadGoogleMapsScript() {
  if (typeof window !== 'undefined' && window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (mapsLoadingPromise) {
    return mapsLoadingPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // If no API key or placeholder key set, reject with missing key error for fallback
  if (!apiKey || apiKey === 'YOUR_KEY' || apiKey === 'PASTE_MY_DEMO_KEY_HERE' || apiKey.trim() === '') {
    return Promise.reject(new Error('GOOGLE_MAPS_KEY_MISSING'));
  }

  try {
    if (!loaderInstance) {
      loaderInstance = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places', 'routes', 'geometry', 'marker']
      });
    }

    mapsLoadingPromise = loaderInstance.load().then((google) => {
      return google.maps;
    });

    return mapsLoadingPromise;
  } catch (err) {
    return Promise.reject(err);
  }
}

export function isGoogleMapsLoaded() {
  return typeof window !== 'undefined' && !!(window.google && window.google.maps);
}

/**
 * Generates an external Google Maps directions URL for a destination
 */
export function getGoogleMapsDirectionsUrl(lat, lng, query = '') {
  const destination = lat && lng ? `${lat},${lng}` : encodeURIComponent(query);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}
