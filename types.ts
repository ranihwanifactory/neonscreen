export enum AdType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export enum AdSize {
  SMALL = 'small',   // 1x1
  WIDE = 'wide',     // 2x1
  TALL = 'tall',     // 1x2
  LARGE = 'large'    // 2x2
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