import { Link } from "react-router-dom";

const LINKS = [
  { label: "About", to: "/about" },
  { label: "Terms", to: "/terms" },
  { label: "Privacy", to: "/privacy" },
  { label: "Contact", to: "/contact" },
  { label: "DMCA", to: "/dmca" },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-glow" aria-hidden="true" />
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <img className="brand-logo-image" src="/assets/manga-nova-logo-navbar.png" alt="MANGA NOVA" />
            </Link>
            <p>
              แพลตฟอร์มอ่านมังงะออนไลน์ระดับพรีเมียม
              <br />
              อ่านได้ทุกที่ ทุกเวลา บนทุกอุปกรณ์
            </p>
          </div>
          <div className="footer-links">
            <h4>ลิงก์</h4>
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="footer-link">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="footer-links">
            <h4>เมนู</h4>
            <Link to="/latest" className="footer-link">ตอนล่าสุด</Link>
            <Link to="/popular" className="footer-link">ยอดนิยม</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} MANGA NOVA. สงวนลิขสิทธิ์</span>
          <span className="footer-made">
            สร้างด้วย <span className="gradient-text">ความรัก</span> และมังงะ
          </span>
        </div>
      </div>
    </footer>
  );
}
