import fs from 'fs/promises';
import path from 'path';
import type { GalleryConfig } from '@/lib/types';

const GALLERIES_DIR = path.join(process.cwd(), 'data/galleries');

export async function listGallerySlugs(): Promise<string[]> {
  const files = await fs.readdir(GALLERIES_DIR);
  return files.filter((file) => file.endsWith('.json')).map((file) => file.replace('.json', ''));
}

export async function loadGalleryConfig(slug: string): Promise<GalleryConfig | null> {
  try {
    const configData = await fs.readFile(path.join(GALLERIES_DIR, `${slug}.json`), 'utf-8');
    return JSON.parse(configData);
  } catch {
    return null;
  }
}

/** Cover image for the home card + social previews (videos fall back to their poster). */
export function coverUrl(config: GalleryConfig): string | undefined {
  const item = config.photos[config.coverIndex ?? 0] ?? config.photos[0];
  if (!item) return undefined;
  return item.type === 'video' ? item.poster : item.url1280;
}
