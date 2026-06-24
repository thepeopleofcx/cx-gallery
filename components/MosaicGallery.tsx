'use client';

import { useState, useEffect, useRef } from 'react';
import type { GalleryPhoto, Quote } from '@/lib/types';

interface MosaicGalleryProps {
  photos: GalleryPhoto[];
  quotes: Quote[];
  title: string;
  subtitle?: string;
  date: string;
  photographer: string;
}

export default function MosaicGallery({
  photos,
  quotes,
  title,
  subtitle,
  date,
  photographer,
}: MosaicGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visiblePhotos, setVisiblePhotos] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisiblePhotos((prev) => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.1 }
    );
    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev === null || prev === 0 ? photos.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % photos.length));
      } else if (e.key === 'Escape') {
        setLightboxIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, photos.length]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);

  // Determine featured sizing: every 7th photo gets a larger span
  const isFeature = (index: number) => index % 7 === 0;

  const renderGalleryItems = () => {
    const items: React.ReactElement[] = [];
    let quoteIndex = 0;

    photos.forEach((photo, index) => {
      // Insert a quote roughly every 25-30 images
      if (index > 0 && index % 28 === 0 && quoteIndex < quotes.length) {
        const quote = quotes[quoteIndex];
        items.push(
          <div
            key={`quote-${quoteIndex}`}
            className="col-span-full bg-[#111] rounded-lg p-8 md:p-12 my-4"
          >
            <blockquote className="text-2xl md:text-3xl lg:text-4xl text-[#e8e8e8] italic font-serif text-center leading-relaxed">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            {quote.author && (
              <p className="text-sm md:text-base text-gray-400 text-center mt-4">
                — {quote.author}
              </p>
            )}
          </div>
        );
        quoteIndex++;
      }

      const featured = isFeature(index);
      const spanClass = featured ? 'col-span-1 md:col-span-2 row-span-2' : 'col-span-1';

      items.push(
        <div
          key={photo.id}
          data-index={index}
          ref={(el) => {
            if (el && observerRef.current) {
              observerRef.current.observe(el);
            }
          }}
          className={`${spanClass} ${
            visiblePhotos.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } transition-all duration-700 ease-out`}
        >
          <div
            className="relative overflow-hidden rounded cursor-pointer hover:scale-[1.02] transition-transform duration-300 h-full"
            onClick={() => setLightboxIndex(index)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url1280}
              alt={`Photo ${index + 1}`}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      );
    });

    return items;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="py-12 md:py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl text-gray-400 mb-4">{subtitle}</p>
        )}
        <p className="text-sm md:text-base text-gray-500">{date}</p>
        <p className="text-xs md:text-sm text-gray-600 mt-2">
          Photography by {photographer}
        </p>
      </header>

      {/* Gallery Grid */}
      <div className="gallery-grid px-4 md:px-8 lg:px-12 pb-20">
        {renderGalleryItems()}
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 text-center text-gray-500 text-sm">
        <p className="mb-2">Photography by {photographer}</p>
        <p>CX — BY INVITATION ONLY</p>
      </footer>

      {/* Lightbox */}
      {lightboxIndex !== null && (
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
              setLightboxIndex((prev) =>
                prev === null || prev === 0 ? photos.length - 1 : prev - 1
              );
            }}
            aria-label="Previous photo"
          >
            ‹
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-gray-400 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) =>
                prev === null ? 0 : (prev + 1) % photos.length
              );
            }}
            aria-label="Next photo"
          >
            ›
          </button>

          <div className="relative max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[lightboxIndex].url2048}
              alt={`Photo ${lightboxIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded text-sm">
              {lightboxIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }
        @media (min-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
        }
        @media (min-width: 1024px) {
          .gallery-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
        }
        .font-serif {
          font-family: 'Cormorant Garamond', 'Playfair Display', serif;
        }
      `}</style>
    </div>
  );
}
