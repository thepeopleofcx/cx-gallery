import { notFound } from 'next/navigation';
import MosaicGallery from '@/components/MosaicGallery';
import { coverUrl, listGallerySlugs, loadGalleryConfig } from '@/lib/galleries';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await listGallerySlugs();
  return slugs.map((slug) => ({ slug }));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const config = await loadGalleryConfig(slug);

  if (!config) {
    return { title: 'Gallery Not Found' };
  }

  const ogImage = coverUrl(config);

  return {
    title: `${config.title} | CX Gallery`,
    description: `Photo gallery from ${config.date} by ${config.photographer}`,
    openGraph: {
      title: config.title,
      description: `${config.date} — Photography by ${config.photographer}`,
      images: ogImage ? [ogImage] : [],
    },
  };
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
      title={config.title}
      eventTitle={config.eventTitle}
      subtitle={config.subtitle}
      date={config.date}
      photographer={config.photographer}
      photographerUrl={config.photographerUrl}
      videographer={config.videographer}
    />
  );
}
