/**
 * Nearza — Authoritative Location Context
 * Manages user-selected location as the single source of truth for discovery.
 *
 * Location object structure:
 * {
 *   latitude: number,
 *   longitude: number,
 *   displayName: string,
 *   locality: string,
 *   city: string,
 *   district: string,
 *   state: string,
 *   country: string,
 *   source: "gps" | "search" | "saved" | "default"
 * }
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { locationService } from '../services/location';

const LocationContext = createContext(null);

const STORAGE_KEY = 'nearza_selected_location';
const RECENT_KEY = 'nearza_recent_locations';

// Curated default location: Ankola, Karnataka (matches demo shop catalog)
export const DEFAULT_LOCATION = {
  latitude: 14.6653,
  longitude: 74.3015,
  displayName: 'Ankola, Uttara Kannada, Karnataka',
  locality: 'Ankola',
  city: 'Ankola',
  district: 'Uttara Kannada',
  state: 'Karnataka',
  country: 'India',
  source: 'default',
};

export function LocationProvider({ children }) {
  // 1. Authoritative selected location
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
          return { ...parsed, source: 'saved' };
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved location:', e);
    }
    return DEFAULT_LOCATION;
  });

  // 2. Recent locations history
  const [recentLocations, setRecentLocations] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      DEFAULT_LOCATION,
      {
        latitude: 14.8136,
        longitude: 74.1298,
        displayName: 'Karwar, Uttara Kannada, Karnataka',
        locality: 'Karwar',
        city: 'Karwar',
        district: 'Uttara Kannada',
        state: 'Karnataka',
        country: 'India',
        source: 'saved',
      },
      {
        latitude: 14.4286,
        longitude: 74.4172,
        displayName: 'Kumta, Uttara Kannada, Karnataka',
        locality: 'Kumta',
        city: 'Kumta',
        district: 'Uttara Kannada',
        state: 'Karnataka',
        country: 'India',
        source: 'saved',
      },
    ];
  });

  // 3. UI states
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [detectedGpsLocation, setDetectedGpsLocation] = useState(null);

  // Synchronize location changes to localStorage
  const saveLocationToStorage = useCallback((loc) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch (e) {
      console.warn('Failed to save location to localStorage:', e);
    }
  }, []);

  // Add a location to recent history
  const addToRecent = useCallback((newLoc) => {
    setRecentLocations((prev) => {
      const filtered = prev.filter(
        (item) =>
          Math.abs(item.latitude - newLoc.latitude) > 0.01 ||
          Math.abs(item.longitude - newLoc.longitude) > 0.01
      );
      const updated = [newLoc, ...filtered].slice(0, 6);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  /**
   * Authoritatively select a location (from manual search, recent item, or user GPS confirmation).
   */
  const selectLocation = useCallback(
    (loc, source = 'search') => {
      if (!loc || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') {
        return;
      }

      const formatted = {
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
        displayName: loc.displayName || loc.display_name || `${loc.locality || loc.city || 'Selected Location'}, ${loc.state || ''}`.replace(/,\s*$/, ''),
        locality: loc.locality || loc.city || '',
        city: loc.city || loc.locality || '',
        district: loc.district || '',
        state: loc.state || '',
        country: loc.country || 'India',
        source,
      };

      setLocation(formatted);
      saveLocationToStorage(formatted);
      addToRecent(formatted);
      setLocationError(null);
      setDetectedGpsLocation(null);
      setIsLocationModalOpen(false);
    },
    [saveLocationToStorage, addToRecent]
  );

  /**
   * Request device GPS coordinates and reverse-geocode.
   * If autoApply is false (default in modal), sets `detectedGpsLocation` so user can confirm or reject
   * without GPS silently overwriting a manual selection.
   */
  const requestLocation = useCallback(
    (autoApply = false) => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by your browser. Please search your town manually.');
        return;
      }

      setLocationLoading(true);
      setLocationError(null);
      setDetectedGpsLocation(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            // Reverse geocode via Nearza backend
            const geocoded = await locationService.reverseGeocode(lat, lng);

            const detected = {
              latitude: lat,
              longitude: lng,
              displayName: geocoded?.display_name || `${geocoded?.locality || geocoded?.city || 'Detected Area'}, ${geocoded?.state || ''}`.replace(/,\s*$/, ''),
              locality: geocoded?.locality || geocoded?.city || 'Current Area',
              city: geocoded?.city || geocoded?.locality || '',
              district: geocoded?.district || '',
              state: geocoded?.state || '',
              country: geocoded?.country || 'India',
              source: 'gps',
            };

            setDetectedGpsLocation(detected);

            if (autoApply) {
              selectLocation(detected, 'gps');
            }
          } catch (err) {
            console.error('Reverse geocode failed:', err);
            const fallback = {
              latitude: lat,
              longitude: lng,
              displayName: `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
              locality: 'Current Location',
              city: '',
              district: '',
              state: '',
              country: 'India',
              source: 'gps',
            };
            setDetectedGpsLocation(fallback);
            if (autoApply) {
              selectLocation(fallback, 'gps');
            }
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          const messages = {
            1: 'Location permission was denied. You can search for your town manually below.',
            2: 'Device location is currently unavailable. Please search manually.',
            3: 'Location request timed out. Please search your town manually.',
          };
          setLocationError(messages[error.code] || 'Could not detect your location. Please search manually.');
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    },
    [selectLocation]
  );

  /**
   * Confirm detected GPS location.
   */
  const confirmDetectedGps = useCallback(() => {
    if (detectedGpsLocation) {
      selectLocation(detectedGpsLocation, 'gps');
    }
  }, [detectedGpsLocation, selectLocation]);

  /**
   * Haversine distance calculator in kilometers from active authoritative coordinates.
   */
  const calculateDistance = useCallback(
    (targetLat, targetLng) => {
      if (!location || !location.latitude || !location.longitude) return null;
      if (typeof targetLat !== 'number' || typeof targetLng !== 'number') return null;

      const R = 6371; // Earth radius in km
      const dLat = (targetLat - location.latitude) * (Math.PI / 180);
      const dLng = (targetLng - location.longitude) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(location.latitude * (Math.PI / 180)) *
          Math.cos(targetLat * (Math.PI / 180)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [location]
  );

  /**
   * Legacy setManualLocation compatibility
   */
  const setManualLocation = useCallback(
    ({ lat, lng, address: manualAddr }) => {
      selectLocation(
        {
          latitude: lat,
          longitude: lng,
          displayName: manualAddr,
          locality: manualAddr?.split(',')?.[0]?.trim() || 'Selected Location',
        },
        'search'
      );
    },
    [selectLocation]
  );

  /**
   * Reset / clear location to default
   */
  const clearLocation = useCallback(() => {
    setLocation(DEFAULT_LOCATION);
    saveLocationToStorage(DEFAULT_LOCATION);
    setDetectedGpsLocation(null);
    setLocationError(null);
  }, [saveLocationToStorage]);

  const openLocationModal = useCallback(() => {
    setLocationError(null);
    setDetectedGpsLocation(null);
    setIsLocationModalOpen(true);
  }, []);

  const closeLocationModal = useCallback(() => {
    setIsLocationModalOpen(false);
    setDetectedGpsLocation(null);
    setLocationError(null);
  }, []);

  const value = {
    // Authoritative location object
    location,
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    address: location?.locality || location?.city || location?.displayName || 'Ankola',
    displayName: location?.displayName || 'Ankola, Karnataka',
    locality: location?.locality || 'Ankola',
    city: location?.city || 'Ankola',
    district: location?.district || 'Uttara Kannada',
    state: location?.state || 'Karnataka',
    source: location?.source || 'default',
    hasLocation: !!(location && location.latitude && location.longitude),

    // Detection & selection
    locationLoading,
    locationError,
    detectedGpsLocation,
    recentLocations,
    requestLocation,
    confirmDetectedGps,
    selectLocation,
    setManualLocation,
    clearLocation,
    calculateDistance,

    // Modal state controls
    isLocationModalOpen,
    openLocationModal,
    closeLocationModal,
    setIsLocationModalOpen,

    // Backwards compatibility aliases
    getLocation: () => requestLocation(true),
    error: locationError,
    permissionAsked: false,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

export default LocationContext;
