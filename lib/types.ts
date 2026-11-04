// Gallery configuration types

export interface Quote {
  text: string;
  author?: string;
}

export interface GalleryPhoto {
  type?: 'photo';
  id: string;
  driveId?: string;
  index: number;
  width?: number;
  height?: number;
  url2048: string;
  url1280: string;
  url640: string;
}

/**
 * A short video cut. `loop` is a muted few-second cut that plays inline in the
 * grid; `full` is the whole clip (with sound) shown in the lightbox.
 */
export interface GalleryVideo {
  type: 'video';
  id: string;
  index: number;
  width: number;
  height: number;
  loop: string;
  full: string;
  poster: string;
}

export type GalleryItem = GalleryPhoto | GalleryVideo;

export interface Credit {
  name: string;
  url?: string;
}

export interface GalleryConfig {
  title: string;
  /** Serif headline shown at the top of the gallery page */
  eventTitle?: string;
  subtitle?: string;
  date: string;
  /** ISO date used to sort galleries on the home page (newest first) */
  isoDate?: string;
  photographer: string;
  photographerUrl?: string;
  /** Optional second credit line for the video cuts */
  videographer?: Credit;
  /** "Come join our next one" link (default https://app.hello.cx/) */
  nextEventUrl?: string;
  /** Index into `photos` used for the home card + social image (default 0) */
  coverIndex?: number;
  source: string;
  driveFolder?: string;
  lightroomShareId?: string;
  photos: GalleryItem[];
  quotes?: Quote[];
}
