import { Link } from "react-router-dom";
import type { Manga } from "../types";
import { MangaCover } from "./MangaCover";
import { Icon } from "./Icon";

export function MangaCard({ manga, index }: { manga: Manga; index?: number }) {
  const detailPath = manga.type === "doujin" ? `/doujin/${manga.id}` : `/manga/${manga.id}`;
  const card = (
    <>
      <div className="manga-card-cover">
        <MangaCover manga={manga} className="cover-art" priority={index === 0} />
        {manga.badge && (
          <span className={`badge badge-${manga.badge.toLowerCase()} manga-badge`}>{manga.badge}</span>
        )}
        <div className="manga-card-overlay">
          <span className="read-now">
            <Icon name="play" size={14} />
            {manga.externalOnly ? "เปิดต้นฉบับ" : "อ่านเลย"}
          </span>
        </div>
      </div>
      <div className="manga-card-body">
        <h3 className="manga-card-title" title={manga.title}>
          {manga.title}
        </h3>
        <div className="manga-card-meta">
          <span className="manga-rating">
            <Icon name="starFilled" size={12} className="star-icon" />
            {manga.rating.toFixed(1)}
          </span>
          <span className="manga-chapters">
            <Icon name="bookOpen" size={12} />
            {manga.chapters} ตอน
          </span>
          <span
            className={`status-dot ${
              manga.status === "Ongoing" ? "ongoing" : manga.status === "Completed" ? "completed" : "hiatus"
            }`}
          >
            {manga.status === "Ongoing" ? "Ongoing" : manga.status === "Completed" ? "จบแล้ว" : "พัก"}
          </span>
        </div>
        <div className="manga-card-genres">
          {manga.genres.slice(0, 2).map((g) => (
            <span key={g} className="genre-chip">
              {g}
            </span>
          ))}
        </div>
      </div>
    </>
  );
  const props = {
    className: "manga-card",
    style: { animationDelay: `${(index ?? 0) * 0.05}s` },
    "aria-label": `${manga.title} — เรต ${manga.rating}, ${manga.chapters} ตอน`,
  } as const;

  if (manga.externalOnly && manga.sourceUrl) {
    return (
      <a href={manga.sourceUrl} target="_blank" rel="noreferrer" {...props}>
        {card}
      </a>
    );
  }

  return (
    <Link to={detailPath} {...props}>
      {card}
    </Link>
  );
}

export function MangaCardSkeleton() {
  return (
    <div className="manga-card" aria-hidden="true">
      <div className="skeleton manga-card-cover" style={{ aspectRatio: "300/420" }} />
      <div className="manga-card-body">
        <div className="skeleton" style={{ height: 16, width: "85%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: "60%" }} />
      </div>
    </div>
  );
}
