import { Link, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { fetchDevilRelated, fetchDevilVideo, type DevilVideoSummary } from "../api/devil";
import { useLoader } from "../hooks/useMangaData";

export function DevilWatch() {
  const { id = "" } = useParams<{ id: string }>();
  const video = useLoader(() => fetchDevilVideo(id), [id]);
  const related = useLoader<DevilVideoSummary[]>(
    async () => {
      try {
        return await fetchDevilRelated(id);
      } catch {
        return [];
      }
    },
    [id]
  );

  if (video.loading && !video.data) {
    return (
      <div className="container watch-page anim-fade-in">
        <div className="skeleton video-player-skeleton" />
        <div className="skeleton" style={{ height: 28, width: "70%", marginTop: 16 }} />
      </div>
    );
  }

  if (!video.data || video.error) {
    return (
      <div className="container not-found anim-fade-in">
        <h1>เปิดวิดีโอนี้ไม่ได้</h1>
        <p className="list-sub">
          ต้นทางอาจลบวิดีโอหรือป้องกันการเชื่อมต่อผ่าน proxy
          {video.errorMessage ? ` (สาเหตุ: ${video.errorMessage})` : ""}
        </p>
        <div className="age-gate-actions">
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            ลองอีกครั้ง
          </button>
          <Link to="/videos" className="btn btn-ghost">
            กลับหน้ารายการ
          </Link>
        </div>
      </div>
    );
  }

  const data = video.data;

  return (
    <div className="container watch-page anim-fade-in">
      <Link to="/videos" className="detail-back">
        <Icon name="arrowLeft" size={16} /> ย้อนกลับ
      </Link>

      <div className="video-frame-wrap card">
        <iframe
          key={data.embedUrl}
          src={data.embedUrl}
          title={data.title}
          className="video-frame"
          referrerPolicy="no-referrer"
          allowFullScreen
          scrolling="no"
        />
      </div>

      <h1 className="watch-title">{data.title}</h1>

      {data.tags.length > 0 && (
        <div className="watch-tags">
          {data.tags.map((tag) => (
            <span key={tag} className="genre-chip">
              {tag}
            </span>
          ))}
        </div>
      )}

      {related.data && related.data.length > 0 && (
        <section className="home-section">
          <div className="section-head">
            <h2 className="section-title">
              <span className="tick" />
              วิดีโอแนะนำ
            </h2>
          </div>
          <div className="video-grid stagger">
            {related.data.map((item, i) => (
              <Link
                key={item.id}
                to={`/videos/${item.id}`}
                className="video-card"
                style={{ animationDelay: `${i * 0.04}s` }}
                aria-label={item.title}
              >
                <span className="video-card-thumb">
                  <img src={item.thumbUrl} alt="" loading="lazy" />
                  <span className="video-card-play">
                    <Icon name="play" size={22} />
                  </span>
                </span>
                <span className="video-card-title">{item.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
