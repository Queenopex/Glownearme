import { useEffect, useRef, useState } from 'react';
import { X, Star, MapPin, Check, Clock, Award, Calendar, MessageCircle, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { featuredArtistsConfig, chatConfig } from '../config';
import gsap from 'gsap';

import type { Artist } from '../config';

interface ArtistProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: Artist | null;
  onBook: (artist: Artist) => void;
  onMessage: (artist: Artist) => void;
}

const ArtistProfileModal = ({ isOpen, onClose, artist, onBook, onMessage }: ArtistProfileModalProps) => {
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'reviews'>('about');
  const [currentPortfolioIndex, setCurrentPortfolioIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(
        contentRef.current,
        { scale: 0.9, y: 50, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.7)', delay: 0.1 }
      );
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(contentRef.current, {
      scale: 0.9,
      y: 50,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    });
    gsap.to(modalRef.current, {
      opacity: 0,
      duration: 0.3,
      delay: 0.1,
      ease: 'power2.in',
      onComplete: () => {
        onClose();
        setActiveTab('about');
        setCurrentPortfolioIndex(0);
      },
    });
  };

  const nextPortfolioImage = () => {
    if (artist) {
      setCurrentPortfolioIndex((prev) => 
        prev === artist.portfolio.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPortfolioImage = () => {
    if (artist) {
      setCurrentPortfolioIndex((prev) => 
        prev === 0 ? artist.portfolio.length - 1 : prev - 1
      );
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-pink fill-pink' : 'text-white/20'}`}
      />
    ));
  };

  if (!isOpen || !artist) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm opacity-0"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-4xl bg-neutral-900 border border-white/10 overflow-hidden opacity-0 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-black transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Cover Image */}
        <div className="relative h-48 bg-gradient-to-r from-pink/20 to-purple/20">
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute -bottom-16 left-8 flex items-end">
            <div className="relative">
              <img
                src={artist.image}
                alt={artist.name}
                className="w-32 h-32 object-cover border-4 border-neutral-900"
              />
              {artist.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-pink rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-black" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Artist Info */}
        <div className="pt-20 px-8 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-display font-black text-2xl text-white">{artist.name}</h2>
                {artist.isPopular && (
                  <span className="px-2 py-1 bg-pink text-black font-display font-bold text-xs uppercase">
                    {featuredArtistsConfig.popularBadge}
                  </span>
                )}
              </div>
              <p className="font-body text-pink text-sm mb-2">{artist.specialty}</p>
              <div className="flex items-center gap-4 text-white/50">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span className="font-body text-xs">{artist.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-body text-xs">{artist.responseTime}</span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-pink fill-pink" />
                <span className="font-display font-bold text-xl text-white">{artist.rating}</span>
              </div>
              <div className="text-right">
                <p className="font-body text-white/40 text-xs">{artist.reviews} reviews</p>
                <div className="flex">{renderStars(Math.floor(artist.rating))}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-8">
          {(['about', 'portfolio', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-display font-bold text-sm uppercase tracking-wider transition-colors relative ${
                activeTab === tab ? 'text-pink' : 'text-white/50 hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-white text-lg mb-3">About</h3>
                <p className="font-body text-white/60 leading-relaxed">{artist.bio}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 p-4 text-center">
                  <Award className="w-6 h-6 text-pink mx-auto mb-2" />
                  <p className="font-display font-bold text-white text-xl">{artist.yearsOfExperience}</p>
                  <p className="font-body text-white/40 text-xs">Years Experience</p>
                </div>
                <div className="bg-white/5 p-4 text-center">
                  <Calendar className="w-6 h-6 text-pink mx-auto mb-2" />
                  <p className="font-display font-bold text-white text-xl">{artist.availability.length}</p>
                  <p className="font-body text-white/40 text-xs">Days/Week</p>
                </div>
                <div className="bg-white/5 p-4 text-center">
                  <Heart className="w-6 h-6 text-pink mx-auto mb-2" />
                  <p className="font-display font-bold text-white text-xl">{artist.reviews}</p>
                  <p className="font-body text-white/40 text-xs">Happy Clients</p>
                </div>
              </div>

              {/* Services */}
              <div>
                <h3 className="font-display font-bold text-white text-lg mb-3">Services</h3>
                <div className="flex flex-wrap gap-2">
                  {artist.services.map((service) => (
                    <span
                      key={service}
                      className="px-4 py-2 bg-white/5 text-white/70 font-body text-sm border border-white/10"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="bg-pink/10 border border-pink/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body text-white/50 text-sm">Starting from</p>
                    <p className="font-display font-black text-2xl text-pink">
                      ₦{artist.pricePerSession.toLocaleString()}
                    </p>
                  </div>
                  <p className="font-body text-white/40 text-sm">per session</p>
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div>
              {artist.portfolio.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-video bg-black">
                    <img
                      src={artist.portfolio[currentPortfolioIndex].url}
                      alt={artist.portfolio[currentPortfolioIndex].caption}
                      className="w-full h-full object-cover"
                    />
                    {/* Navigation Arrows */}
                    {artist.portfolio.length > 1 && (
                      <>
                        <button
                          onClick={prevPortfolioImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 flex items-center justify-center text-white hover:bg-pink hover:text-black transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={nextPortfolioImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 flex items-center justify-center text-white hover:bg-pink hover:text-black transition-colors"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                    {/* Caption */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                      <p className="font-body text-white">{artist.portfolio[currentPortfolioIndex].caption}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-pink text-black font-body text-xs">
                        {artist.portfolio[currentPortfolioIndex].style}
                      </span>
                    </div>
                  </div>

                  {/* Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto">
                    {artist.portfolio.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentPortfolioIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 border-2 transition-colors ${
                          index === currentPortfolioIndex ? 'border-pink' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.caption}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="font-body text-white/40">No portfolio images yet</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {artist.reviewList.length > 0 ? (
                artist.reviewList.map((review) => (
                  <div key={review.id} className="bg-white/5 p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-display font-bold text-white">{review.clientName}</p>
                        <p className="font-body text-pink text-xs">{review.serviceType}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-pink fill-pink" />
                        <span className="font-display font-bold text-white">{review.rating}</span>
                      </div>
                    </div>
                    <p className="font-body text-white/60 text-sm mb-2">{review.comment}</p>
                    <p className="font-body text-white/30 text-xs">{review.date}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="font-body text-white/40">No reviews yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 p-8 border-t border-white/10">
          <button
            onClick={() => onMessage(artist)}
            className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-white text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            {chatConfig.messageArtistText}
          </button>
          <button
            onClick={() => onBook(artist)}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-pink text-black font-display font-bold text-sm uppercase tracking-wider hover:bg-white transition-all"
          >
            <Calendar className="w-5 h-5" />
            {featuredArtistsConfig.bookNowText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfileModal;
