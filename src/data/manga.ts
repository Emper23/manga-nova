import { BULLY_GENRE_SLUGS } from "../api/bully";

const GENRE_VISUALS: Record<string, { icon: string; color: string }> = {
  Action: { icon: "bolt", color: "#f43f5e" },
  Adventure: { icon: "compass", color: "#f59e0b" },
  Romance: { icon: "heart", color: "#ec4899" },
  Fantasy: { icon: "wand", color: "#8b5cf6" },
  Comedy: { icon: "smile", color: "#22c55e" },
  Isekai: { icon: "portal", color: "#06b6d4" },
  Drama: { icon: "mask", color: "#f97316" },
  Horror: { icon: "ghost", color: "#7c3aed" },
  Mystery: { icon: "magnify", color: "#38bdf8" },
  "Sci-Fi": { icon: "rocket", color: "#2dd4bf" },
  "Martial Arts": { icon: "bolt", color: "#f97316" },
  Supernatural: { icon: "ghost", color: "#a78bfa" },
  Historical: { icon: "clock", color: "#fb7185" },
  "Slice of Life": { icon: "book", color: "#34d399" },
  Psychological: { icon: "eye", color: "#c084fc" },
  Harem: { icon: "heart", color: "#f472b6" },
  Game: { icon: "grid", color: "#60a5fa" },
  Shounen: { icon: "flame", color: "#f97316" },
  Reborn: { icon: "refresh", color: "#a3e635" },
};

/** UI genres sourced from the active mangablackcat.com catalog. */
export const GENRES = Object.keys(BULLY_GENRE_SLUGS)
  .filter((name) => name !== "Manhua")
  .map((name) => ({
    name,
    icon: GENRE_VISUALS[name]?.icon ?? "tags",
    color: GENRE_VISUALS[name]?.color ?? "#a78bfa",
  }));

export const formatDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
};

export const timeAgo = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "วันนี้";
  if (days === 1) return "เมื่อวาน";
  if (days < 7) return `${days} วันที่แล้ว`;
  if (days < 30) return `${Math.floor(days / 7)} สัปดาห์ที่แล้ว`;
  if (days < 365) return `${Math.floor(days / 30)} เดือนที่แล้ว`;
  return `${Math.floor(days / 365)} ปีที่แล้ว`;
};
