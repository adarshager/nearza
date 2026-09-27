/**
 * Nearza — Location Selector Modal
 * Authoritative location picker with debounced geocoding search, GPS detection
 * confirmation, recent locations history, and curated regional town shortcuts.
 *
 * Design: Premium White + Sky-blue aesthetic using Lucide icons (No emojis).
 */

import { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  X,
  Check,
  Search,
  Clock,
  AlertCircle,
  Loader2,
  Building,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext';
import { locationService } from '../../services/location';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

// Curated regional town shortcuts for instant one-tap selection
const POPULAR_TOWNS = [
  {
    name: 'Ankola',
    locality: 'Ankola',
    city: 'Ankola',
    district: 'Uttara Kannada',
    state: 'Karnataka',
    country: 'India',
    displayName: 'Ankola, Uttara Kannada, Karnataka',
    latitude: 14.6653,
    longitude: 74.3015,
  },
  {
    name: 'Karwar',
    locality: 'Karwar',
    city: 'Karwar',
    district: 'Uttara Kannada',
    state: 'Karnataka',
    country: 'India',
    displayName: 'Karwar, Uttara Kannada, Karnataka',
    latitude: 14.8136,
    longitude: 74.1298,
  },
  {
    name: 'Kumta',
    locality: 'Kumta',
    city: 'Kumta',
    district: 'Uttara Kannada',
    state: 'Karnataka',
    country: 'India',
    displayName: 'Kumta, Uttara Kannada, Karnataka',
    latitude: 14.4286,
    longitude: 74.4172,
  },
  {
    name: 'Sirsi',
    locality: 'Sirsi',
    city: 'Sirsi',
    district: 'Uttara Kannada',
    state: 'Karnataka',
    country: 'India',
    displayName: 'Sirsi, Uttara Kannada, Karnataka',
    latitude: 14.6196,
    longitude: 74.8354,
  },
  {
    name: 'Gokarna',
    locality: 'Gokarna',
    city: 'Gokarna',
    district: 'Uttara Kannada',
    state: 'Karnataka',
    country: 'India',
    displayName: 'Gokarna, Uttara Kannada, Karnataka',
    latitude: 14.5479,
    longitude: 74.3188,
  },
  {
    name: 'Bengaluru',
    locality: 'Bengaluru',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    country: 'India',
    displayName: 'Bengaluru, Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    name: 'Mangaluru',
    locality: 'Mangaluru',
    city: 'Mangaluru',
    district: 'Dakshina Kannada',
    state: 'Karnataka',
    country: 'India',
    displayName: 'Mangaluru, Karnataka',
    latitude: 12.9141,
    longitude: 74.856,
  },
];

export function LocationSelectorModal({ isOpen, onClose }) {
  const {
    location: currentLocation,
    locationLoading,
    locationError,
    detectedGpsLocation,
    recentLocations,
    requestLocation,
    confirmDetectedGps,
    selectLocation,
  } = useLocation();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const debounceTimerRef = useRef(null);

  // Debounced search logic (300ms delay to respect rate limits)
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await locationService.searchLocations(query);
        setSearchResults(results);
        if (results.length === 0) {
          setSearchError('No matching towns or localities found. Try another spelling.');
        }
      } catch (err) {
        console.error('Location search failed:', err);
        setSearchError('Unable to search locations right now. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (loc) => {
    selectLocation(loc, 'search');
    if (onClose) onClose();
  };

  const handleGpsDetectClick = () => {
    requestLocation(false);
  };

  const handleGpsConfirm = () => {
    confirmDetectedGps();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-sky-50/80 via-white to-sky-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Choose Your Location
              </h3>
              <p className="text-xs text-slate-500">
                Local shops, products, and distances are tailored to this area
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close location picker"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 divide-y divide-slate-100">
          {/* Search Input Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Search town, city, or district (e.g. Ankola, Karwar, Sirsi)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Suggestions */}
            {isSearching && (
              <div className="flex items-center gap-2 p-3 text-xs text-sky-600 bg-sky-50/60 rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin text-sky-500 shrink-0" />
                <span>Searching towns and localities...</span>
              </div>
            )}

            {searchError && !isSearching && (
              <div className="flex items-center gap-2 p-2.5 text-xs text-amber-700 bg-amber-50 rounded-xl border border-amber-200/60">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                <span>{searchError}</span>
              </div>
            )}

            {searchResults.length > 0 && !isSearching && (
              <div className="border border-sky-100 rounded-2xl overflow-hidden bg-sky-50/30 divide-y divide-sky-100 max-h-56 overflow-y-auto shadow-xs">
                <div className="px-3 py-1.5 bg-sky-100/50 text-[11px] font-bold text-sky-800 uppercase tracking-wider">
                  Select matching town / village
                </div>
                {searchResults.map((item, index) => (
                  <button
                    key={`${item.latitude}-${item.longitude}-${index}`}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full text-left p-3 hover:bg-sky-100/80 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-sky-700">
                        {item.locality || item.city || item.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {[item.district, item.state, item.pincode].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-sky-400 group-hover:text-sky-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current GPS detection section */}
          <div className="pt-4 space-y-2.5">
            <button
              type="button"
              onClick={handleGpsDetectClick}
              disabled={locationLoading}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200 text-sky-800 transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  {locationLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-sky-950">
                    {locationLoading ? 'Detecting via Device GPS...' : 'Use Current Device Location'}
                  </p>
                  <p className="text-[11px] text-sky-700/80 truncate">
                    High accuracy GPS with confirmation
                  </p>
                </div>
              </div>
              <Badge variant="sky" size="sm">
                GPS
              </Badge>
            </button>

            {/* GPS Detection Confirmation Box (Prevents silent Bengaluru overwrite) */}
            {detectedGpsLocation && (
              <div className="p-3.5 rounded-2xl bg-white border-2 border-sky-400 shadow-md space-y-2 animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <Compass className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">
                      Detected Location:
                    </p>
                    <p className="text-sm font-extrabold text-sky-700 truncate">
                      {detectedGpsLocation.displayName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Coordinates: {detectedGpsLocation.latitude.toFixed(4)},{' '}
                      {detectedGpsLocation.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto flex-1 font-bold text-xs"
                    onClick={handleGpsConfirm}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Confirm & Use This Location
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      // Discard GPS and focus search
                      const el = document.querySelector('input[type="text"]');
                      if (el) el.focus();
                    }}
                    className="text-xs text-sky-600 hover:text-sky-800 font-semibold underline py-1"
                  >
                    Not your location? Search manually
                  </button>
                </div>
              </div>
            )}

            {/* GPS Error Prompt */}
            {locationError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{locationError}</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Please use the search box above to choose your town or district.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recent & Saved Locations */}
          {recentLocations && recentLocations.length > 0 && (
            <div className="pt-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Recent Locations
              </span>
              <div className="space-y-1.5">
                {recentLocations.map((item, idx) => {
                  const isCurrent =
                    currentLocation &&
                    Math.abs(currentLocation.latitude - item.latitude) < 0.001 &&
                    Math.abs(currentLocation.longitude - item.longitude) < 0.001;

                  return (
                    <button
                      key={`recent-${item.latitude}-${item.longitude}-${idx}`}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-sky-50 text-sky-900 border border-sky-300 font-bold'
                          : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MapPin
                          className={`w-4 h-4 shrink-0 ${
                            isCurrent ? 'text-sky-600' : 'text-slate-400'
                          }`}
                        />
                        <div className="truncate">
                          <p className="text-xs font-semibold leading-tight">
                            {item.locality || item.city || item.displayName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {item.displayName || `${item.district || ''}, ${item.state || ''}`}
                          </p>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 bg-sky-100/60 px-2 py-0.5 rounded-lg shrink-0">
                          <Check className="w-3 h-3" />
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Popular Regional Towns (Coastal Karnataka & Major Hubs) */}
          <div className="pt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Regional Town Quick-Select
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TOWNS.map((town) => {
                const isCurrent =
                  currentLocation &&
                  Math.abs(currentLocation.latitude - town.latitude) < 0.001 &&
                  Math.abs(currentLocation.longitude - town.longitude) < 0.001;

                return (
                  <button
                    key={town.name}
                    type="button"
                    onClick={() => handleSelect(town)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-sky-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-transparent hover:border-sky-200'
                    }`}
                  >
                    <span>{town.name}</span>
                    {isCurrent && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 truncate max-w-[240px]">
            Active: <span className="font-bold text-slate-800">{currentLocation?.locality || currentLocation?.city || 'Ankola'}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LocationSelectorModal;
