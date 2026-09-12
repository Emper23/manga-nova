import { Component, useEffect, useRef, type ReactNode } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { BottomNav } from "./components/BottomNav";
import { SearchOverlay } from "./components/SearchOverlay";
import { Toasts } from "./components/Toasts";
import { Home } from "./pages/Home";
import { MangaDetail } from "./pages/MangaDetail";
import { MangaList } from "./pages/MangaList";
import { Reader } from "./pages/Reader";
import { Genres } from "./pages/Genres";
import { Library } from "./pages/Library";
import { Profile } from "./pages/Profile";
import { SearchPage } from "./pages/Search";
import { CategoryList } from "./pages/CategoryList";
import { DoujinList } from "./pages/DoujinList";
import { DevilList } from "./pages/DevilList";
import { DevilWatch } from "./pages/DevilWatch";
import { InfoPage } from "./pages/InfoPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function Shell() {
  const location = useLocation();
  const isReader = location.pathname.startsWith("/read/");

  return (
    <div className="app-shell">
      <ScrollToTop />
      <a href="#main" className="skip-link">
        ข้ามไปยังเนื้อหา
      </a>
      {!isReader && <Header />}
      <main id="main" className={isReader ? "main-reader" : "main"}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/latest" element={<MangaList />} />
          <Route path="/popular" element={<MangaList />} />
          <Route path="/manhua" element={<CategoryList category="Manhua" />} />
          <Route path="/manhwa" element={<CategoryList category="Manhwa" />} />
          <Route path="/manga" element={<CategoryList category="Manga" />} />
          <Route path="/manga/:id" element={<MangaDetail />} />
          <Route path="/doujin" element={<DoujinList />} />
          <Route path="/doujin/:id" element={<MangaDetail />} />
          <Route path="/videos" element={<DevilList />} />
          <Route path="/videos/:id" element={<DevilWatch />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<InfoPage kind="about" />} />
          <Route path="/terms" element={<InfoPage kind="terms" />} />
          <Route path="/privacy" element={<InfoPage kind="privacy" />} />
          <Route path="/contact" element={<InfoPage kind="contact" />} />
          <Route path="/dmca" element={<InfoPage kind="dmca" />} />
          <Route path="/read/:mangaId/:chapterId" element={<Reader />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isReader && <Footer />}
      {!isReader && <BottomNav />}
      <SearchOverlay />
      <Toasts />
    </div>
  );
}

function NotFound() {
  return (
    <div className="container not-found anim-fade-in">
      <h1 className="gradient-text">404</h1>
      <p>ไม่พบหน้าที่คุณกำลังหา</p>
      <Link to="/" className="btn btn-primary">
        กลับหน้าหลัก
      </Link>
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null as string | null };

  static getDerivedStateFromError(error: unknown) {
    return { message: error instanceof Error ? `${error.name}: ${error.message}` : String(error) };
  }

  componentDidCatch(error: unknown) {
    console.error("React render crashed:", error);
  }

  render() {
    if (this.state.message) {
      return (
        <div style={{ padding: 24 }}>
          <h1>เกิดข้อผิดพลาดในการแสดงผล</h1>
          <pre style={{ whiteSpace: "pre-wrap", color: "#b71c1c" }}>{this.state.message}</pre>
          <Link to="/" className="btn btn-primary">
            กลับหน้าหลัก
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Shell />
      </AppProvider>
    </ErrorBoundary>
  );
}
