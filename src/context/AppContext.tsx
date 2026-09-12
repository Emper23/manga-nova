import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { LibraryState, ReadingProgress, ToastItem, ToastType } from "../types";

const LIBRARY_KEY = "manga-nova-library-v2";
const THEME_KEY = "manga-nova-theme";

/** Default library seeded with real manga from mangablackcat.com. */
const DEFAULT_LIBRARY: LibraryState = {
  bookmarks: ["bully::i-am-the-fated-villain", "bully::magic-emperor"],
  continueReading: [
    { mangaId: "bully::full-time-awakening", chapter: 45, progress: 0.62, updatedAt: Date.now() - 3600_000 * 5 },
    { mangaId: "bully::dao-of-the-bizarre-immortal", chapter: 30, progress: 0.35, updatedAt: Date.now() - 3600_000 * 26 },
    { mangaId: "bully::light-of-arad-forerunner", chapter: 12, progress: 0.88, updatedAt: Date.now() - 3600_000 * 50 },
  ],
  recentlyViewed: [
    "bully::i-am-the-fated-villain",
    "bully::magic-emperor",
    "bully::full-time-awakening",
    "bully::dao-of-the-bizarre-immortal",
    "bully::light-of-arad-forerunner",
  ],
  recentSearches: ["Magic Emperor", "Full-Time Awakening", "I am the Fated Villain"],
};

function loadLibrary(): LibraryState {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<LibraryState> & { completed?: unknown };
      delete saved.completed;
      return { ...DEFAULT_LIBRARY, ...saved };
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_LIBRARY;
}

interface AppContextValue {
  theme: "dark" | "light";
  toggleTheme: () => void;
  library: LibraryState;
  toggleBookmark: (mangaId: string) => boolean;
  isBookmarked: (mangaId: string) => boolean;
  recordProgress: (mangaId: string, chapter: number, progress: number) => void;
  recordView: (mangaId: string) => void;
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  toasts: ToastItem[];
  toast: (message: string, type?: ToastType) => void;
  dismissToast: (id: number) => void;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      return (localStorage.getItem(THEME_KEY) as "dark" | "light") || "dark";
    } catch {
      return "dark";
    }
  });
  const [library, setLibrary] = useState<LibraryState>(loadLibrary);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const toastId = useRef(0);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
    } catch {
      /* ignore */
    }
  }, [library]);



  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback(
    (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  const toggleBookmark = useCallback(
    (mangaId: string) => {
      setLibrary((prev) => {
        const has = prev.bookmarks.includes(mangaId);
        return {
          ...prev,
          bookmarks: has
            ? prev.bookmarks.filter((id) => id !== mangaId)
            : [mangaId, ...prev.bookmarks],
        };
      });
      return !library.bookmarks.includes(mangaId);
    },
    [library.bookmarks]
  );

  const isBookmarked = useCallback(
    (mangaId: string) => library.bookmarks.includes(mangaId),
    [library.bookmarks]
  );

  const recordProgress = useCallback((mangaId: string, chapter: number, progress: number) => {
    setLibrary((prev) => {
      const rest = prev.continueReading.filter((r) => r.mangaId !== mangaId);
      const next: ReadingProgress = { mangaId, chapter, progress, updatedAt: Date.now() };
      return { ...prev, continueReading: [next, ...rest].slice(0, 12) };
    });
  }, []);


  const recordView = useCallback((mangaId: string) => {
    setLibrary((prev) => ({
      ...prev,
      recentlyViewed: [
        mangaId,
        ...prev.recentlyViewed.filter((id) => id !== mangaId),
      ].slice(0, 12),
    }));
  }, []);

  const addRecentSearch = useCallback((q: string) => {
    setLibrary((prev) => ({
      ...prev,
      recentSearches: [q, ...prev.recentSearches.filter((s) => s.toLowerCase() !== q.toLowerCase())].slice(0, 6),
    }));
  }, []);

  const clearRecentSearches = useCallback(() => {
    setLibrary((prev) => ({ ...prev, recentSearches: [] }));
  }, []);

  const login = useCallback(() => {
    setIsLoggedIn(true);
    toast("ยินดีต้อนรับสู่ MANGA NOVA! ✨", "success");
  }, [toast]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    toast("ออกจากระบบแล้ว", "info");
  }, [toast]);

  const value = useMemo<AppContextValue>(
    () => ({
      theme,
      toggleTheme,
      library,
      toggleBookmark,
      isBookmarked,
      recordProgress,
      recordView,
      addRecentSearch,
      clearRecentSearches,
      searchOpen,
      setSearchOpen,
      toasts,
      toast,
      dismissToast,
      isLoggedIn,
      login,
      logout,
    }),
    [
      theme,
      toggleTheme,
      library,
      toggleBookmark,
      isBookmarked,
      recordProgress,
      recordView,
      addRecentSearch,
      clearRecentSearches,
      searchOpen,
      toasts,
      toast,
      dismissToast,
      isLoggedIn,
      login,
      logout,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
