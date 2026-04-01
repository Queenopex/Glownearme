import { useEffect, useState } from 'react';
import { Images, Plus, Save, Trash2 } from 'lucide-react';
import { lagosLocations } from '../config';
import PortfolioStudioModal from './PortfolioStudioModal';

import type { Artist } from '../config';

interface ArtistDashboardEditorProps {
  artist: Artist | null;
  onSave: (artist: Artist) => Promise<void> | void;
}

function ArtistDashboardEditor({ artist, onSave }: ArtistDashboardEditorProps) {
  const [draft, setDraft] = useState<Artist | null>(artist);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isPortfolioStudioOpen, setIsPortfolioStudioOpen] = useState(false);

  useEffect(() => {
    setDraft(artist);
    setSaveMessage('');
  }, [artist]);

  if (!draft) {
    return (
      <section className="border border-white/10 bg-neutral-950 p-6">
        <p className="font-display text-xl font-black uppercase text-white">Artist setup</p>
        <p className="mt-3 font-body text-sm text-white/55">
          Sign in as an artist to edit your page, portfolio, services, and availability.
        </p>
      </section>
    );
  }

  const updateDraft = <K extends keyof Artist>(key: K, value: Artist[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleLocationChange = (value: string) => {
    const match = lagosLocations.find((location) => location.name === value);
    if (!match) return;

    setDraft((prev) =>
      prev
        ? {
            ...prev,
            location: `${match.name}${match.name.includes('Lagos') ? '' : ', Lagos'}`,
            area: match.area,
            coordinates: match.coordinates,
          }
        : prev,
    );
  };

  const toggleAvailability = (day: string) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            availability: prev.availability.includes(day)
              ? prev.availability.filter((item) => item !== day)
              : [...prev.availability, day],
          }
        : prev,
    );
  };

  const addService = () => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            services: [...(prev.services ?? []), `New service ${(prev.services ?? []).length + 1}`],
          }
        : prev,
    );
  };

  const updateService = (index: number, value: string) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            services: (prev.services ?? []).map((service, serviceIndex) =>
              serviceIndex === index ? value : service,
            ),
          }
        : prev,
    );
  };

  const removeService = (index: number) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            services: (prev.services ?? []).filter((_, serviceIndex) => serviceIndex !== index),
          }
        : prev,
    );
  };

  const handleSave = async () => {
    if (!draft) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      await onSave(draft);
      setSaveMessage('Artist page updated successfully.');
    } catch (error) {
      console.error('Artist profile save failed:', error);
      setSaveMessage('We could not save the artist page right now.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <section className="border border-white/10 bg-neutral-950 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-xl font-black uppercase text-white">Edit artist page</p>
            <p className="mt-2 font-body text-sm text-white/55">
              Build your profile, update availability, and control what clients see.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsPortfolioStudioOpen(true)}
              className="inline-flex items-center justify-center gap-2 border border-white/20 px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-pink hover:text-pink"
              type="button"
            >
              <Images className="h-4 w-4" />
              Open portfolio studio
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 bg-pink px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-black transition-colors hover:bg-white disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="space-y-4">
          <label className="block">
            <span className="font-body text-xs uppercase tracking-[0.16em] text-white/40">Display name</span>
            <input
              value={draft.name}
              onChange={(event) => updateDraft('name', event.target.value)}
              className="mt-2 w-full border border-white/10 bg-black px-4 py-3 font-body text-white focus:border-pink focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="font-body text-xs uppercase tracking-[0.16em] text-white/40">Specialty</span>
            <input
              value={draft.specialty}
              onChange={(event) => updateDraft('specialty', event.target.value)}
              className="mt-2 w-full border border-white/10 bg-black px-4 py-3 font-body text-white focus:border-pink focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="font-body text-xs uppercase tracking-[0.16em] text-white/40">Bio</span>
            <textarea
              value={draft.bio}
              onChange={(event) => updateDraft('bio', event.target.value)}
              rows={5}
              className="mt-2 w-full resize-none border border-white/10 bg-black px-4 py-3 font-body text-white focus:border-pink focus:outline-none"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-body text-xs uppercase tracking-[0.16em] text-white/40">Location</span>
              <select
                value={lagosLocations.find((location) => draft.location.includes(location.name))?.name ?? ''}
                onChange={(event) => handleLocationChange(event.target.value)}
                className="mt-2 w-full border border-white/10 bg-black px-4 py-3 font-body text-white focus:border-pink focus:outline-none"
              >
                <option value="">Select location</option>
                {lagosLocations.map((location) => (
                  <option key={location.name} value={location.name}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-body text-xs uppercase tracking-[0.16em] text-white/40">Starting price</span>
              <input
                type="number"
                min="0"
                value={draft.pricePerSession}
                onChange={(event) => updateDraft('pricePerSession', Number(event.target.value))}
                className="mt-2 w-full border border-white/10 bg-black px-4 py-3 font-body text-white focus:border-pink focus:outline-none"
              />
            </label>
          </div>
        </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-bold uppercase text-white">Services</p>
                <button
                  onClick={addService}
                  className="inline-flex items-center gap-2 border border-white/20 px-3 py-2 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-pink hover:text-pink"
                  type="button"
                >
                  <Plus className="h-3 w-3" />
                  Add service
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {(draft.services ?? []).map((service, index) => (
                  <div key={`${service}-${index}`} className="flex gap-2">
                    <input
                      value={service}
                      onChange={(event) => updateService(index, event.target.value)}
                      className="flex-1 border border-white/10 bg-black px-4 py-3 font-body text-white focus:border-pink focus:outline-none"
                    />
                    <button
                      onClick={() => removeService(index)}
                      className="border border-white/10 px-3 text-white/50 transition-colors hover:border-pink hover:text-pink"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-display text-sm font-bold uppercase text-white">Availability</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                  const active = (draft.availability ?? []).includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleAvailability(day)}
                      className={`px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.16em] ${
                        active
                          ? 'bg-pink text-black'
                          : 'border border-white/20 text-white/60 hover:border-pink hover:text-pink'
                      }`}
                      type="button"
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-sm font-bold uppercase text-white">Portfolio</p>
                  <p className="mt-2 font-body text-sm text-white/55">
                    {draft.portfolio?.length ?? 0} uploaded looks ready for clients to explore.
                  </p>
                </div>
                <button
                  onClick={() => setIsPortfolioStudioOpen(true)}
                  className="border border-white/20 px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-pink hover:text-pink"
                  type="button"
                >
                  Manage works
                </button>
              </div>
            </div>
          </div>
        </div>
        {saveMessage ? <p className="mt-5 font-body text-sm text-pink">{saveMessage}</p> : null}
      </section>

      <PortfolioStudioModal
        artistId={draft.id}
        isOpen={isPortfolioStudioOpen}
        onChange={(portfolio) => updateDraft('portfolio', portfolio)}
        onClose={() => setIsPortfolioStudioOpen(false)}
        portfolio={draft.portfolio ?? []}
      />
    </>
  );
}

export default ArtistDashboardEditor;
