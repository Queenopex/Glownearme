import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Navigation } from 'lucide-react';
import { lagosLocations, heroConfig } from '../config';

interface LocationSearchProps {
  onLocationSelect: (location: string) => void;
}

const LocationSearch = ({ onLocationSelect }: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter locations based on search query
  const filteredLocations = searchQuery.length > 0
    ? lagosLocations.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (locationName: string) => {
    setSearchQuery(locationName);
    onLocationSelect(locationName);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    onLocationSelect('');
    inputRef.current?.focus();
  };

  const handleUseCurrentLocation = () => {
    setSearchQuery('Current Location');
    onLocationSelect('current');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink">
          <MapPin className="w-5 h-5" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={heroConfig.searchPlaceholder}
          className="w-full bg-black/80 backdrop-blur-md border-2 border-white/20 pl-12 pr-24 py-4 font-body text-white placeholder:text-white/40 focus:border-pink focus:outline-none transition-colors"
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-28 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Search Button */}
        <button
          onClick={() => onLocationSelect(searchQuery)}
          className="absolute right-0 top-0 bottom-0 px-6 bg-pink text-black font-display font-bold text-sm uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 shadow-2xl z-50 max-h-80 overflow-y-auto">
          {/* Use Current Location Option */}
          <button
            onClick={handleUseCurrentLocation}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/10"
          >
            <div className="w-8 h-8 bg-pink/20 rounded-full flex items-center justify-center">
              <Navigation className="w-4 h-4 text-pink" />
            </div>
            <div className="text-left">
              <p className="font-body text-white text-sm">Use my current location</p>
              <p className="font-body text-white/40 text-xs">Find artists near you</p>
            </div>
          </button>

          {/* Popular Locations */}
          {searchQuery.length === 0 && (
            <div className="p-4">
              <p className="font-body text-white/40 text-xs uppercase tracking-wider mb-3">Popular Areas</p>
              <div className="grid grid-cols-2 gap-2">
                {['Lekki Phase 1', 'Ikeja', 'Victoria Island', 'Yaba'].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => handleSelect(loc)}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-pink/20 transition-colors text-left"
                  >
                    <MapPin className="w-3 h-3 text-pink" />
                    <span className="font-body text-white text-sm">{loc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtered Results */}
          {filteredLocations.length > 0 && (
            <div className="border-t border-white/10">
              <p className="px-4 py-2 font-body text-white/40 text-xs uppercase tracking-wider">
                {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} found
              </p>
              {filteredLocations.map((location) => (
                <button
                  key={location.name}
                  onClick={() => handleSelect(location.name)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-pink" />
                    <span className="font-body text-white text-sm">{location.name}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-body ${
                    location.area === 'mainland' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {location.area === 'mainland' ? 'Mainland' : 'Island'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {searchQuery.length > 0 && filteredLocations.length === 0 && (
            <div className="p-6 text-center">
              <MapPin className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="font-body text-white/50 text-sm">No locations found</p>
              <p className="font-body text-white/30 text-xs mt-1">Try searching for areas in Lagos</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
