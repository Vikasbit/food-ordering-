let mapsLoadingPromise = null;

/**
 * Dynamically loads the Google Maps JavaScript API with required libraries
 */
export function loadGoogleMapsScript() {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (mapsLoadingPromise) {
    return mapsLoadingPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // If no API key or placeholder key set, return fallback indicator
  if (!apiKey || apiKey === 'PASTE_MY_DEMO_KEY_HERE' || apiKey.trim() === '') {
    return Promise.reject(new Error('GOOGLE_MAPS_KEY_MISSING'));
  }

  mapsLoadingPromise = new Promise((resolve, reject) => {
    const callbackName = `__googleMapsInitCallback_${Math.floor(Math.random() * 1000000)}`;
    
    window[callbackName] = () => {
      delete window[callbackName];
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps script failed to initialize properly.'));
      }
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,routes,geometry,marker&callback=${callbackName}&v=weekly`;
    script.async = true;
    script.defer = true;

    script.onerror = (err) => {
      delete window[callbackName];
      reject(err || new Error('Google Maps script network load failed.'));
    };

    document.head.appendChild(script);
  });

  return mapsLoadingPromise;
}

export function isGoogleMapsLoaded() {
  return !!(window.google && window.google.maps);
}
