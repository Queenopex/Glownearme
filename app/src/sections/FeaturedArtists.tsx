import { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, MapPin, ArrowRight, Heart, Filter, Calendar, Check, MessageCircle, Search, X } from 'lucide-react';
import { featuredArtistsConfig, lagosLocations } from '../config';
import BookingModal from '../components/BookingModal';
import ArtistProfileModal from '../components/ArtistProfileModal';
import ChatModal from '../components/ChatModal';
import LocationSearch from '../components/LocationSearch';

gsap.registerPlugin(ScrollTrigger);

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const FeaturedArtists = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const triggersRef = useRef<ScrollTrigger[]>([]);
  
  // Filters
  const [areaFilter, setAreaFilter] = useState<'all' | 'mainland' | 'island'>('all');
  const [searchLocation, setSearchLocation] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'price-low' | 'price-high' | 'distance'>('rating');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modals
  const [selectedArtist, setSelectedArtist] = useState<typeof featuredArtistsConfig.artists[0] | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Favorites
  const [favorites, setFavorites] = useState<string[]>([]);

  // Get all unique services
  const allServices = useMemo(() => {
    const services = new Set<string>();
    featuredArtistsConfig.artists.forEach(artist => {
      artist.services.forEach(service => services.add(service));
    });
    return Array.from(services);
  }, []);

  // Filter and sort artists
  const filteredArtists = useMemo(() => {
    let result = [...featuredArtistsConfig.artists];

    // Area filter
    if (areaFilter !== 'all') {
      result = result.filter(artist => artist.area === areaFilter);
    }

    // Location search filter
    if (searchLocation) {
      const locationData = lagosLocations.find(loc => 
        loc.name.toLowerCase() === searchLocation.toLowerCase()
      );
      
      if (locationData) {
        // Sort by distance from searched location
        result = result.map(artist => ({
          ...artist,
          distance: calculateDistance(
            locationData.coordinates.lat,
            locationData.coordinates.lng,
            artist.coordinates.lat,
            artist.coordinates.lng
          )
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
      } else {
        // Filter by location name match
        result = result.filter(artist => 
          artist.location.toLowerCase().includes(searchLocation.toLowerCase())
        );
      }
    }

    // Price range filter
    result = result.filter(artist => 
      artist.pricePerSession >= priceRange[0] && artist.pricePerSession <= priceRange[1]
    );

    // Services filter
    if (selectedServices.length > 0) {
      result = result.filter(artist =>
        selectedServices.some(service => artist.services.includes(service))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.pricePerSession - b.pricePerSession);
        break;
      case 'price-high':
        result.sort((a, b) => b.pricePerSession - a.pricePerSession);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [areaFilter, searchLocation, priceRange, selectedServices, sortBy]);

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardsRef.current;
    const content = contentRef.current;
    if (!section || !cards || !content) return;

    const cardElements = cards.querySelectorAll('.artist-card');
    
    const cardsTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      },
    });

    cardsTl.fromTo(
      cardElements,
      {
        y: 80,
        opacity: 0,
        rotateY: -30,
      },
      {
        y: 0,
        opacity: 1,
        rotateY: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'expo.out',
      }
    );

    if (cardsTl.scrollTrigger) {
      triggersRef.current.push(cardsTl.scrollTrigger);
    }

    const contentTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
    });

    contentTl.fromTo(
      content.children,
      {
        y: 40,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'expo.out',
      }
    );

    if (contentTl.scrollTrigger) {
      triggersRef.current.push(contentTl.scrollTrigger);
    }

    return () => {
      triggersRef.current.forEach(trigger => trigger.kill());
      triggersRef.current = [];
    };
  }, [filteredArtists]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const clearFilters = () => {
    setAreaFilter('all');
    setSearchLocation('');
    setPriceRange([0, 100000]);
    setSelectedServices([]);
    setSortBy('rating');
  };

  const handleBookClick = (artist: typeof featuredArtistsConfig.artists[0]) => {
    setSelectedArtist(artist);
    setIsBookingOpen(true);
  };

  const handleProfileClick = (artist: typeof featuredArtistsConfig.artists[0]) => {
    setSelectedArtist(artist);
    setIsProfileOpen(true);
  };

  const handleMessageClick = (artist: typeof featuredArtistsConfig.artists[0]) => {
    setSelectedArtist(artist);
    setIsChatOpen(true);
  };

  const hasActiveFilters = areaFilter !== 'all' || searchLocation || 
    priceRange[0] > 0 || priceRange[1] < 100000 || selectedServices.length > 0;

  if (!featuredArtistsConfig.artists.length && !featuredArtistsConfig.headingMain) return null;

  return (
    <>
      <section
        ref={sectionRef}
        id="artists"
        className="relative min-h-screen w-full bg-black py-24 overflow-hidden"
      >
        {/* Background grid lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-0 bottom-0 w-px bg-pink" />
          <div className="absolute left-2/4 top-0 bottom-0 w-px bg-pink" />
          <div className="absolute left-3/4 top-0 bottom-0 w-px bg-pink" />
          <div className="absolute top-1/3 left-0 right-0 h-px bg-pink" />
          <div className="absolute top-2/3 left-0 right-0 h-px bg-pink" />
        </div>

        <div className="relative z-10 w-full px-6 lg:px-12">
          {/* Section header */}
          <div ref={contentRef} className="mb-8">
            {featuredArtistsConfig.sectionLabel && (
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-px bg-pink" />
                <span className="font-body text-pink text-sm uppercase tracking-[0.3em]">
                  {featuredArtistsConfig.sectionLabel}
                </span>
              </div>
            )}
            {(featuredArtistsConfig.headingMain || featuredArtistsConfig.headingAccent) && (
              <h2 className="font-display font-black text-5xl md:text-7xl text-white uppercase tracking-tight mb-6">
                {featuredArtistsConfig.headingMain}<span className="text-pink">{featuredArtistsConfig.headingAccent}</span>
              </h2>
            )}
            {featuredArtistsConfig.description && (
              <p className="font-body text-white/60 text-lg max-w-2xl leading-relaxed">
                {featuredArtistsConfig.description}
              </p>
            )}
          </div>

          {/* Location Search */}
          <div className="mb-8">
            <LocationSearch 
              onLocationSelect={setSearchLocation}
            />
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {/* Area Filter */}
            <div className="flex items-center gap-2">
              <span className="font-body text-white/50 text-sm">{featuredArtistsConfig.filterLabel}</span>
              <div className="flex gap-1">
                {(['all', 'mainland', 'island'] as const).map((area) => (
                  <button
                    key={area}
                    onClick={() => setAreaFilter(area)}
                    className={`px-4 py-2 font-body text-xs uppercase tracking-wider border transition-all duration-300 ${
                      areaFilter === area
                        ? 'bg-pink text-black border-pink'
                        : 'bg-transparent text-white/60 border-white/20 hover:border-pink'
                    }`}
                  >
                    {area === 'all' ? featuredArtistsConfig.allAreasLabel : 
                     area === 'mainland' ? featuredArtistsConfig.mainlandLabel : 
                     featuredArtistsConfig.islandLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="font-body text-white/50 text-sm">{featuredArtistsConfig.sortLabel}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-black border border-white/20 px-4 py-2 font-body text-white text-sm focus:border-pink focus:outline-none"
              >
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border transition-all ${
                showFilters ? 'bg-pink text-black border-pink' : 'border-white/20 text-white/60 hover:border-pink'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="font-body text-sm">Filters</span>
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-pink text-black rounded-full text-xs flex items-center justify-center font-bold">
                  {[areaFilter !== 'all', searchLocation, priceRange[0] > 0 || priceRange[1] < 100000, selectedServices.length > 0].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="bg-neutral-900 border border-white/10 p-6 mb-8 space-y-6">
              {/* Price Range */}
              <div>
                <label className="font-body text-white/70 text-sm mb-3 block">
                  {featuredArtistsConfig.priceFilterLabel}: ₦{priceRange[0].toLocaleString()} - ₦{priceRange[1].toLocaleString()}
                </label>
                <div className="flex gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="5000"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="flex-1 accent-pink"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="5000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="flex-1 accent-pink"
                  />
                </div>
              </div>

              {/* Services */}
              <div>
                <label className="font-body text-white/70 text-sm mb-3 block">
                  {featuredArtistsConfig.serviceFilterLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  {allServices.map((service) => (
                    <button
                      key={service}
                      onClick={() => toggleService(service)}
                      className={`flex items-center gap-2 px-3 py-2 border transition-all ${
                        selectedServices.includes(service)
                          ? 'bg-pink text-black border-pink'
                          : 'bg-transparent text-white/60 border-white/20 hover:border-pink'
                      }`}
                    >
                      {selectedServices.includes(service) && <Check className="w-3 h-3" />}
                      <span className="font-body text-xs">{service}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-pink hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span className="font-body text-sm">{featuredArtistsConfig.clearFiltersText}</span>
                </button>
              )}
            </div>
          )}

          {/* Results Count */}
          <div className="mb-6">
            <p className="font-body text-white/50 text-sm">
              {filteredArtists.length} artist{filteredArtists.length !== 1 ? 's' : ''} found
              {searchLocation && ` near ${searchLocation}`}
            </p>
          </div>

          {/* Artist Cards Grid */}
          {filteredArtists.length > 0 ? (
            <div 
              ref={cardsRef}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredArtists.map((artist) => (
                <div
                  key={artist.id}
                  className="artist-card group relative bg-neutral-900 border border-white/10 overflow-hidden hover:border-pink transition-all duration-500"
                  data-cursor-hover
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => handleProfileClick(artist)}>
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    
                    {/* Favorite button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(artist.id);
                      }}
                      className={`absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
                        favorites.includes(artist.id) 
                          ? 'text-pink bg-black' 
                          : 'text-white/60 hover:text-pink'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(artist.id) ? 'fill-pink' : ''}`} />
                    </button>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className={`px-3 py-1 font-display font-bold text-xs uppercase ${
                        artist.area === 'mainland' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-purple-500 text-white'
                      }`}>
                        {artist.area === 'mainland' ? 'Mainland' : 'Island'}
                      </div>
                      {artist.isVerified && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-pink text-black font-display font-bold text-xs">
                          <Check className="w-3 h-3" />
                          {featuredArtistsConfig.verifiedBadge}
                        </div>
                      )}
                      {artist.isPopular && (
                        <div className="px-2 py-1 bg-white text-black font-display font-bold text-xs">
                          {featuredArtistsConfig.popularBadge}
                        </div>
                      )}
                    </div>

                    {/* Price Range */}
                    <div className="absolute bottom-4 left-4 bg-pink text-black px-3 py-1 font-display font-bold text-xs uppercase">
                      From ₦{artist.pricePerSession.toLocaleString()}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 
                      className="font-display font-bold text-xl text-white mb-1 group-hover:text-pink transition-colors cursor-pointer"
                      onClick={() => handleProfileClick(artist)}
                    >
                      {artist.name}
                    </h3>
                    <p className="font-body text-pink text-sm mb-3">
                      {artist.specialty}
                    </p>
                    
                    {/* Location */}
                    <div className="flex items-center gap-2 text-white/40 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="font-body text-xs">{artist.location}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-pink fill-pink" />
                        <span className="font-display font-bold text-white">{artist.rating}</span>
                      </div>
                      <span className="font-body text-white/40 text-xs">({artist.reviews} reviews)</span>
                    </div>

                    {/* Services */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {artist.services.slice(0, 3).map((service) => (
                        <span key={service} className="px-2 py-1 bg-white/5 text-white/40 text-xs font-body">
                          {service}
                        </span>
                      ))}
                      {artist.services.length > 3 && (
                        <span className="px-2 py-1 bg-white/5 text-white/40 text-xs font-body">
                          +{artist.services.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleMessageClick(artist)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/20 text-white font-display font-bold text-xs uppercase tracking-wider hover:bg-white/5 transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {featuredArtistsConfig.messageText}
                      </button>
                      <button 
                        onClick={() => handleBookClick(artist)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-pink text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-white transition-all"
                      >
                        <Calendar className="w-4 h-4" />
                        {featuredArtistsConfig.bookNowText}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="font-display font-bold text-white text-xl mb-2">
                {featuredArtistsConfig.noResultsText}
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-3 bg-pink text-black font-display font-bold text-sm uppercase tracking-wider hover:bg-white transition-colors"
              >
                {featuredArtistsConfig.clearFiltersText}
              </button>
            </div>
          )}

          {/* View All CTA */}
          {filteredArtists.length > 0 && (
            <div className="flex justify-center mt-12">
              <button
                className="group flex items-center gap-4 px-8 py-4 border-2 border-white text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300"
                data-cursor-hover
              >
                {featuredArtistsConfig.ctaText}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Decorative elements */}
        {featuredArtistsConfig.decorativeText && (
          <div className="absolute bottom-12 left-6 font-display font-black text-[12rem] text-white/[0.02] leading-none pointer-events-none select-none">
            {featuredArtistsConfig.decorativeText}
          </div>
        )}
      </section>

      {/* Modals */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        artist={selectedArtist}
      />
      
      <ArtistProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        artist={selectedArtist}
        onBook={handleBookClick}
        onMessage={handleMessageClick}
      />
      
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        artist={selectedArtist}
      />
    </>
  );
};

export default FeaturedArtists;
