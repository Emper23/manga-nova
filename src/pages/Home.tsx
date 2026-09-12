import { Link, useNavigate } from "react-router-dom";
import { HeroBanner } from "../components/HeroBanner";
import { MangaCard, MangaCardSkeleton } from "../components/MangaCard";
import { GenrePills } from "../components/GenrePills";
import { Icon } from "../components/Icon";
import { MangaCover } from "../components/MangaCover";
import { usePopularManga, useLatestUpdates } from "../hooks/useMangaData";
import { useApp } from "../context/AppContext";
import { timeAgo } from "../data/manga";

export function Home() {
  const popular = usePopularManga(18);
  const latest = useLatestUpdates(6);
  const { recordProgress, toast } = useApp();
  const navigate = useNavigate();

  // Keep the hero aligned with the reference artwork when that title is in the live catalog.
  const heroManga = popular.data?.find((item) => item.id.includes("magic-emperor")) ?? popular.data?.[0];
  const grid = popular.data?.slice(0, 6) ?? [];
  const ranking = popular.data?.slice(0, 5) ?? [];
  const loading = popular.loading;
  const latestList = latest.data ?? [];

  const openLatest = (item: (typeof latestList)[number]) => {
    recordProgress(item.manga.id, item.chapter.number, 0);
    toast(`กำลังเปิดตอนที่ ${item.chapter.number} ของ ${item.manga.title}`, "info");
    navigate(`/read/${item.manga.id}/${item.chapter.externalId}`);
  };

  return (
    <div className="home-page">
      <div className="container home-layout">
        <div className="home-main">
          <HeroBanner manga={heroManga} loading={loading} />

          <section className="home-section home-popular">
            <div className="section-head">
              <h2 className="section-title">
                <span className="section-icon section-icon-hot"><Icon name="flame" size={18} /></span>
                กำลังมาแรง
              </h2>
              <Link to="/popular" className="see-all">
                ดูทั้งหมด <Icon name="chevronRight" size={15} />
              </Link>
            </div>
            <div className="manga-grid stagger">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <MangaCardSkeleton key={i} />)
                : grid.map((m, i) => <MangaCard key={m.id} manga={m} index={i} />)}
            </div>
          </section>

          <section className="home-section home-latest">
            <div className="section-head">
              <h2 className="section-title">
                <span className="section-icon section-icon-clock"><Icon name="clock" size={18} /></span>
                อัปเดตล่าสุด
              </h2>
              <Link to="/latest" className="see-all">
                ดูทั้งหมด <Icon name="chevronRight" size={15} />
              </Link>
            </div>
            <div className="latest-grid stagger">
              {latestList.length === 0
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="latest-card" aria-hidden="true">
                      <span className="skeleton" style={{ width: 52, height: 72, borderRadius: 10 }} />
                      <span className="latest-info">
                        <span className="skeleton" style={{ height: 13, width: "70%" }} />
                        <span className="skeleton" style={{ height: 11, width: "45%" }} />
                      </span>
                    </div>
                  ))
                : latestList.map((item, i) => (
                    <button
                      key={item.chapter.id}
                      className="latest-card"
                      style={{ animationDelay: `${i * 0.05}s` }}
                      onClick={() => openLatest(item)}
                    >
                      <span className="latest-thumb">
                        <MangaCover manga={item.manga} />
                        <span className="badge badge-new latest-new">NEW</span>
                      </span>
                      <span className="latest-info">
                        <span className="latest-title">{item.manga.title}</span>
                        <span className="latest-chapter">ตอนที่ {item.chapter.number}</span>
                        <span className="latest-time">
                          <Icon name="clock" size={12} />
                          {timeAgo(item.chapter.date)}
                        </span>
                      </span>
                      <span className="latest-read">
                        <Icon name="play" size={14} />
                        อ่าน
                      </span>
                    </button>
                  ))}
            </div>
          </section>

          <section className="home-section home-genres">
            <div className="section-head">
              <h2 className="section-title">
                <span className="section-icon section-icon-tags"><Icon name="tags" size={18} /></span>
                ค้นหาตามหมวด
              </h2>
              <Link to="/genres" className="see-all">
                หมวดทั้งหมด <Icon name="chevronRight" size={15} />
              </Link>
            </div>
            <GenrePills />
          </section>
        </div>

        <aside className="home-sidebar" aria-label="สรุปมังงะ">
          <section className="sidebar-panel">
            <div className="sidebar-head">
              <h2><Icon name="flame" size={17} /> อัปเดตวันนี้</h2>
              <Link to="/latest">ดูทั้งหมด</Link>
            </div>
            <div className="sidebar-updates">
              {latestList.length === 0
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div className="sidebar-update" key={i} aria-hidden="true">
                      <span className="skeleton sidebar-update-cover" />
                      <span className="sidebar-update-copy"><span className="skeleton" /><span className="skeleton" /></span>
                    </div>
                  ))
                : latestList.slice(0, 5).map((item) => (
                    <button key={item.chapter.id} className="sidebar-update" onClick={() => openLatest(item)}>
                      <span className="sidebar-update-cover"><MangaCover manga={item.manga} /></span>
                      <span className="sidebar-update-copy">
                        <strong>{item.manga.title}</strong>
                        <small>ตอนที่ {item.chapter.number} · {timeAgo(item.chapter.date)}</small>
                      </span>
                      <span className="sidebar-new">NEW</span>
                    </button>
                  ))}
            </div>
          </section>

          <section className="sidebar-panel sidebar-ranking">
            <div className="sidebar-head">
              <h2><Icon name="trophy" size={17} /> TOP 5 ยอดนิยม</h2>
              <Link to="/popular">ดูทั้งหมด</Link>
            </div>
            <div className="ranking-list">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div className="ranking-row" key={i} aria-hidden="true">
                      <span className="ranking-number">0{i + 1}</span><span className="skeleton ranking-cover" /><span className="skeleton ranking-line" />
                    </div>
                  ))
                : ranking.map((m, i) => (
                    <Link to={`/manga/${m.id}`} className="ranking-row" key={m.id}>
                      <span className="ranking-number">{String(i + 1).padStart(2, "0")}</span>
                      <span className="ranking-cover"><MangaCover manga={m} /></span>
                      <span className="ranking-copy"><strong>{m.title}</strong><small><Icon name="starFilled" size={11} className="star-icon" /> {m.rating.toFixed(1)} · {m.chapters} ตอน</small></span>
                    </Link>
                  ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
