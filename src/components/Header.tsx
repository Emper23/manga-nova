import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Icon } from "./Icon";

const NAV = [
  { to: "/", label: "Home", icon: "home" as const, end: true },
  { to: "/genres", label: "Genres", icon: "tags" as const },
  { to: "/latest", label: "Latest", icon: "clock" as const },
  { to: "/popular", label: "Popular", icon: "flame" as const },
  { to: "/manhua", label: "มังฮัว", icon: "rocket" as const },
  { to: "/doujin", label: "โดจิน", icon: "mask" as const },
  { to: "/videos", label: "วิดีโอ 18+", icon: "play" as const },
];

export function Header() {
  const { theme, toggleTheme, setSearchOpen, isLoggedIn, login } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  return (
    <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label="MANGA NOVA หน้าหลัก">
          <img className="brand-logo-image" src="/assets/manga-nova-logo-navbar.png" alt="MANGA NOVA" />
        </Link>

        <nav className="main-nav" aria-label="เมนูหลัก">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <button className="icon-btn search-btn" onClick={() => setSearchOpen(true)} aria-label="ค้นหา (Ctrl+K)">
            <Icon name="search" size={19} />
            <kbd className="kbd hidden-mobile">Ctrl K</kbd>
          </button>
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
          >
            {theme === "dark" ? <Icon name="sun" size={19} /> : <Icon name="moon" size={19} />}
          </button>
          {isLoggedIn ? (
            <Link to="/profile" className="avatar-btn" aria-label="โปรไฟล์ของฉัน">
              <span className="mini-avatar">K</span>
            </Link>
          ) : (
            <>
              <button className="btn btn-ghost login-btn" onClick={login}>
                เข้าสู่ระบบ
              </button>
              <button className="btn btn-primary signup-btn" onClick={login}>
                สมัครสมาชิก
              </button>
            </>
          )}
          <button
            className="icon-btn mobile-menu-btn"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="เปิดเมนู"
            aria-expanded={mobileOpen}
          >
            <Icon name={mobileOpen ? "close" : "menu"} size={20} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="mobile-nav anim-fade-in" aria-label="เมนูมือถือ">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `mobile-nav-link ${isActive ? "mobile-nav-link-active" : ""}`}
            >
              <Icon name={item.icon} size={17} />
              {item.label}
            </NavLink>
          ))}
          <button className="mobile-nav-link" onClick={() => setSearchOpen(true)}>
            <Icon name="search" size={17} />
            ค้นหา
          </button>
        </nav>
      )}
    </header>
  );
}
