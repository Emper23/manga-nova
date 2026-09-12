# MANGA NOVA 🌌

แพลตฟอร์มอ่านมังงะออนไลน์ระดับพรีเมียม — Modern Dark UI + Glassmorphism ผสม Anime/Manga aesthetic
ออกแบบให้ดูเหมือน Netflix + Webtoon + Manga Reader

## ✨ คุณสมบัติ

- **ข้อมูลมังงะจาก mangablackcat.com** — ชื่อจริง, หมวด, เรตติ้งแบบ deterministic, ปกจริง และหน้าการ์ตูนจริงใน Reader ผ่าน proxy ของโปรเจกต์
- **หน้า Home** — Hero banner แบบ cinematic พร้อม particle effect, มังงะยอดนิยม (grid 6/4/2), ตอนใหม่ล่าสุด, หมวดหมู่
- **หน้า Manga Detail** — ข้อมูลครบ (rating/views/status/author/genres), ปุ่มอ่าน/บุ๊กมาร์ก/แชร์, chapter list **ครบทุกตอน** (ดึงทั้งหมดแบบ paginate) พร้อมค้นหา + กรอง + Load More + ป้ายภาษาของตอน
- **หน้า Reader** — โหมดอ่านเต็มจอ, lazy loading, progress bar, ปุ่ม Previous/Next, Scroll to Top, Fullscreen, สลับโหมดมืด/สว่าง, ปรับความกว้างภาพ, ระยะห่างระหว่างหน้า, Auto-hide controls, คีย์บอร์ด (←→เปลี่ยนตอน, ↑↓เลื่อน)
- **Search** — Command palette แบบเต็มจอ (Ctrl+K / ⌘K), ค้นหาชื่อ/นักเขียน/หมวด, recent searches, คีย์บอร์ด navigation
- **My Library** — อ่านต่อ / บุ๊กมาร์ก / อ่านจบแล้ว / ดูล่าสุด พร้อม progress bar (เก็บ ID ของ mangablackcat)
- **Profile** — Dashboard ผู้ใช้: สถิติ, หมวดที่ชอบ, ประวัติการอ่าน, บุ๊กมาร์ก
- **Dark / Light mode** — สลับธีมได้ จำค่าไว้ใน localStorage
- **Responsive** — Desktop (6 คอลัมน์) → Tablet (4) → Mobile (2) + Bottom Navigation
- **Micro-interactions** — hover animation, skeleton loading, toast, fade/scale transition, glass panel, glow effect

## 🛠 เทคโนโลยี

- React 19 + TypeScript + Vite 8
- React Router 7
- CSS custom properties (design tokens) — ไม่มี UI framework ภายนอก
- **มังงะภาพสีแปลไทยจาก mangablackcat.com** (`src/api/bully.ts`) — หน้า `/manhua` + section ใน Home, รายการหมวด และภาพจริงทุกตอน
- **Proxy สำหรับข้อมูลต้นทาง** — Vite ใช้ใน dev/preview และ `server.mjs` ใช้เมื่อเสิร์ฟ `dist` ด้วย `npm run start`
- **ลำดับภาษาที่อ่าน: ไทย → อังกฤษ → ภาษาที่มี** — ป้ายภาษาแสดงบนหน้ารายชื่อตอนและ Reader
- ภาพหน้าอ่านจาก CDN ต้นทางโดยตรง พร้อม fallback art เมื่อไม่มีรายการภาพ

## 🚀 เริ่มใช้งาน

```bash
npm install
npm run dev      # dev server ที่ http://localhost:5173
npm run build    # build production
npm run lint     # ตรวจ lint
npm run start    # เสิร์ฟ dist พร้อม proxy ที่ http://localhost:4173
```

## 🗂 โครงสร้าง

```
src/
├── api/         # mangablackcat.com (Manhua) layer + shared language helpers
├── components/  # Header, Footer, BottomNav, MangaCard, HeroBanner,
│                # SearchOverlay, MangaCover (รูปจริง + SVG fallback), ReaderPageArt, Icon, Toasts...
├── context/     # AppContext — theme, library (localStorage), toasts, search state
├── data/        # Mock ข้อมูลมังงะ 22 เรื่อง + ตอน (ใช้เมื่อ API ออฟไลน์)
├── hooks/       # useMangaData (ดึงข้อมูล async), usePageLoad
├── pages/       # Home, MangaDetail, Reader, MangaList, Library, Profile, Search, Genres
├── styles/      # Design system (tokens) + component/page styles
└── types.ts     # Type definitions
```

## 🔌 เกี่ยวกับ API

- รายการและตอนหลักอยู่ใน `src/api/bully.ts` โดยอ่านหน้าหมวด `/genre/<slug>` และหน้ารายละเอียดจาก mangablackcat.com
- `vite.config.ts` ทำ proxy สำหรับ dev/preview ส่วน `server.mjs` ทำ static hosting + proxy สำหรับ production build
- ถ้าแหล่งข้อมูลต้นทางไม่พร้อม เว็บจะแสดงสถานะโหลดไม่สำเร็จหรือ fallback art ตามหน้าที่ใช้งาน

> เว็บไซต์นี้เป็นโปรเจกต์สาธิต (Demo) — ข้อมูล ภาพปก และหน้าอ่านดึงมาจาก mangablackcat.com
> เพื่อการสาธิตเท่านั้น ไม่เกี่ยวข้องกับผู้สร้างผลงานต้นฉบับ
