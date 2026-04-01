'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Briefcase, Calendar, Menu, MessageCircle, Sparkles, Star, TrendingUp, X } from 'lucide-react';
import BookingModal from './components/BookingModal';
import ChatModal from './components/ChatModal';
import CustomCursor from './components/CustomCursor';
import ArtistProfileModal from './components/ArtistProfileModal';
import {
  ArtistOverviewView,
  ArtistRequestsView,
  ArtistStudioView,
  ClientConnectView,
  ClientDiscoverView,
  ClientOverviewView,
} from './components/dashboard/WorkspaceViews';
import LoginModal from './components/LoginModal';
import { featuredArtistsConfig, footerConfig, lagosLocations } from './config';
import {
  ApiRequestError,
  type AuthUser,
  fetchArtists,
  fetchArtistRequests,
  fetchBookings,
  fetchConversations,
  fetchSavedArtists,
  removeSavedArtist,
  saveArtist,
  updateArtistProfile,
} from './lib/api';

import type { Artist } from './config';

type UserRole = 'client' | 'artist';
type NavSectionId = 'overview' | 'activity' | 'network';

interface NavSection {
  id: NavSectionId;
  label: string;
  description: string;
  icon: typeof Calendar;
}

interface BookingRecord {
  id: string;
  artistId: string;
  clientId?: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  status: string;
  paymentStatus?: string;
  location: string;
  artist?: Artist;
  totalAmount?: number;
  refundAmount?: number;
  rematchEligible?: boolean;
}

interface ConversationRecord {
  id: string;
  artistId: string;
  artistName: string;
  messages: {
    id: string;
    sender: string;
    text: string;
    sentAt: string;
  }[];
}

interface ArtistClientRequest {
  id: string;
  artistId?: string;
  clientName: string;
  service: string;
  eventDate: string;
  eventTime: string;
  location: string;
  budget: string;
  status: string;
  note: string;
}

const routeStateMap: Record<string, { role: UserRole; section: NavSectionId }> = {
  '/': { role: 'client', section: 'overview' },
  '/discover': { role: 'client', section: 'activity' },
  '/connect': { role: 'client', section: 'network' },
  '/artist': { role: 'artist', section: 'overview' },
  '/artist/requests': { role: 'artist', section: 'activity' },
  '/artist/studio': { role: 'artist', section: 'network' },
};

const getRouteForState = (role: UserRole, section: NavSectionId) => {
  if (role === 'client') {
    if (section === 'overview') return '/';
    if (section === 'activity') return '/discover';
    return '/connect';
  }

  if (section === 'overview') return '/artist';
  if (section === 'activity') return '/artist/requests';
  return '/artist/studio';
};

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const normalizeValue = (value: string | undefined) => value?.trim().toLowerCase() ?? '';

const resolveArtistForSession = (sessionUser: AuthUser | null, artistList: Artist[]) => {
  if (!sessionUser || sessionUser.role !== 'artist') return null;

  const sessionArtistId = normalizeValue(sessionUser.artistId);
  const sessionName = normalizeValue(sessionUser.name);

  return (
    artistList.find((artist) => normalizeValue(artist.id) === sessionArtistId) ??
    artistList.find((artist) => normalizeValue(artist.name) === sessionName) ??
    null
  );
};

function App() {
  const pathname = usePathname();
  const router = useRouter();

  const [sessionUser, setSessionUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null;

    const rawSession = window.localStorage.getItem('glownearme-session');
    return rawSession ? (JSON.parse(rawSession) as AuthUser) : null;
  });
  const [activeRole, setActiveRole] = useState<UserRole>('client');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [savedArtists, setSavedArtists] = useState<string[]>(['1', '3', '4']);
  const [activeSection, setActiveSection] = useState<NavSectionId>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [artists, setArtists] = useState<Artist[]>(featuredArtistsConfig.artists);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [artistRequests, setArtistRequests] = useState<ArtistClientRequest[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState('Search a Lagos area or use your current location.');

  const featuredArtist = artists[0] ?? featuredArtistsConfig.artists[0];
  const ownedArtist = resolveArtistForSession(sessionUser, artists);
  const artistDashboardBookings = useMemo(
    () => (ownedArtist ? bookings.filter((booking) => booking.artistId === ownedArtist.id) : []),
    [bookings, ownedArtist],
  );

  const recommendedArtists = useMemo(() => artists.slice(0, 4), [artists]);
  const savedArtistCards = useMemo(
    () => artists.filter((artist) => savedArtists.includes(artist.id)).slice(0, 4),
    [artists, savedArtists],
  );
  const upcomingBookings = useMemo(() => bookings.slice(0, 3), [bookings]);
  const nearbyArtists = useMemo(() => {
    if (!selectedCoordinates) return [];

    return artists
      .map((artist) => ({
        artist,
        distanceKm: calculateDistance(
          selectedCoordinates.lat,
          selectedCoordinates.lng,
          artist.coordinates.lat,
          artist.coordinates.lng,
        ),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 6);
  }, [artists, selectedCoordinates]);

  const activityItems =
    activeRole === 'client'
      ? [
          {
            title: 'Upcoming bookings',
            meta: `${upcomingBookings.length} active bookings`,
            value: upcomingBookings[0]
              ? `${upcomingBookings[0].service} on ${upcomingBookings[0].date}`
              : 'No bookings yet',
          },
          {
            title: 'Saved artists',
            meta: `${savedArtists.length} profiles ready`,
            value: savedArtistCards[0]?.name ?? 'Start curating your favorites',
          },
          {
            title: 'Unread chats',
            meta: `${conversations.length} active conversations`,
            value: conversations[0]?.artistName
              ? `Latest with ${conversations[0].artistName}`
              : 'No messages yet',
          },
        ]
      : [
          {
            title: "Today's sessions",
            meta: `${artistDashboardBookings.length || 3} calendar blocks`,
            value: artistDashboardBookings[0]
              ? `${artistDashboardBookings[0].service} at ${artistDashboardBookings[0].time}`
              : 'First callout starts 09:00 AM',
          },
          {
            title: 'Incoming requests',
            meta: `${artistRequests.length} active inquiries`,
            value: artistRequests[0]?.budget ?? 'Highest budget NGN 65K',
          },
          {
            title: 'Portfolio strength',
            meta: `${ownedArtist?.portfolio.length ?? 0} featured looks`,
            value: 'Update availability and recent work',
          },
        ];

  const navSections = useMemo<NavSection[]>(
    () =>
      activeRole === 'client'
        ? [
            {
              id: 'overview',
              label: 'Home',
              description: 'Moodboard, highlights, and quick actions',
              icon: Sparkles,
            },
            {
              id: 'activity',
              label: 'Discover',
              description: 'Find nearby artists and explore their work',
              icon: Calendar,
            },
            {
              id: 'network',
              label: 'Connect',
              description: 'Saved artists, chats, and repeat bookings',
              icon: MessageCircle,
            },
          ]
        : [
            {
              id: 'overview',
              label: 'Home',
              description: 'Business pulse and active highlights',
              icon: TrendingUp,
            },
            {
              id: 'activity',
              label: 'Requests',
              description: 'Client pipeline and active opportunities',
              icon: Briefcase,
            },
            {
              id: 'network',
              label: 'Studio',
              description: 'Portfolio, profile edits, and reviews',
              icon: Star,
            },
          ],
    [activeRole],
  );

  useEffect(() => {
    const routeState = routeStateMap[pathname ?? '/'] ?? routeStateMap['/'];
    setActiveRole(routeState.role);
    setActiveSection(routeState.section);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (sessionUser?.role === 'client' && pathname?.startsWith('/artist')) {
      router.replace('/');
    }
  }, [pathname, router, sessionUser]);

  useEffect(() => {
    if (
      sessionUser?.role === 'artist' &&
      ownedArtist &&
      sessionUser.artistId !== ownedArtist.id
    ) {
      setSessionUser((prev) =>
        prev && prev.role === 'artist' ? { ...prev, artistId: ownedArtist.id } : prev,
      );
    }
  }, [ownedArtist, sessionUser]);

  useEffect(() => {
    if (sessionUser) {
      window.localStorage.setItem('glownearme-session', JSON.stringify(sessionUser));
      setIsLoginOpen(false);
    } else {
      window.localStorage.removeItem('glownearme-session');
    }
  }, [sessionUser]);

  useEffect(() => {
    if (!sessionUser) {
      setIsLoadingData(false);
      return;
    }

    let isMounted = true;
    const artistId = sessionUser.artistId;

    async function loadDashboardData() {
      try {
        const [artistsResponse, bookingsResponse, savedResponse, conversationsResponse] =
          await Promise.all([
            fetchArtists<Artist>(),
            fetchBookings<BookingRecord>(),
            fetchSavedArtists<Artist>(),
            fetchConversations(),
          ]);

        if (!isMounted) return;

        const mergedArtists = featuredArtistsConfig.artists.map((artist) => {
          const backendArtist = artistsResponse.data.find((item) => item.id === artist.id);
          return backendArtist ? { ...artist, ...backendArtist } : artist;
        });

        setArtists(mergedArtists);
        setBookings(bookingsResponse.data);
        setSavedArtists(savedResponse.data.map((artist) => artist.id));
        setConversations(conversationsResponse.data);

        if (artistId) {
          try {
            const artistRequestsResponse = await fetchArtistRequests(artistId);
            if (isMounted) {
              setArtistRequests(artistRequestsResponse.data);
            }
          } catch (error) {
            if (error instanceof ApiRequestError && error.status === 404) {
              console.warn('Artist requests endpoint is unavailable. Falling back to an empty request list.');
              if (isMounted) {
                setArtistRequests([]);
              }
            } else {
              throw error;
            }
          }
        } else if (isMounted) {
          setArtistRequests([]);
        }
      } catch (error) {
        console.error('Failed to load dashboard data from backend:', error);
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [sessionUser]);

  const jumpToSection = (sectionId: NavSectionId) => {
    const nextRoute = getRouteForState(activeRole, sectionId);
    router.push(nextRoute);
    setIsMobileMenuOpen(false);
  };

  const switchRoleView = (role: UserRole) => {
    if (role === 'artist' && sessionUser?.role === 'client') {
      return;
    }

    router.push(getRouteForState(role, 'overview'));
    setIsMobileMenuOpen(false);
  };

  const handleBook = (artist: Artist) => {
    setSelectedArtist(artist);
    setIsProfileOpen(false);
    setIsBookingOpen(true);
  };

  const handleMessage = (artist: Artist) => {
    setSelectedArtist(artist);
    setIsProfileOpen(false);
    setIsChatOpen(true);
  };

  const handleViewProfile = (artist: Artist) => {
    setSelectedArtist(artist);
    setIsProfileOpen(true);
  };

  const refreshBookings = async () => {
    try {
      const bookingsResponse = await fetchBookings<BookingRecord>();
      setBookings(bookingsResponse.data);
    } catch (error) {
      console.error('Failed to refresh bookings:', error);
    }
  };

  const refreshConversations = async () => {
    try {
      const conversationsResponse = await fetchConversations();
      setConversations(conversationsResponse.data);
    } catch (error) {
      console.error('Failed to refresh conversations:', error);
    }
  };

  const handleArtistProfileSave = async (updatedArtist: Artist) => {
    await updateArtistProfile<Artist>(updatedArtist.id, updatedArtist);
    setArtists((prev) =>
      prev.map((artist) => (artist.id === updatedArtist.id ? updatedArtist : artist)),
    );
    setSelectedArtist((prev) => (prev?.id === updatedArtist.id ? updatedArtist : prev));
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setSessionUser(user);
    setIsLoginOpen(false);
    router.push(getRouteForState(user.role, 'overview'));
  };

  const handleOpenLogin = (role: UserRole = activeRole) => {
    if (role === 'artist' && sessionUser?.role === 'client') {
      return;
    }

    setActiveRole(role);
    setIsLoginOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setSessionUser(null);
    setIsLoginOpen(true);
    setIsBookingOpen(false);
    setIsChatOpen(false);
    setIsProfileOpen(false);
  };

  const handleLocationSelect = (location: string) => {
    if (!location) {
      setSelectedLocationName('');
      setSelectedCoordinates(null);
      setLocationStatus('Search a Lagos area or use your current location.');
      return;
    }

    if (location === 'current') {
      if (!navigator.geolocation) {
        setLocationStatus('Current location is not supported in this browser.');
        return;
      }

      setLocationStatus('Finding artists close to your current location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedLocationName('Your current location');
          setSelectedCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationStatus('Closest artists ranked from your live location.');
        },
        () => {
          setLocationStatus('We could not access your location. Try selecting a Lagos area instead.');
        },
      );
      return;
    }

    const matchedLocation = lagosLocations.find(
      (item) => item.name.toLowerCase() === location.toLowerCase(),
    );

    if (matchedLocation) {
      setSelectedLocationName(matchedLocation.name);
      setSelectedCoordinates(matchedLocation.coordinates);
      setLocationStatus(`Showing artists closest to ${matchedLocation.name}.`);
      return;
    }

    setSelectedLocationName(location);
    setSelectedCoordinates(null);
    setLocationStatus('Choose one of the Lagos suggestions to rank artists by distance.');
  };

  const toggleSavedArtist = (artistId: string) => {
    const clientId = 'client-1';
    const isSaved = savedArtists.includes(artistId);

    setSavedArtists((prev) =>
      isSaved ? prev.filter((id) => id !== artistId) : [...prev, artistId],
    );

    const request = isSaved ? removeSavedArtist(clientId, artistId) : saveArtist(clientId, artistId);
    request.catch((error) => {
      console.error('Failed to update saved artists:', error);
      setSavedArtists((prev) =>
        isSaved ? [...prev, artistId] : prev.filter((id) => id !== artistId),
      );
    });
  };

  const currentView =
    activeRole === 'client'
      ? activeSection === 'overview'
        ? (
            <ClientOverviewView
              activityItems={activityItems}
              conversations={conversations}
              isLoadingData={isLoadingData}
              onBook={handleBook}
              onMessage={handleMessage}
              onNavigateToDiscover={() => jumpToSection('activity')}
              onToggleSaved={toggleSavedArtist}
              onViewProfile={handleViewProfile}
              recommendedArtists={recommendedArtists}
              savedArtistCards={savedArtistCards}
              savedArtists={savedArtists}
              upcomingBookings={upcomingBookings}
            />
          )
        : activeSection === 'activity'
          ? (
              <ClientDiscoverView
                locationStatus={locationStatus}
                nearbyArtists={nearbyArtists}
                onBook={handleBook}
                onLocationSelect={handleLocationSelect}
                onMessage={handleMessage}
                onToggleSaved={toggleSavedArtist}
                onViewProfile={handleViewProfile}
                recommendedArtists={recommendedArtists}
                savedArtists={savedArtists}
                selectedCoordinates={selectedCoordinates}
                selectedLocationName={selectedLocationName}
              />
            )
          : (
              <ClientConnectView
                artists={artists}
                conversations={conversations}
                currentArtist={featuredArtist}
                onBook={handleBook}
                onMessage={handleMessage}
                onToggleSaved={toggleSavedArtist}
                onViewProfile={handleViewProfile}
                savedArtistCards={savedArtistCards}
                savedArtists={savedArtists}
              />
            )
      : !ownedArtist
        ? (
            <section className="border border-white/10 bg-neutral-950 p-6">
              <p className="font-display text-2xl font-semibold text-white">Artist workspace unavailable</p>
              <p className="mt-3 max-w-2xl font-body text-sm leading-7 text-white/60">
                Client accounts can discover, message, and book artists, but they cannot open another
                artist&apos;s dashboard. Sign in with an artist account to manage a studio profile.
              </p>
            </section>
          )
        : activeSection === 'overview'
        ? (
            <ArtistOverviewView
              activityItems={activityItems}
              artistRequests={artistRequests}
              currentArtist={ownedArtist}
              isLoadingData={isLoadingData}
              onNavigateToStudio={() => jumpToSection('network')}
              onViewProfile={handleViewProfile}
            />
          )
        : activeSection === 'activity'
          ? (
              <ArtistRequestsView
                artistRequests={artistRequests}
                onReplyToClient={() => handleMessage(ownedArtist)}
                upcomingBookings={artistDashboardBookings}
              />
            )
          : <ArtistStudioView currentArtist={ownedArtist} onSaveArtist={handleArtistProfileSave} />;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <div className="grain-overlay" />
      <CustomCursor />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(255,115,195,0.24),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[24rem] h-[36rem] bg-[radial-gradient(circle_at_20%_20%,rgba(255,183,77,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,115,195,0.12),transparent_40%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-40 border border-white/10 bg-black/80 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <button onClick={() => jumpToSection('overview')} className="text-left" data-cursor-hover type="button">
              <p className="font-display text-2xl font-black tracking-tight">
                GLOW<span className="text-pink">NEARME</span>
              </p>
              <p className="font-body text-sm text-white/45">
                {activeRole === 'client' ? 'Beauty discovery lounge' : 'Artist studio workspace'}
              </p>
            </button>

            <div className="hidden items-center gap-2 lg:flex">
              {navSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => jumpToSection(section.id)}
                  className={`nav-pill ${activeSection === section.id ? 'nav-pill-active' : ''}`}
                  data-cursor-hover
                  type="button"
                >
                  {section.label}
                </button>
              ))}
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <div className="inline-flex border border-white/10 bg-white/5 p-1">
                {(['client', 'artist'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => switchRoleView(role)}
                    disabled={role === 'artist' && sessionUser?.role === 'client'}
                    className={`px-4 py-2 font-display text-xs font-medium tracking-[0.08em] ${
                      activeRole === role
                        ? 'bg-pink text-black'
                        : role === 'artist' && sessionUser?.role === 'client'
                          ? 'cursor-not-allowed text-white/25'
                          : 'text-white/60 hover:text-white'
                    }`}
                    type="button"
                  >
                    {role} view
                  </button>
                ))}
              </div>

              {sessionUser ? (
                <button
                  onClick={handleLogout}
                  className="border border-white/15 px-4 py-2 font-display text-xs font-medium tracking-[0.08em] text-white transition-colors hover:border-pink hover:text-pink"
                  type="button"
                >
                  Log out
                </button>
              ) : (
                <button
                  onClick={() => handleOpenLogin(activeRole)}
                  className="border border-white/15 px-4 py-2 font-display text-xs font-medium tracking-[0.08em] text-white transition-colors hover:border-pink hover:text-pink"
                  type="button"
                >
                  Log in
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center border border-white/10 bg-white/[0.04] lg:hidden"
              aria-label="Toggle navigation"
              type="button"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {isMobileMenuOpen ? (
            <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 lg:hidden">
              <div className="inline-flex border border-white/10 bg-white/5 p-1">
                {(['client', 'artist'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => switchRoleView(role)}
                    disabled={role === 'artist' && sessionUser?.role === 'client'}
                    className={`flex-1 px-4 py-2 font-display text-xs font-medium tracking-[0.08em] ${
                      activeRole === role
                        ? 'bg-pink text-black'
                        : role === 'artist' && sessionUser?.role === 'client'
                          ? 'cursor-not-allowed text-white/25'
                          : 'text-white/60 hover:text-white'
                    }`}
                    type="button"
                  >
                    {role}
                  </button>
                ))}
              </div>
              {navSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => jumpToSection(section.id)}
                  className="flex items-center justify-between border border-white/10 bg-white/[0.03] px-4 py-3 text-left"
                  type="button"
                >
                  <div>
                    <span className="font-display text-sm font-semibold text-white">{section.label}</span>
                    <p className="mt-1 font-body text-xs text-white/45">{section.description}</p>
                  </div>
                  <section.icon className="h-4 w-4 text-pink" />
                </button>
              ))}
              {!sessionUser ? (
                <button
                  onClick={() => handleOpenLogin(activeRole)}
                  className="border border-white/10 bg-white/[0.03] px-4 py-3 text-left font-display text-sm font-semibold text-white"
                  type="button"
                >
                  Open login
                </button>
              ) : null}
            </div>
          ) : null}
        </header>

        <main className="flex-1 py-6">
          {!sessionUser ? (
            <section className="mb-6 border border-white/10 bg-neutral-950 p-6 text-center">
              <p className="font-display text-2xl font-black uppercase text-white">Sign in to continue</p>
              <p className="mt-3 font-body text-white/55">Demo client: `maya@glownearme.com` / `demo123`</p>
              <p className="font-body text-white/55">Demo artist: `chioma@glownearme.com` / `demo123`</p>
              <button
                onClick={() => handleOpenLogin(activeRole)}
                className="mt-5 bg-pink px-5 py-3 font-display text-sm font-bold uppercase tracking-[0.16em] text-black transition-colors hover:bg-white"
                type="button"
              >
                Open login
              </button>
            </section>
          ) : null}

          <div className={sessionUser ? '' : 'pointer-events-none opacity-35 blur-[2px]'}>{currentView}</div>
        </main>

        <footer className="border border-white/10 bg-neutral-950 px-6 py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-display text-lg font-black uppercase">
                {footerConfig.logo}
                <span className="text-pink">{footerConfig.logoAccent}</span>
              </p>
              <p className="font-body text-sm text-white/45">{footerConfig.brandDescription}</p>
            </div>
            <p className="font-body text-xs uppercase tracking-[0.22em] text-white/30">
              Spread across dedicated views for easier discovery and artist management
            </p>
          </div>
        </footer>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        artist={selectedArtist}
        onBookingCreated={refreshBookings}
      />
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        artist={selectedArtist}
        onConversationUpdated={refreshConversations}
      />
      <ArtistProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        artist={selectedArtist}
        onBook={handleBook}
        onMessage={handleMessage}
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        defaultType={activeRole}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
