'use client';

import { useState, useEffect, useRef } from 'react';
import type { Credit, GalleryItem, GalleryVideo } from '@/lib/types';

interface MosaicGalleryProps {
  photos: GalleryItem[];
  title: string;
  eventTitle?: string;
  subtitle?: string;
  date: string;
  photographer: string;
  photographerUrl?: string;
  videographer?: Credit;
  nextEventUrl?: string;
}

function CreditLink({ name, url }: Credit) {
  if (!url) return <>{name}</>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-white transition-colors"
    >
      {name}
    </a>
  );
}

/** Muted inline loop that only plays while it is on screen. */
function VideoTile({ video, label }: { video: GalleryVideo; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <video
        ref={ref}
        src={video.loop}
        poster={video.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/55 text-white/90 text-[11px] pl-[2px] backdrop-blur-sm"
      >
        ▶
      </span>
    </>
  );
}

export default function MosaicGallery({
  photos,
  eventTitle,
  date,
  photographer,
  photographerUrl,
  videographer,
  nextEventUrl = 'https://app.hello.cx/',
}: MosaicGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const items = photos;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev === null || prev === 0 ? items.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % items.length));
      } else if (e.key === 'Escape') {
        setLightboxIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, items.length]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxIndex]);

  const renderGalleryItems = () => {
    const out: React.ReactElement[] = [];
    // Featured sizing counts photos only, so galleries without video keep
    // exactly the original rhythm (every 7th photo is large).
    let photoCount = 0;

    items.forEach((item, index) => {
      const delay = { animationDelay: `${Math.min(index * 30, 300)}ms` };

      if (item.type === 'video') {
        out.push(
          <div
            key={item.id}
            className="col-span-1 animate-fadeIn"
            style={delay}
          >
            <div
              className="relative overflow-hidden rounded cursor-pointer hover:scale-[1.02] transition-transform duration-300 h-full w-full aspect-[9/16] max-h-[85vh] md:aspect-[4/5] md:max-h-none bg-[#0a0a0a]"
              onClick={() => setLightboxIndex(index)}
            >
              <VideoTile video={item} label={`Video ${index + 1}`} />
            </div>
          </div>
        );
        return;
      }

      const featured = photoCount % 7 === 0;
      photoCount++;
      const spanClass = featured ? 'col-span-1 md:col-span-2 row-span-2' : 'col-span-1';

      out.push(
        <div key={item.id} className={`${spanClass} animate-fadeIn`} style={delay}>
          <div
            className="relative overflow-hidden rounded cursor-pointer hover:scale-[1.02] transition-transform duration-300 h-full"
            onClick={() => setLightboxIndex(index)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url1280}
              alt={`Photo ${index + 1}`}
              loading="lazy"
              width={item.width}
              height={item.height}
              className="w-full h-full max-h-[80vh] min-h-full object-cover"
            />
          </div>
        </div>
      );
    });

    return out;
  };

  const current = lightboxIndex !== null ? items[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="py-16 md:py-28 px-6 text-center">
        {eventTitle && (
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl italic tracking-tight mb-8 text-white leading-tight">
            {eventTitle}
          </h1>
        )}
        <div className="text-sm md:text-base text-gray-400 tracking-widest uppercase">
          <p>{date}</p>
          <p className="mt-2">
            Photography by <CreditLink name={photographer} url={photographerUrl} />
          </p>
          {videographer && (
            <p className="mt-2">
              Film by <CreditLink {...videographer} />
            </p>
          )}
        </div>
        <hr className="mt-10 mb-6 border-t border-gray-700 max-w-md mx-auto" />
        <div className="text-sm text-gray-500 leading-relaxed">
          <p>This event was presented by CX.</p>
          <p className="mt-3">
            <a
              href={nextEventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Come join our next one »
            </a>
          </p>
          <p className="mt-2">
            <a
              href="https://www.instagram.com/thepeopleofcx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Find us on Instagram »
            </a>
          </p>
        </div>
      </header>

      {/* Gallery Grid */}
      <div className="px-6 md:px-12 pb-20">
        <div className="gallery-grid mx-auto max-w-[1000px]">{renderGalleryItems()}</div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 text-center text-gray-500 text-sm">
        <p className="mb-2">Photography by {photographer}</p>
        {videographer && <p className="mb-2">Film by {videographer.name}</p>}
        <p>CX — BY INVITATION ONLY</p>
      </footer>

      {/* Lightbox */}
      {current && lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-400 transition-colors z-10"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close lightbox"
          >
            ×
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-gray-400 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev === null || prev === 0 ? items.length - 1 : prev - 1));
            }}
            aria-label="Previous"
          >
            ‹
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-gray-400 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % items.length));
            }}
            aria-label="Next"
          >
            ›
          </button>

          <div className="relative max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {current.type === 'video' ? (
              <video
                key={current.id}
                src={current.full}
                poster={current.poster}
                controls
                autoPlay
                playsInline
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={current.url2048}
                alt={`Photo ${lightboxIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain"
              />
            )}
            <div
              className={`absolute ${current.type === 'video' ? 'top-4' : 'bottom-4'} left-4 bg-black/70 px-3 py-1 rounded text-sm pointer-events-none`}
            >
              {lightboxIndex + 1} / {items.length}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 0.5rem;
        }
        @media (min-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.75rem;
          }
        }
        @media (min-width: 1024px) {
          .gallery-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1rem;
          }
        }
        .font-serif {
          font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
}
