import { useState, useCallback, useEffect } from 'react';
import { Location } from '@/types';

const DEFAULT_LOCATION: Location = { latitude: 19.076, longitude: 72.877, name: 'Mumbai (Default)' };

export function useLocation() {
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>(DEFAULT_LOCATION.name || '');

  const requestLocation = useCallback(() => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          name: 'Current Location'
        };
        setLocation(newLocation);
        setLocationName(newLocation.name);
        setIsLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setError('Unable to retrieve your location. Using default.');
        // Keep default location on error
        setIsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  const setManualLocation = useCallback((lat: number, lon: number, name?: string) => {
    const newLocation = { latitude: lat, longitude: lon, name: name || 'Custom Location' };
    setLocation(newLocation);
    setLocationName(newLocation.name);
    setError(null);
  }, []);

  // Try to get location on initial load
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    location,
    isLoading,
    error,
    locationName,
    requestLocation,
    setManualLocation
  };
}
