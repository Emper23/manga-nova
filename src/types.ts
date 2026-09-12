export type Status = "Ongoing" | "Completed" | "Hiatus";
export type MangaType = "manga" | "manhua" | "manhwa" | "doujin";

export interface Manga {
  id: string;
  title: string;
  altTitle?: string;
  japaneseTitle?: string;
  description: string;
  author: string;
  artist: string;
  genres: string[];
  rating: number;
  views: string;
  status: Status;
  year: number;
  chapters: number;
  badge?: "HOT" | "NEW" | "TRENDING";
  isNew?: boolean;
  /** seed used to deterministically generate the cover art */
  seed: number;
  /** real cover image URL from the active content source when available */
  coverUrl?: string;
  /** external source manga id — differs from the local slug */
  externalId?: string;
  /** content category used to keep Japanese, Chinese and Korean titles separate */
  type?: MangaType;
  /** source page used for external-only fallback cards when an upstream blocks server fetching */
  sourceUrl?: string;
  externalOnly?: boolean;
}

export interface Chapter {
  id: string;
  mangaId: string;
  number: number;
  title: string;
  date: string; // ISO
  isNew?: boolean;
  views?: string;
  /** external source chapter id — used to fetch real page images */
  externalId?: string;
  /** language of the translation, e.g. "th", "en", "ja" (real API data) */
  lang?: string;
}

export interface ReadingProgress {
  mangaId: string;
  chapter: number;
  /** fraction 0..1 through the chapter pages */
  progress: number;
  updatedAt: number;
}

export interface LibraryState {
  bookmarks: string[]; // manga ids
  continueReading: ReadingProgress[];
  recentlyViewed: string[]; // manga ids, most recent first
  recentSearches: string[];
}

export interface UserProfile {
  name: string;
  handle: string;
  joined: string;
  avatarHue: number;
  readingStats: {
    chaptersRead: number;
    mangasRead: number;
    hoursSpent: number;
    daysStreak: number;
  };
  favoriteGenres: string[];
}

export type ToastType = "success" | "info" | "error";

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}
