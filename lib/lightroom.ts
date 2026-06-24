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

interface LightroomAsset {
  id: string;
  asset: {
    payload: {
      captureDate?: string;
      develop?: {
        stars?: number;
      };
    };
    links: {
      [key: string]: {
        href: string;
        width?: number;
        height?: number;
      };
    };
  };
}

interface LightroomResponse {
  resources: LightroomAsset[];
  next_offset?: number;
}

/**
 * Fetch photos from a Lightroom shared gallery
 * @param shareId - The Lightroom share ID (e.g., "58f541bb4c484d64af1c9d909b653c22")
 * @returns Array of photo metadata with URLs
 */
export async function fetchLightroomPhotos(shareId: string): Promise<LightroomPhoto[]> {
  try {
    // Step 1: Get space metadata
    const spaceRes = await fetch(`https://lightroom.adobe.com/v2c/spaces/${shareId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!spaceRes.ok) {
      throw new Error(`Failed to fetch space metadata: ${spaceRes.status}`);
    }

    const spaceText = await spaceRes.text();
    const spaceJson = spaceText.replace(/^while\s*\(\s*1\s*\)\s*\{\}\s*\n?/, '');
    const spaceData = JSON.parse(spaceJson);
    
    // Step 2: Get album resources
    const resourcesRes = await fetch(
      `https://lightroom.adobe.com/v2c/spaces/${shareId}/resources`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      }
    );

    if (!resourcesRes.ok) {
      throw new Error(`Failed to fetch resources: ${resourcesRes.status}`);
    }

    const resourcesText = await resourcesRes.text();
    const resourcesJson = resourcesText.replace(/^while\s*\(\s*1\s*\)\s*\{\}\s*\n?/, '');
    const resourcesData = JSON.parse(resourcesJson);
    const albumId = resourcesData.resources?.[0]?.id;

    if (!albumId) {
      throw new Error('No album found in space');
    }

    // Step 3: Fetch all assets (with pagination)
    const photos: LightroomPhoto[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const assetsUrl = `https://lightroom.adobe.com/v2c/spaces/${shareId}/albums/${albumId}/assets?embed=asset&subtype=image%3Bvideo&limit=${limit}&offset=${offset}`;
      
      const assetsRes = await fetch(assetsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      if (!assetsRes.ok) {
        throw new Error(`Failed to fetch assets: ${assetsRes.status}`);
      }

      const rawText = await assetsRes.text();
      
      // IMPORTANT: Strip the "while (1) {}" prefix that Adobe includes
      const jsonText = rawText.replace(/^while\s*\(\s*1\s*\)\s*\{\}\s*\n?/, '');
      
      const assetsData: LightroomResponse = JSON.parse(jsonText);

      // Process assets
      for (const resource of assetsData.resources || []) {
        const asset = resource.asset;
        
        // Skip videos
        if (!asset || !asset.links) continue;

        // Get dimensions from 2048 rendition
        const rendition2048 = asset.links['/rels/rendition_type/2048'];
        const rendition1280 = asset.links['/rels/rendition_type/1280'];
        const rendition640 = asset.links['/rels/rendition_type/640'];

        if (!rendition2048 || !rendition1280 || !rendition640) continue;

        const width = rendition2048.width || 2048;
        const height = rendition2048.height || 2048;
        
        // Extract score (Adobe uses star ratings 0-5, we convert to 0-100)
        const stars = asset.payload?.develop?.stars || 0;
        const score = stars * 20; // 5 stars = 100 points

        // Capture date
        const captureDate = asset.payload?.captureDate || null;

        // Construct image URLs
        const url2048 = `https://photos.adobe.io/v2/spaces/${shareId}${rendition2048.href}`;
        const url1280 = `https://photos.adobe.io/v2/spaces/${shareId}${rendition1280.href}`;
        const url640 = `https://photos.adobe.io/v2/spaces/${shareId}${rendition640.href}`;

        photos.push({
          id: resource.id,
          width,
          height,
          score,
          captureDate,
          url2048,
          url1280,
          url640,
        });
      }

      // Check for pagination
      if (assetsData.next_offset) {
        offset = assetsData.next_offset;
      } else {
        break;
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
