import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Icon, type IconName } from "./Icon";

const ITEMS: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/manhua", label: "มันฮัว", icon: "book" },
  { to: "/doujin", label: "โดจิน", icon: "mask" },
  { to: "/search", label: "ค้นหา", icon: "search" },
  { to: "/library", label: "ชั้นหนังสือ", icon: "bookmark" },
  { to: "/profile", label: "โปรไฟล์", icon: "user" },
];

export function BottomNav() {
  const { library } = useApp();
  return (
    <nav className="bottom-nav glass-strong" aria-label="เมนูล่าง">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `bottom-nav-item ${isActive ? "bottom-nav-item-active" : ""}`}
        >
          <span className="bottom-nav-icon">
            <Icon name={item.icon} size={20} />
            {item.to === "/library" && library.bookmarks.length > 0 && (
              <span className="bottom-nav-badge">{library.bookmarks.length}</span>
            )}
          </span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
