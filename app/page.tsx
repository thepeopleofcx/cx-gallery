import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import type { GalleryConfig } from '@/lib/types';

interface GalleryPreview {
  slug: string;
  config: GalleryConfig;
}

async function getGalleryPreviews(): Promise<GalleryPreview[]> {
  const galleriesDir = path.join(process.cwd(), 'data/galleries');
  const files = await fs.readdir(galleriesDir);

  const previews = await Promise.all(
    files
      .filter((file) => file.endsWith('.json'))
      .map(async (file) => {
        const slug = file.replace('.json', '');
        const configPath = path.join(galleriesDir, file);
        const configData = await fs.readFile(configPath, 'utf-8');
        const config: GalleryConfig = JSON.parse(configData);
        return { slug, config };
      })
  );

  return previews;
}

export default async function HomePage() {
  const galleries = await getGalleryPreviews();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="py-16 md:py-24 px-6 text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4">
          CX GALLERY
        </h1>
        <p className="text-lg md:text-xl text-gray-400">
          Moments captured, memories shared
        </p>
      </header>

      <div className="px-4 md:px-8 lg:px-16 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleries.map((gallery) => {
            const coverPhoto = gallery.config.photos[0];
            return (
              <Link
                key={gallery.slug}
                href={`/gallery/${gallery.slug}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-lg aspect-[4/3] bg-[#111]">
                  {coverPhoto && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={coverPhoto.url1280}
                      alt={gallery.config.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                      {gallery.config.title}
                    </h2>
                    {gallery.config.subtitle && (
                      <p className="text-sm md:text-base text-gray-300 mb-1">
                        {gallery.config.subtitle}
                      </p>
                    )}
                    <p className="text-xs md:text-sm text-gray-400">
                      {gallery.config.date}
                    </p>
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
