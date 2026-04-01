import type { ReactNode } from 'react';
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Check,
  Clock3,
  CreditCard,
  Heart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import ArtistDashboardEditor from '../ArtistDashboardEditor';
import LocationSearch from '../LocationSearch';

import type { Artist } from '../../config';

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

interface ActivityItem {
  title: string;
  meta: string;
  value: string;
}

const formatBookingStatus = (status: string) => {
  switch (status) {
    case 'pending_artist_response':
      return 'Awaiting artist';
    case 'accepted':
      return 'Accepted';
    case 'declined':
      return 'Declined and refunded';
    case 'cancelled_by_artist':
      return 'Artist cancelled';
    default:
      return status.replace(/_/g, ' ');
  }
};

interface CommonArtistActions {
  onBook: (artist: Artist) => void;
  onMessage: (artist: Artist) => void;
  onToggleSaved: (artistId: string) => void;
  onViewProfile: (artist: Artist) => void;
}

interface PageIntroProps {
  eyebrow: string;
  title: string;
  body: string;
}

function PageIntro({ eyebrow, title, body }: PageIntroProps) {
  return (
    <section className="border border-white/10 bg-[linear-gradient(135deg,rgba(255,115,195,0.16),rgba(255,255,255,0.03))] p-6 sm:p-8">
      <p className="font-body text-[11px] tracking-[0.18em] text-pink/85">{eyebrow}</p>
      <h1 className="mt-4 max-w-4xl font-display text-2xl font-bold leading-[1.02] text-white sm:text-[2.8rem]">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl font-body text-[15px] leading-7 text-white/62">{body}</p>
    </section>
  );
}

interface ArtistShowcaseCardProps extends CommonArtistActions {
  artist: Artist;
  saved: boolean;
  distanceLabel?: string;
  showMessage?: boolean;
}

function ArtistShowcaseCard({
  artist,
  saved,
  onViewProfile,
  onBook,
  onToggleSaved,
  onMessage,
  distanceLabel,
  showMessage = false,
}: ArtistShowcaseCardProps) {
  return (
    <article className="spotlight-panel">
      <img alt={artist.name} className="h-56 w-full object-cover" src={artist.portfolio[0]?.url ?? artist.image} />
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => onViewProfile(artist)}
            className="text-left font-display text-lg font-semibold text-white transition-colors hover:text-pink"
            type="button"
          >
            {artist.name}
          </button>
          <p className="mt-2 font-body text-sm text-pink">{artist.specialty}</p>
          <p className="mt-2 font-body text-sm text-white/50">{distanceLabel ?? artist.location}</p>
        </div>
        <span className="glass-stat">
          <Star className="h-4 w-4 text-pink" />
          {artist.rating.toFixed(1)}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {artist.portfolio.slice(0, 3).map((work) => (
          <span key={work.id} className="gallery-chip">
            {work.style}
          </span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => onViewProfile(artist)}
          className="border border-white/20 px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-pink hover:text-pink"
          type="button"
        >
          Check works
        </button>
        {showMessage ? (
          <button
            onClick={() => onMessage(artist)}
            className="border border-white/20 px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-pink hover:text-pink"
            type="button"
          >
            Message
          </button>
        ) : null}
        <button
          onClick={() => onToggleSaved(artist.id)}
          className={`border px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.16em] ${
            saved
              ? 'border-pink bg-pink/10 text-pink'
              : 'border-white/20 text-white transition-colors hover:border-pink hover:text-pink'
          }`}
          type="button"
        >
          {saved ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={() => onBook(artist)}
          className="bg-pink px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-black transition-colors hover:bg-white"
          type="button"
        >
          Book now
        </button>
      </div>
    </article>
  );
}

interface ClientRequestCardProps {
  request: ArtistClientRequest;
  onReply: () => void;
}

function ClientRequestCard({ request, onReply }: ClientRequestCardProps) {
  return (
    <div className="border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-lg font-bold uppercase text-white">{request.clientName}</p>
            <span className="border border-pink/30 bg-pink/10 px-3 py-1 font-body text-[11px] uppercase tracking-[0.2em] text-pink">
              {request.status}
            </span>
          </div>
          <p className="mt-2 font-body text-sm text-pink">{request.service}</p>
          <p className="mt-1 font-body text-sm text-white/50">
            {request.eventDate} at {request.eventTime} • {request.location}
          </p>
          <p className="mt-3 font-body text-sm text-white/60">{request.note}</p>
        </div>

        <div className="text-left md:text-right">
          <p className="font-body text-xs uppercase tracking-[0.18em] text-white/35">Client budget</p>
          <p className="font-display text-xl font-black text-white">{request.budget}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onReply}
          className="border border-white/20 px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-pink hover:text-pink"
          type="button"
        >
          Reply to client
        </button>
        <button
          className="border border-white/20 px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-pink hover:text-pink"
          type="button"
        >
          Send quote
        </button>
        <button
          className="bg-pink px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-black transition-colors hover:bg-white"
          type="button"
        >
          Accept request
        </button>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-white/10 bg-black/20 p-5">
      <p className="font-body text-sm text-white/50">{text}</p>
    </div>
  );
}

interface MetricCardProps {
  icon: typeof Calendar;
  label: string;
  value: string;
}

function MetricCard({ icon: Icon, label, value }: MetricCardProps) {
  return (
    <div className="border border-white/10 bg-white/[0.03] p-4">
      <Icon className="h-5 w-5 text-pink" />
      <p className="mt-4 font-display text-xl font-black uppercase text-white">{value}</p>
      <p className="font-body text-xs uppercase tracking-[0.18em] text-white/35">{label}</p>
    </div>
  );
}

interface PulseRowProps {
  label: string;
  value: string;
}

function PulseRow({ label, value }: PulseRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
      <p className="font-body text-sm text-white/45">{label}</p>
      <p className="font-display text-sm font-bold uppercase text-white">{value}</p>
    </div>
  );
}

interface PanelProps {
  title: string;
  action: string;
  icon: typeof Calendar;
  children: ReactNode;
}

function Panel({ title, action, icon: Icon, children }: PanelProps) {
  return (
    <section className="border border-white/10 bg-neutral-950 p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="border border-pink/30 bg-pink/10 p-2 text-pink">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-xl font-black uppercase text-white">{title}</h2>
            <p className="font-body text-xs uppercase tracking-[0.18em] text-white/30">{action}</p>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

export interface ClientOverviewViewProps extends CommonArtistActions {
  isLoadingData: boolean;
  recommendedArtists: Artist[];
  activityItems: ActivityItem[];
  upcomingBookings: BookingRecord[];
  savedArtists: string[];
  savedArtistCards: Artist[];
  conversations: ConversationRecord[];
  onNavigateToDiscover: () => void;
}

export function ClientOverviewView({
  isLoadingData,
  recommendedArtists,
  activityItems,
  upcomingBookings,
  savedArtists,
  savedArtistCards,
  conversations,
  onBook,
  onMessage,
  onToggleSaved,
  onViewProfile,
  onNavigateToDiscover,
}: ClientOverviewViewProps) {
  return (
    <div className="page-shell">
      <section className="page-hero">
        <div>
          <span className="page-kicker">Client moodboard</span>
          {isLoadingData ? (
            <p className="mt-4 font-body text-sm text-white/45">Syncing live backend data...</p>
          ) : null}
          <h1 className="mt-6 max-w-3xl font-display text-[2.6rem] font-bold leading-[0.95] text-white sm:text-[3.4rem] lg:text-[4.2rem]">
            Find your artist, explore the work, and book the glow with room to breathe.
          </h1>
          <p className="mt-5 max-w-2xl font-body text-[15px] leading-7 text-white/62">
            This experience now spreads discovery, messaging, and favorites across separate views so
            makeup lovers can browse without the dashboard feeling squeezed together.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={onNavigateToDiscover}
              className="inline-flex items-center gap-2 bg-pink px-5 py-3 font-display text-sm font-semibold tracking-[0.04em] text-black transition-colors hover:bg-white"
              type="button"
            >
              Start discovering
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewProfile(recommendedArtists[0])}
              className="inline-flex items-center gap-2 border border-white/15 px-5 py-3 font-display text-sm font-medium tracking-[0.04em] text-white transition-colors hover:border-pink hover:text-pink"
              type="button"
            >
              View featured portfolio
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="spotlight-panel">
          <p className="font-body text-xs uppercase tracking-[0.22em] text-white/40">Tonight&apos;s spotlight</p>
          <img
            alt={recommendedArtists[0].name}
            className="mt-5 h-72 w-full object-cover"
            src={recommendedArtists[0].portfolio[0]?.url ?? recommendedArtists[0].image}
          />
          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-[1.8rem] font-semibold text-white">
                {recommendedArtists[0].name}
              </p>
              <p className="mt-2 font-body text-sm text-pink">{recommendedArtists[0].specialty}</p>
              <p className="mt-2 font-body text-sm text-white/55">{recommendedArtists[0].location}</p>
            </div>
            <div className="glass-stat">
              <Star className="h-4 w-4 text-pink" />
              <span>{recommendedArtists[0].rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {recommendedArtists[0].services.slice(0, 3).map((service) => (
              <span key={service} className="gallery-chip">
                {service}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="At a glance" action="Your beauty plan" icon={Sparkles}>
          <div className="grid gap-3 md:grid-cols-3">
            {activityItems.map((item) => (
              <div key={item.title} className="navigator-card">
                <p className="font-display text-base font-semibold text-white">{item.title}</p>
                <p className="mt-3 font-body text-sm text-white/45">{item.meta}</p>
                <p className="mt-6 font-body text-sm text-pink">{item.value}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Account snapshot" action="Live workspace pulse" icon={ShieldCheck}>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard icon={Calendar} label="Upcoming" value={String(upcomingBookings.length)} />
            <MetricCard icon={Heart} label="Saved" value={String(savedArtists.length)} />
            <MetricCard icon={MessageCircle} label="Chats" value={String(conversations.length)} />
            <MetricCard icon={CreditCard} label="Deposits" value="3" />
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Upcoming moments" action="Confirmed beauty sessions" icon={Calendar}>
          <div className="space-y-3">
            {upcomingBookings.length ? (
              upcomingBookings.map((booking) => (
                <div key={booking.id} className="border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-sm font-bold uppercase text-white">{booking.service}</p>
                      <p className="mt-2 font-body text-sm text-white/50">
                        {booking.date} at {booking.time}
                      </p>
                      <p className="mt-1 font-body text-sm text-pink">{booking.location}</p>
                    </div>
                    <span className="border border-pink/30 bg-pink/10 px-3 py-1 font-body text-[11px] uppercase tracking-[0.2em] text-pink">
                      {formatBookingStatus(booking.status)}
                    </span>
                  </div>
                  {booking.paymentStatus ? (
                    <p className="mt-3 font-body text-xs uppercase tracking-[0.14em] text-white/35">
                      Payment: {booking.paymentStatus}
                    </p>
                  ) : null}
                  {booking.rematchEligible ? (
                    <p className="mt-2 font-body text-xs text-pink">
                      Refund processed. We can rematch you if alternatives cost more.
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <EmptyState text="No bookings yet. Start with Discover to find artists near you." />
            )}
          </div>
        </Panel>

        <Panel title="Saved energy" action="Profiles worth revisiting" icon={Heart}>
          <div className="grid gap-4 md:grid-cols-2">
            {savedArtistCards.length ? (
              savedArtistCards.map((artist) => (
                <ArtistShowcaseCard
                  key={artist.id}
                  artist={artist}
                  onBook={onBook}
                  onMessage={onMessage}
                  onToggleSaved={onToggleSaved}
                  onViewProfile={onViewProfile}
                  saved={savedArtists.includes(artist.id)}
                  showMessage
                />
              ))
            ) : (
              <EmptyState text="No saved artists yet. Save a few looks you love and they’ll appear here." />
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

export interface ClientDiscoverViewProps extends CommonArtistActions {
  locationStatus: string;
  selectedCoordinates: { lat: number; lng: number } | null;
  selectedLocationName: string;
  nearbyArtists: { artist: Artist; distanceKm: number }[];
  recommendedArtists: Artist[];
  savedArtists: string[];
  onLocationSelect: (location: string) => void;
}

export function ClientDiscoverView({
  locationStatus,
  selectedCoordinates,
  selectedLocationName,
  nearbyArtists,
  recommendedArtists,
  savedArtists,
  onBook,
  onMessage,
  onToggleSaved,
  onViewProfile,
  onLocationSelect,
}: ClientDiscoverViewProps) {
  return (
    <div className="page-shell">
      <PageIntro
        eyebrow="Discover nearby artists"
        title="Search by location, compare styles, and open portfolios without crowding the screen."
        body="Clients can search Lagos areas, sort by closeness, and move into artist profiles or booking without staying trapped on one oversized page."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Near you" action="Live distance ranking" icon={Calendar}>
          <div className="border border-white/10 bg-white/[0.03] p-4">
            <p className="font-display text-lg font-semibold text-white">Find artists close to you</p>
            <p className="mt-2 font-body text-sm text-white/55">{locationStatus}</p>
            <div className="mt-5">
              <LocationSearch onLocationSelect={onLocationSelect} />
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {selectedCoordinates ? (
              nearbyArtists.length ? (
                nearbyArtists.map(({ artist, distanceKm }) => (
                  <ArtistShowcaseCard
                    key={`nearby-${artist.id}`}
                    artist={artist}
                    distanceLabel={`${distanceKm.toFixed(1)} km away`}
                    onBook={onBook}
                    onMessage={onMessage}
                    onToggleSaved={onToggleSaved}
                    onViewProfile={onViewProfile}
                    saved={savedArtists.includes(artist.id)}
                    showMessage
                  />
                ))
              ) : (
                <EmptyState text={`No artist matches were found close to ${selectedLocationName}.`} />
              )
            ) : (
              <EmptyState text="Pick a Lagos area or use your current location to rank artists by distance." />
            )}
          </div>
        </Panel>

        <Panel title="Featured portfolios" action="Open a profile to see more" icon={Sparkles}>
          <div className="grid gap-4 md:grid-cols-2">
            {recommendedArtists.map((artist) => (
              <button
                key={artist.id}
                className="spotlight-panel text-left transition-transform hover:-translate-y-1"
                onClick={() => onViewProfile(artist)}
                type="button"
              >
                <img
                  alt={artist.name}
                  className="h-52 w-full object-cover"
                  src={artist.portfolio[0]?.url ?? artist.image}
                />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold text-white">{artist.name}</p>
                    <p className="mt-2 font-body text-sm text-pink">{artist.specialty}</p>
                    <p className="mt-2 font-body text-sm text-white/50">{artist.location}</p>
                  </div>
                  <span className="glass-stat">
                    <Star className="h-4 w-4 text-pink" />
                    {artist.rating.toFixed(1)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

export interface ClientConnectViewProps extends CommonArtistActions {
  savedArtistCards: Artist[];
  savedArtists: string[];
  conversations: ConversationRecord[];
  artists: Artist[];
  currentArtist: Artist;
}

export function ClientConnectView({
  savedArtistCards,
  savedArtists,
  conversations,
  artists,
  currentArtist,
  onBook,
  onMessage,
  onToggleSaved,
  onViewProfile,
}: ClientConnectViewProps) {
  return (
    <div className="page-shell">
      <PageIntro
        eyebrow="Saved artists and inbox"
        title="Keep conversations and favorites in their own space so reconnecting feels easy."
        body="This view is focused on returning to artists you love, reopening chats, and jumping back into booking without visual clutter."
      />

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Saved artists" action="Reopen profiles or book again" icon={Heart}>
          <div className="grid gap-4 md:grid-cols-2">
            {savedArtistCards.length ? (
              savedArtistCards.map((artist) => (
                <ArtistShowcaseCard
                  key={artist.id}
                  artist={artist}
                  onBook={onBook}
                  onMessage={onMessage}
                  onToggleSaved={onToggleSaved}
                  onViewProfile={onViewProfile}
                  saved={savedArtists.includes(artist.id)}
                  showMessage
                />
              ))
            ) : (
              <EmptyState text="No saved artists yet. Tap save on any artist you want to revisit." />
            )}
          </div>
        </Panel>

        <Panel title="Recent conversations" action="Open inbox" icon={MessageCircle}>
          <div className="space-y-3">
            {(conversations.length ? conversations : artists.slice(0, 3)).map((item, index) => {
              const linkedArtist =
                'artistId' in item
                  ? artists.find((artist) => artist.id === item.artistId) ?? currentArtist
                  : artists.find((artist) => artist.id === item.id) ?? currentArtist;

              return (
                <button
                  key={'artistName' in item ? item.id : `${item.id}-${index}`}
                  onClick={() => onMessage(linkedArtist)}
                  className="flex w-full items-start justify-between border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:border-pink/50"
                  type="button"
                >
                  <div>
                    <p className="font-display text-sm font-bold uppercase text-white">
                      {'artistName' in item ? item.artistName : item.name}
                    </p>
                    <p className="mt-1 font-body text-sm text-white/60">
                      {'messages' in item
                        ? item.messages[item.messages.length - 1]?.text ?? 'No messages yet.'
                        : index === 0
                          ? 'Can you do a soft glam look for a 10 AM session?'
                          : index === 1
                            ? 'I sent over my event brief and reference photos.'
                            : 'Thanks, your booking deposit has been confirmed.'}
                    </p>
                  </div>
                  <span className="font-body text-xs text-white/35">
                    {'messages' in item
                      ? new Date(item.messages[item.messages.length - 1]?.sentAt ?? Date.now()).toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit',
                        })
                      : index === 0
                        ? '2m'
                        : index === 1
                          ? '1h'
                          : 'Yesterday'}
                  </span>
                </button>
              );
            })}
          </div>
        </Panel>
      </section>
    </div>
  );
}

export interface ArtistOverviewViewProps {
  isLoadingData: boolean;
  currentArtist: Artist;
  activityItems: ActivityItem[];
  artistRequests: ArtistClientRequest[];
  onNavigateToStudio: () => void;
  onViewProfile: (artist: Artist) => void;
}

export function ArtistOverviewView({
  isLoadingData,
  currentArtist,
  activityItems,
  artistRequests,
  onNavigateToStudio,
  onViewProfile,
}: ArtistOverviewViewProps) {
  return (
    <div className="page-shell">
      <section className="page-hero">
        <div>
          <span className="page-kicker">Artist home</span>
          {isLoadingData ? (
            <p className="mt-4 font-body text-sm text-white/45">Syncing live backend data...</p>
          ) : null}
          <h1 className="mt-6 max-w-3xl font-display text-[2.5rem] font-bold leading-[0.96] text-white sm:text-[3.2rem] lg:text-[3.9rem]">
            Run your beauty business from a calmer studio instead of one crowded dashboard wall.
          </h1>
          <p className="mt-5 max-w-2xl font-body text-[15px] leading-7 text-white/62">
            Requests, profile editing, availability, and portfolio curation now live in distinct views,
            which gives artists more breathing room to manage their brand.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={onNavigateToStudio}
              className="inline-flex items-center gap-2 bg-pink px-5 py-3 font-display text-sm font-semibold tracking-[0.04em] text-black transition-colors hover:bg-white"
              type="button"
            >
              Open studio
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewProfile(currentArtist)}
              className="inline-flex items-center gap-2 border border-white/15 px-5 py-3 font-display text-sm font-medium tracking-[0.04em] text-white transition-colors hover:border-pink hover:text-pink"
              type="button"
            >
              Preview public page
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="spotlight-panel">
          <p className="font-body text-xs uppercase tracking-[0.22em] text-white/40">Brand spotlight</p>
          <img
            alt={currentArtist.name}
            className="mt-5 h-72 w-full object-cover"
            src={currentArtist.portfolio[0]?.url ?? currentArtist.image}
          />
          <div className="mt-5">
            <p className="font-display text-[1.8rem] font-semibold text-white">{currentArtist.name}</p>
            <p className="mt-2 font-body text-sm text-pink">{currentArtist.specialty}</p>
            <p className="mt-2 font-body text-sm text-white/55">{currentArtist.location}</p>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <MetricCard icon={TrendingUp} label="Revenue" value="NGN 485K" />
            <MetricCard icon={Calendar} label="Bookings" value="18" />
            <MetricCard icon={Clock3} label="Response" value="1 hr" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Business pulse" action="Daily momentum" icon={TrendingUp}>
          <div className="grid gap-3 md:grid-cols-3">
            {activityItems.map((item) => (
              <div key={item.title} className="navigator-card">
                <p className="font-display text-base font-semibold text-white">{item.title}</p>
                <p className="mt-3 font-body text-sm text-white/45">{item.meta}</p>
                <p className="mt-6 font-body text-sm text-pink">{item.value}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Quick pulse" action="What needs attention" icon={ShieldCheck}>
          <div className="space-y-4">
            <PulseRow label="New inquiries today" value={`${artistRequests.length || 3} waiting`} />
            <PulseRow
              label="Profile strength"
              value={`${Math.min(100, 70 + (currentArtist.portfolio.length ?? 0) * 5)}% complete`}
            />
            <PulseRow label="Repeat clients" value="11 this quarter" />
          </div>
        </Panel>
      </section>
    </div>
  );
}

export interface ArtistRequestsViewProps {
  artistRequests: ArtistClientRequest[];
  upcomingBookings: BookingRecord[];
  onReplyToClient: () => void;
}

export function ArtistRequestsView({
  artistRequests,
  upcomingBookings,
  onReplyToClient,
}: ArtistRequestsViewProps) {
  return (
    <div className="page-shell">
      <PageIntro
        eyebrow="Current pipeline"
        title="See client requests in a dedicated workflow instead of mixing them with artist discovery."
        body="This page is now focused on incoming client demand, budgets, event timing, and the next action you want to take."
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Client requests" action="Manage inquiries" icon={Briefcase}>
          <div className="space-y-4">
            {artistRequests.length ? (
              artistRequests.map((request) => (
                <ClientRequestCard key={request.id} request={request} onReply={onReplyToClient} />
              ))
            ) : (
              <EmptyState text="No client requests yet. New inquiries will land here for the signed-in artist." />
            )}
          </div>
        </Panel>

        <Panel title="Upcoming bookings" action="Calendar pulse" icon={Calendar}>
          <div className="space-y-3">
            {upcomingBookings.length ? (
              upcomingBookings.map((booking) => (
                <div key={booking.id} className="border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-display text-sm font-bold uppercase text-white">{booking.clientName}</p>
                  <p className="mt-2 font-body text-sm text-pink">{booking.service}</p>
                  <p className="mt-2 font-body text-sm text-white/55">
                    {booking.date} at {booking.time}
                  </p>
                  <p className="mt-1 font-body text-sm text-white/45">{booking.location}</p>
                  {booking.paymentStatus ? (
                    <p className="mt-2 font-body text-xs uppercase tracking-[0.14em] text-white/35">
                      Payment: {booking.paymentStatus}
                    </p>
                  ) : null}
                  {booking.rematchEligible ? (
                    <p className="mt-2 font-body text-xs text-pink">
                      Refund protection active. Rematch available if a replacement costs more.
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <EmptyState text="No active bookings right now. Accepted requests and bookings will show up here." />
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}

export interface ArtistStudioViewProps {
  currentArtist: Artist;
  onSaveArtist: (artist: Artist) => Promise<void> | void;
}

export function ArtistStudioView({ currentArtist, onSaveArtist }: ArtistStudioViewProps) {
  return (
    <div className="page-shell">
      <PageIntro
        eyebrow="Studio"
        title="Manage your profile, upload portfolio pictures, and update availability in a dedicated workspace."
        body="Portfolio editing now lives in its own modal with real file upload from device, while the rest of your page controls stay here."
      />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <ArtistDashboardEditor artist={currentArtist} onSave={onSaveArtist} />
        </div>

        <div className="grid gap-6">
          <Panel title="Public reputation" action="Latest reviews" icon={Star}>
            <div className="space-y-3">
              {currentArtist.reviewList.slice(0, 3).map((review) => (
                <div key={review.id} className="border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-sm font-bold uppercase text-white">{review.clientName}</p>
                    <span className="font-body text-xs text-pink">{review.rating}/5</span>
                  </div>
                  <p className="mt-2 font-body text-sm text-white/60">{review.comment}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Profile checklist" action="Complete setup" icon={Check}>
            <div className="space-y-3">
              {[
                'Portfolio uploaded',
                'Bank details verified',
                'Availability updated',
                'Respond to pending inquiries',
              ].map((task, index) => (
                <div
                  key={task}
                  className="flex items-center justify-between border border-white/10 bg-white/[0.03] p-4"
                >
                  <p className="font-body text-sm text-white/75">{task}</p>
                  <span className="font-body text-xs uppercase tracking-[0.16em] text-white/40">
                    {index < 2 ? 'Done' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}
