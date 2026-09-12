import { Link } from "react-router-dom";

type InfoPageKind = "about" | "terms" | "privacy" | "contact" | "dmca";

interface InfoPageContent {
  title: string;
  lead: string;
  sections: { heading: string; body: string }[];
}

const CONTENT: Record<InfoPageKind, InfoPageContent> = {
  about: {
    title: "เกี่ยวกับ MANGA NOVA",
    lead: "MANGA NOVA คือเว็บสาธิตสำหรับทดลองประสบการณ์อ่านมังฮัวบนเว็บและมือถือ",
    sections: [
      { heading: "แนวคิดของโปรเจกต์", body: "ออกแบบให้ค้นหาเรื่อง อ่านตอน จัดเก็บบุ๊กมาร์ก และกลับมาอ่านต่อได้ในหน้าจอเดียว โดยเน้นการใช้งานที่ชัดเจนและโหลดข้อมูลแบบค่อยเป็นค่อยไป" },
      { heading: "แหล่งข้อมูล", body: "ข้อมูลมังงะ ภาพปก และหน้าตอนอ่านดึงจาก mangablackcat.com เพื่อการสาธิตเท่านั้น โปรดสนับสนุนเจ้าของผลงานและแหล่งเผยแพร่ต้นฉบับอย่างถูกต้อง" },
    ],
  },
  terms: {
    title: "เงื่อนไขการใช้งาน",
    lead: "หน้านี้เป็นข้อตกลงแบบย่อสำหรับโปรเจกต์สาธิต MANGA NOVA",
    sections: [
      { heading: "การใช้งาน", body: "เว็บนี้จัดทำขึ้นเพื่อการสาธิตฟังก์ชันเท่านั้น ข้อมูลอาจเปลี่ยนแปลง หายไป หรือใช้งานไม่ได้เมื่อแหล่งข้อมูลต้นทางไม่พร้อมใช้งาน" },
      { heading: "เนื้อหา", body: "MANGA NOVA ไม่ได้อ้างสิทธิ์ในผลงานหรือภาพที่แสดง การใช้งานเนื้อหาต้องเป็นไปตามสิทธิ์และเงื่อนไขของเจ้าของผลงานและแหล่งข้อมูลต้นทาง" },
    ],
  },
  privacy: {
    title: "นโยบายความเป็นส่วนตัว",
    lead: "โปรเจกต์นี้ไม่มีระบบบัญชีหรือฐานข้อมูลผู้ใช้บนเซิร์ฟเวอร์",
    sections: [
      { heading: "ข้อมูลที่เก็บในเครื่อง", body: "ธีม บุ๊กมาร์ก ประวัติการอ่าน และคำค้นล่าสุดเก็บไว้ใน localStorage ของเบราว์เซอร์เครื่องนั้น เพื่อให้เว็บจำการตั้งค่าระหว่างการใช้งาน" },
      { heading: "คำขอไปยังแหล่งข้อมูล", body: "เมื่อเปิดรายการหรือหน้าตอน เว็บจะส่งคำขอไปยัง proxy ของโปรเจกต์และแหล่งข้อมูลต้นทางตามที่จำเป็นต่อการแสดงผล" },
    ],
  },
  contact: {
    title: "ติดต่อ",
    lead: "MANGA NOVA เป็นโปรเจกต์สาธิต จึงยังไม่มีบัญชีหรืออีเมลสนับสนุนแยกต่างหาก",
    sections: [
      { heading: "ปัญหาข้อมูลหรือภาพ", body: "หากต้องการแจ้งเรื่องข้อมูลหรือภาพ โปรดติดต่อแหล่งข้อมูลต้นทางโดยตรงผ่านลิงก์ในส่วนท้ายของเว็บ" },
      { heading: "ปัญหาการใช้งาน", body: "สำหรับการพัฒนาในเครื่อง สามารถตรวจสอบ README และผลลัพธ์จาก npm run lint / npm run build ในโปรเจกต์นี้ได้" },
    ],
  },
  dmca: {
    title: "การแจ้งลิขสิทธิ์",
    lead: "MANGA NOVA ไม่ได้เป็นเจ้าของหรือผู้เผยแพร่ผลงานต้นฉบับ",
    sections: [
      { heading: "ช่องทางแจ้งเรื่อง", body: "หากพบเนื้อหาที่ละเมิดสิทธิ์ โปรดแจ้งไปยังเจ้าของผลงานหรือแหล่งเผยแพร่ต้นทางโดยตรง เนื่องจากเว็บนี้เป็นเพียงโปรเจกต์สาธิตที่ดึงข้อมูลมาแสดง" },
      { heading: "ขอบเขตของเว็บสาธิต", body: "ข้อมูลที่แสดงอาจถูกลบหรือเปลี่ยนแปลงตามแหล่งต้นทาง และไม่มีการอัปโหลดไฟล์ผลงานเข้าระบบของ MANGA NOVA" },
    ],
  },
};

export function InfoPage({ kind }: { kind: InfoPageKind }) {
  const content = CONTENT[kind];

  return (
    <div className="container info-page anim-fade-in">
      <Link to="/" className="info-back">
        ← กลับหน้าหลัก
      </Link>
      <article className="info-card card">
        <span className="info-eyebrow">MANGA NOVA · DEMO</span>
        <h1>{content.title}</h1>
        <p className="info-lead">{content.lead}</p>
        <div className="info-sections">
          {content.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
