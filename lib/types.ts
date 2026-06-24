// Gallery configuration types

export interface Quote {
  text: string;
  author?: string;
}

export interface GalleryPhoto {
  id: string;
  driveId: string;
  index: number;
  url2048: string;
  url1280: string;
  url640: string;
}

export interface GalleryConfig {
  title: string;
  subtitle?: string;
  date: string;
  photographer: string;
  source: string;
  driveFolder?: string;
  lightroomShareId?: string;
  photos: GalleryPhoto[];
  quotes: Quote[];
}
