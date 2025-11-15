export interface BookPage {
  front: string;
  back: string;
}

export interface BookFlipOptions {
  width?: number;
  height?: number;
  perspective?: number;
  duration?: number;
  easing?: string;
  shadow?: boolean;
  thickness?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  rtl?: boolean; // Right-to-left mode for Japanese manga and books
  singleFirstPage?: boolean; // If true, first page shows only on the right side. If false, shows as spread (default: true)
}

export interface BookFlipEmits {
  (e: 'page-change', page: number): void;
  (e: 'flip-start', page: number): void;
  (e: 'flip-end', page: number): void;
}
