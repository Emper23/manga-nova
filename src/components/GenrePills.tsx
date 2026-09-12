import { useNavigate } from "react-router-dom";
import { GENRES } from "../data/manga";
import { Icon, type IconName } from "./Icon";

export function GenrePills({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  return (
    <div className={`genre-pills ${compact ? "genre-pills-compact" : ""}`}>
      {GENRES.slice(0, 12).map((g) => (
          <button
            key={g.name}
            className="genre-pill"
            style={{ "--pill-color": g.color } as React.CSSProperties}
            onClick={() => navigate(`/genres?genre=${encodeURIComponent(g.name)}`)}
            aria-label={`หมวด ${g.name}`}
          >
            <span className="genre-pill-icon">
              <Icon name={g.icon as IconName} size={15} />
            </span>
            {!compact && <span>{g.name}</span>}
          </button>
      ))}
    </div>
  );
}
