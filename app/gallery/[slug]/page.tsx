import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import MosaicGallery from '@/components/MosaicGallery';
import type { GalleryConfig } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const galleriesDir = path.join(process.cwd(), 'data/galleries');
  const files = await fs.readdir(galleriesDir);

  return files
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({
      slug: file.replace('.json', ''),
    }));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const config = await loadGalleryConfig(slug);

  if (!config) {
    return { title: 'Gallery Not Found' };
  }

  // Use first landscape photo or first photo for OG image
  const ogPhoto = config.photos[0];

  return {
    title: `${config.title} | CX Gallery`,
    description: `Photo gallery from ${config.date} by ${config.photographer}`,
    openGraph: {
      title: config.title,
      description: `${config.date} — Photography by ${config.photographer}`,
      images: ogPhoto ? [ogPhoto.url1280] : [],
    },
  };
}

async function loadGalleryConfig(slug: string): Promise<GalleryConfig | null> {
  try {
    const configPath = path.join(process.cwd(), 'data/galleries', `${slug}.json`);
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch {
    return null;
  }
}

export default async function GalleryPage({ params }: PageProps) {
  const { slug } = await params;
  const config = await loadGalleryConfig(slug);

  if (!config) {
    notFound();
  }

  return (
    <MosaicGallery
      photos={config.photos}
      quotes={config.quotes}
      title={config.title}
      subtitle={config.subtitle}
      date={config.date}
      photographer={config.photographer}
    />
  );
}
