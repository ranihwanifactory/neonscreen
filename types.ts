export enum AdType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export enum AdSize {
  SQUARE = 'square',       // 1x1
  LANDSCAPE = 'landscape', // 16:9 (approx 2x1 grid)
  PORTRAIT = 'portrait',   // 9:16 (approx 1x2 grid)
  BIG = 'big'              // 2x2
}

export interface Advertisement {
  id: string;
  title: string;
  type: AdType;
  url: string; // Image URL or YouTube ID/URL
  description?: string;
  size: AdSize;
  createdAt: number;
}

export const ADMIN_EMAIL = "acehwan69@gmail.com";