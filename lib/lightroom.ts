// Lightroom API scraper for CX Gallery
// Fetches photo data from Adobe Lightroom shared galleries

export interface LightroomPhoto {
  id: string;
  width: number;
  height: number;
  score: number;
  captureDate: string | null;
  url2048: string;
  url1280: string;
  url640: string;
}

function stripPrefix(text: string): string {
  return text.replace(/^while\s*\(\s*1\s*\)\s*\{\}\s*\n?/, '');
}

/**
 * Fetch photos from a Lightroom shared gallery
 */
export async function fetchLightroomPhotos(shareId: string): Promise<LightroomPhoto[]> {
  const BASE = `https://lightroom.adobe.com/v2c/spaces/${shareId}`;
  const CDN = `https://photos.adobe.io/v2/spaces/${shareId}/`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  };

  try {
    // Step 1: Get album ID from resources
    const resourcesRes = await fetch(`${BASE}/resources`, { headers });
    if (!resourcesRes.ok) throw new Error(`Resources fetch failed: ${resourcesRes.status}`);
    const resourcesData = JSON.parse(stripPrefix(await resourcesRes.text()));
    const albumId = resourcesData.resources?.[0]?.id;
    if (!albumId) throw new Error('No album found in space');

    // Step 2: Fetch all assets (paginated — Lightroom uses limit + link-based pagination)
    const photos: LightroomPhoto[] = [];
    let url: string | null = `${BASE}/albums/${albumId}/assets?embed=asset&subtype=image%3Bvideo&limit=200`;

    while (url) {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Assets fetch failed: ${res.status}`);

      const data = JSON.parse(stripPrefix(await res.text()));

      for (const resource of data.resources || []) {
        const asset = resource.asset;
        if (!asset?.links) continue;

        const r2048 = asset.links['/rels/rendition_type/2048']?.href;
        const r1280 = asset.links['/rels/rendition_type/1280']?.href;
        const r640 = asset.links['/rels/rendition_type/640']?.href;
        if (!r2048 || !r1280 || !r640) continue;

        // Dimensions from develop metadata (actual cropped size)
        const dev = asset.payload?.develop;
        const imp = asset.payload?.importSource;
        const width = dev?.croppedWidth || imp?.originalWidth || 2048;
        const height = dev?.croppedHeight || imp?.originalHeight || 2048;

        // Adobe aesthetics score (0-100 range, already normalized)
        const score = asset.payload?.aesthetics?.score || 50;

        photos.push({
          id: asset.id,
          width,
          height,
          score,
          captureDate: asset.payload?.captureDate || null,
          url2048: `${CDN}${r2048}`,
          url1280: `${CDN}${r1280}`,
          url640: `${CDN}${r640}`,
        });
      }

      // Pagination: check for next link
      const nextHref = data.links?.next?.href;
      if (nextHref) {
        url = nextHref.startsWith('http') ? nextHref : `${BASE}/${nextHref}`;
      } else {
        url = null;
      }
    }

    return photos;
  } catch (error) {
    console.error('Error fetching Lightroom photos:', error);
    throw error;
  }
}

/**
 * Get featured photo for a gallery (highest score landscape photo)
 */
export function getFeaturedPhoto(photos: LightroomPhoto[]): LightroomPhoto | null {
  const landscapePhotos = photos.filter(p => p.width > p.height);
  if (landscapePhotos.length === 0) return photos[0] || null;
  return landscapePhotos.reduce((best, current) =>
    current.score > best.score ? current : best
  );
}
