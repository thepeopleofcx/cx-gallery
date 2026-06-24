// Gallery configuration types

export interface Quote {
  text: string;
  author?: string;
}

export interface GalleryConfig {
  title: string;
  subtitle?: string;
  date: string;
  photographer: string;
  lightroomShareId: string;
  quotes: Quote[];
}
