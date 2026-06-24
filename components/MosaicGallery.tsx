'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { LightroomPhoto } from '@/lib/lightroom';
import type { Quote } from '@/lib/types';

interface MosaicGalleryProps {
  photos: LightroomPhoto[];
  quotes: Quote[];
  title: string;
  subtitle?: string;
  date: string;
  photographer: string;
  lightroomShareId: string;
}

export default function MosaicGallery({
  photos,
  quotes,
  title,
  subtitle,
  date,
  photographer,
  lightroomShareId,
}: MosaicGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visiblePhotos, setVisiblePhotos] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection observer for fade-in animations
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

  // Keyboard navigation for lightbox
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

  // Determine photo size based on score and orientation
  const getPhotoSize = (photo: LightroomPhoto) => {
    const isLandscape = photo.width > photo.height;
    if (photo.score >= 60) return isLandscape ? 'large-landscape' : 'large';
    if (photo.score >= 55) return 'medium';
    return 'standard';
  };

  // Render photo grid with interspersed quotes
  const renderGalleryItems = () => {
    const items: React.ReactElement[] = [];
    let quoteIndex = 0;

    photos.forEach((photo, index) => {
      // Insert a quote roughly every 10-12 images
      if (index > 0 && index % 11 === 0 && quoteIndex < quotes.length) {
        const quote = quotes[quoteIndex];
        items.push(
          <div
            key={`quote-${quoteIndex}`}
            className="quote-card col-span-full bg-[#111] rounded-lg p-8 md:p-12 my-4"
          >
            <blockquote className="text-2xl md:text-3xl lg:text-4xl text-[#e8e8e8] italic font-serif text-center leading-relaxed">
              "{quote.text}"
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

      const size = getPhotoSize(photo);
      const spanClass =
        size === 'large-landscape'
          ? 'col-span-full md:col-span-2'
          : size === 'large'
          ? 'col-span-1 md:col-span-2'
          : 'col-span-1';

      items.push(
        <div
          key={photo.id}
          data-index={index}
          ref={(el) => {
            if (el && observerRef.current) {
              observerRef.current.observe(el);
            }
          }}
          className={`photo-item ${spanClass} ${
            visiblePhotos.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } transition-all duration-700 ease-out`}
        >
          <div
            className="relative overflow-hidden rounded cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            onClick={() => setLightboxIndex(index)}
          >
            <Image
              src={photo.url640}
              alt={`Photo ${index + 1}`}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              className="w-full h-auto"
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
        <p className="mb-4">CX — BY INVITATION ONLY</p>
        <a
          href={`https://lightroom.adobe.com/shares/${lightroomShareId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors underline"
        >
          View original gallery on Lightroom
        </a>
      </footer>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
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
            className="absolute left-4 text-white text-4xl hover:text-gray-400 transition-colors z-10"
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
            className="absolute right-4 text-white text-4xl hover:text-gray-400 transition-colors z-10"
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
            <Image
              src={photos[lightboxIndex].url2048}
              alt={`Photo ${lightboxIndex + 1}`}
              width={photos[lightboxIndex].width}
              height={photos[lightboxIndex].height}
              className="max-w-full max-h-[90vh] object-contain"
              priority
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 px-3 py-1 rounded text-sm">
              {lightboxIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .gallery-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
          }
        }

        .quote-card {
          font-family: 'Cormorant Garamond', 'Playfair Display', serif;
        }
      `}</style>
    </div>
  );
}
