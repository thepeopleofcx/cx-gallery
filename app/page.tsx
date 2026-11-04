import Link from 'next/link';
import type { GalleryConfig } from '@/lib/types';
import { coverUrl, listGallerySlugs, loadGalleryConfig } from '@/lib/galleries';

interface GalleryPreview {
  slug: string;
  config: GalleryConfig;
}

async function getGalleryPreviews(): Promise<GalleryPreview[]> {
  const slugs = await listGallerySlugs();
  const previews = await Promise.all(
    slugs.map(async (slug) => ({ slug, config: (await loadGalleryConfig(slug))! }))
  );

  // Newest event first
  const time = (c: GalleryConfig) => new Date(c.isoDate ?? c.date).getTime() || 0;
  return previews.filter((p) => p.config).sort((a, b) => time(b.config) - time(a.config));
}

export default async function HomePage() {
  const galleries = await getGalleryPreviews();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="py-16 md:py-24 px-6 text-center">
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl italic tracking-tight mb-4 text-white leading-tight">
          A Look Behind the Curtain...
        </h1>
        <p className="text-sm md:text-base text-gray-400 tracking-widest uppercase">
          Photos from CX Events
        </p>
      </header>

      <div className="px-4 md:px-8 lg:px-16 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleries.map((gallery) => {
            const cover = coverUrl(gallery.config);
            return (
              <Link key={gallery.slug} href={`/gallery/${gallery.slug}`} className="group block">
                <div className="relative overflow-hidden rounded-lg aspect-[4/3] bg-[#111]">
                  {cover && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={cover}
                      alt={gallery.config.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{gallery.config.title}</h2>
                    {gallery.config.subtitle && (
                      <p className="text-sm md:text-base text-gray-300 mb-1">
                        {gallery.config.subtitle}
                      </p>
                    )}
                    <p className="text-xs md:text-sm text-gray-400">{gallery.config.date}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <footer className="py-12 px-6 text-center text-gray-500 text-sm">
        <p>CX — BY INVITATION ONLY</p>
      </footer>
    </div>
  );
}
