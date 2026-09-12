import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const ITEMS: { type: string; to: string; label: string; note: string }[] = [
  { type: "manhua", to: "/manhua", label: "มันฮัว", note: "mangablackcat.com" },
  { type: "manhwa", to: "/manhwa", label: "มังฮวา", note: "mangablackcat.com" },
  { type: "manga", to: "/manga", label: "มังงะ", note: "mangablackcat.com" },
  { type: "doujin", to: "/doujin", label: "โดจิน", note: "miku-doujin.com" },
  { type: "video", to: "/videos", label: "วิดีโอ 18+", note: "รวมคลิปหลายเว็บ" },
];

export function ContentTypeTabs() {
  const location = useLocation();
  const activeType = location.pathname.startsWith("/doujin")
    ? "doujin"
    : location.pathname.startsWith("/manhwa")
      ? "manhwa"
      : location.pathname.startsWith("/manga")
        ? "manga"
        : location.pathname.startsWith("/videos")
          ? "video"
          : "manhua";

  return (
    <nav className="content-type-tabs" aria-label="เลือกประเภทการ์ตูน">
      {ITEMS.map((item) => (
        <Link
          key={item.type}
          to={item.to}
          className={`content-type-tab ${activeType === item.type ? "content-type-tab-active" : ""}`}
          aria-current={activeType === item.type ? "page" : undefined}
        >
          <span>{item.label}</span>
          <small>{item.note}</small>
        </Link>
      ))}
    </nav>
  );
}
