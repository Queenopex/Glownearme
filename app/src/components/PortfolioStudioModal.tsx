import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Save, Trash2, Upload, X } from 'lucide-react';
import gsap from 'gsap';
import { uploadPortfolioImages } from '../lib/api';

import type { PortfolioImage } from '../config';

interface PortfolioStudioModalProps {
  artistId: string;
  isOpen: boolean;
  onClose: () => void;
  portfolio: PortfolioImage[];
  onChange: (portfolio: PortfolioImage[]) => void;
}

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

function PortfolioStudioModal({
  artistId,
  isOpen,
  onClose,
  portfolio,
  onChange,
}: PortfolioStudioModalProps) {
  const [draftPortfolio, setDraftPortfolio] = useState<PortfolioImage[]>(portfolio);
  const [isUploading, setIsUploading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftPortfolio(portfolio);
  }, [portfolio]);

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      gsap.fromTo(
        contentRef.current,
        { y: 40, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out', delay: 0.05 },
      );
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const totalWorks = useMemo(() => draftPortfolio.length, [draftPortfolio]);

  const updateItem = (id: string, key: 'caption' | 'style', value: string) => {
    setDraftPortfolio((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  };

  const removeItem = (id: string) => {
    setDraftPortfolio((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files?.length) return;

    setIsUploading(true);

    try {
      const preparedFiles = await Promise.all(
        Array.from(files).map(async (file) => ({
          name: file.name,
          dataUrl: await fileToDataUrl(file),
        })),
      );
      const response = await uploadPortfolioImages({
        artistId,
        files: preparedFiles,
      });
      const uploadedItems = response.data;

      setDraftPortfolio((prev) => [...uploadedItems, ...prev]);
    } catch (error) {
      console.error('Portfolio upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onChange(draftPortfolio);
    onClose();
  };

  const handleClose = () => {
    setDraftPortfolio(portfolio);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 opacity-0 backdrop-blur-md"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden border border-white/10 bg-[#090909] opacity-0"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-4 border-b border-white/10 bg-[linear-gradient(135deg,rgba(255,115,195,0.18),rgba(255,255,255,0.02))] p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl font-black uppercase text-white">Portfolio studio</p>
            <p className="mt-2 font-body text-sm text-white/60">
              Upload new work, write captions, and curate how clients experience your artistry.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="border border-white/10 px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-white/65">
              {totalWorks} works
            </span>
            <button
              onClick={handleClose}
              className="flex h-11 w-11 items-center justify-center border border-white/10 text-white/60 transition-colors hover:border-pink hover:text-white"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid flex-1 gap-0 lg:grid-cols-[0.33fr_0.67fr]">
          <aside className="border-r border-white/10 bg-black/50 p-6">
            <label className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-pink/40 bg-pink/5 px-6 py-10 text-center transition-colors hover:border-pink hover:bg-pink/10">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-pink/40 bg-pink/10 text-pink">
                <Upload className="h-6 w-6" />
              </div>
              <p className="mt-4 font-display text-sm font-bold uppercase tracking-[0.16em] text-white">
                Upload pictures
              </p>
              <p className="mt-2 font-body text-sm text-white/55">
                Choose one or many images from your device. No image links needed.
              </p>
              <input
                accept="image/*"
                className="hidden"
                multiple
                onChange={(event) => void handleFilesSelected(event.target.files)}
                type="file"
              />
            </label>

            <div className="mt-6 border border-white/10 bg-white/[0.03] p-4">
              <p className="font-display text-sm font-bold uppercase text-white">Quick tips</p>
              <p className="mt-3 font-body text-sm text-white/55">
                Mix close-up beauty shots, full-face glam, and event looks so clients can trust your range.
              </p>
            </div>
          </aside>

          <section className="overflow-y-auto p-6">
            {isUploading ? (
              <div className="mb-4 border border-pink/30 bg-pink/10 px-4 py-3 font-body text-sm text-white/75">
                Uploading selected images...
              </div>
            ) : null}

            {draftPortfolio.length === 0 ? (
              <div className="flex min-h-[26rem] flex-col items-center justify-center border border-dashed border-white/10 bg-white/[0.02] text-center">
                <ImagePlus className="h-12 w-12 text-pink/60" />
                <p className="mt-4 font-display text-xl font-black uppercase text-white">
                  Your portfolio starts here
                </p>
                <p className="mt-2 max-w-md font-body text-sm text-white/55">
                  Upload makeup looks and polish the captions here before saving them to your public page.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {draftPortfolio.map((item) => (
                  <article key={item.id} className="border border-white/10 bg-white/[0.03] p-4">
                    <img alt={item.caption} className="h-64 w-full object-cover" src={item.url} />
                    <div className="mt-4 space-y-3">
                      <input
                        className="w-full border border-white/10 bg-black px-4 py-3 font-body text-white focus:border-pink focus:outline-none"
                        onChange={(event) => updateItem(item.id, 'caption', event.target.value)}
                        placeholder="Caption"
                        value={item.caption}
                      />
                      <input
                        className="w-full border border-white/10 bg-black px-4 py-3 font-body text-white focus:border-pink focus:outline-none"
                        onChange={(event) => updateItem(item.id, 'style', event.target.value)}
                        placeholder="Style"
                        value={item.style}
                      />
                      <button
                        className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 font-display text-[11px] font-bold uppercase tracking-[0.16em] text-white/60 transition-colors hover:border-pink hover:text-pink"
                        onClick={() => removeItem(item.id)}
                        type="button"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 bg-black/70 p-5 md:flex-row md:items-center md:justify-between">
          <p className="font-body text-sm text-white/50">
            Saved work will appear on the artist profile clients can browse.
          </p>
          <div className="flex gap-3">
            <button
              className="border border-white/20 px-4 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-pink hover:text-pink"
              onClick={handleClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center gap-2 bg-pink px-5 py-3 font-display text-xs font-bold uppercase tracking-[0.16em] text-black transition-colors hover:bg-white"
              onClick={handleSave}
              type="button"
            >
              <Save className="h-4 w-4" />
              Save portfolio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioStudioModal;
