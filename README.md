# content-studio · faiichannn 🐥

เครื่องมือสร้าง TikTok carousel 5 ภาพ ขนาด 1080 × 1440 จาก JSON แบบ live preview — วางหรือแก้ข้อความแล้วสไลด์เปลี่ยนทันที ไม่มี approve, verify หรือปุ่ม Generate ใช้ได้ทั้ง local และ GitHub Pages

## GitHub Pages

URL สำหรับเผยแพร่: https://faiichann.github.io/content-studio/

ตั้งค่า repo `faiichann/content-studio` → Settings → Pages → Source เป็น **GitHub Actions** แล้ว push เข้า `main` ระบบจะติดตั้ง dependencies, ทดสอบ, build และ deploy อัตโนมัติจาก `.github/workflows/deploy.yml` หรือสั่ง Run workflow จากแท็บ Actions ได้

Vite ใช้ base `/content-studio/` เพื่อให้ JavaScript, CSS และฟอนต์โหลดถูกต้องบน GitHub Pages เว็บประมวลผล JSON และสร้างภาพในเบราว์เซอร์ ไม่มี backend และไม่อัปโหลด JSON/ภาพของผู้ใช้ไป GitHub

ทดสอบไฟล์ก่อนเผยแพร่ด้วย `npm run build` และ `npm run preview` แล้วเปิด `http://127.0.0.1:4173/content-studio/`

แนวทางตั้งค่า: [Vite GitHub Pages](https://vite.dev/guide/static-deploy#github-pages)

## เริ่มใช้งาน

Node.js 22.12+:

```bash
npm install
npm run dev
```

ถ้าติดตั้งไว้แล้วใช้ `npm run dev` หรือ `pnpm dev` ได้เลย เปิด URL ที่ Terminal แสดง ไม่มี API key หรือ hosting ใช้อินเทอร์เน็ตตอนติดตั้งครั้งแรกเท่านั้น

## ใช้งาน

- Paste / upload JSON แล้วพรีวิวอัปเดตอัตโนมัติ
- ขณะ JSON ยังพิมพ์ไม่ครบ แอปคงพรีวิวล่าสุดและแจ้งจุดที่ต้องแก้
- เลือกปก News Classic, News Dark หรือ News Feature
- ใส่ภาพข่าวบนปก หรือภาพใน Data ด้วย PNG/JPEG/WebP ไม่เกิน 5 MB
- ภาพฝังใน JSON เป็น data URL ไม่ติดปัญหา CORS ไม่ส่งรูปไปเซิร์ฟเวอร์
- บันทึก JSON ปัจจุบันเก็บไว้แก้ต่อได้ (ไม่บันทึกอัตโนมัติ)
- Export PNG ภาพเดียว หรือ ZIP ทั้ง 5 ภาพด้วย html-to-image / JSZip

โทนล่าสุดตามแชทอ้างอิง: **Editorial News × Minimal Yellow & Black** ปก Classic เป็นกระดาษ off-white และป้ายเหลือง ภาพข่าวด้านบน พาดหัวและ quick brief ด้านล่าง; Dark เป็นชาร์โคล; Feature วางข้อความบนภาพพร้อมเงาดำเพื่อให้อ่านง่าย Footer ทุกหน้าคือ faiichannn 🐥

## คัดลอกโครงสร้างไปสร้างคอนเทนต์

เปิดหัวข้อ “โครงสร้าง JSON ที่รองรับ” แล้วกด “คัดลอกโครงสร้าง JSON” จะได้ prompt ภาษาไทย + กฎฟิลด์ + แม่แบบที่ไม่มีภาพ base64 หรือข้อมูลของงานปัจจุบัน นำไปวางในแชท เปลี่ยนหัวข้อ แล้วนำ JSON ที่ได้กลับมาวางในแอป หาก clipboard ถูกบล็อก จะมีช่องข้อความให้เลือกคัดลอกเอง และดาวน์โหลด template.json ได้

## JSON v2

ดู `template.json` สำหรับโครงสร้างเล็ก ๆ และ `sample.json` สำหรับตัวอย่าง “ฟองสบู่ AI ดูจากอะไร?” พร้อมภาพฝังในไฟล์ อ่านรายละเอียดใน `JSON-GUIDE.md`

ไม่ต้องส่ง `status`, `verification` หรือ `approvedByUser` หาก JSON เดิมมี status/verification ที่ระดับบนสุด แอปจะละทิ้งสองฟิลด์นี้โดยไม่ขัดขวางการสร้างภาพ การตรวจที่เหลือเป็นเพียงรูปแบบข้อมูลและการจัดวาง ไม่ใช่การอนุมัติข่าว

JSON รุ่นเก่าที่ใช้ chart/cards/takeaway ต้องแปลงมาใช้ v2 ตาม template ก่อน ไม่มีตัวแปลงรุ่นเก่าอัตโนมัติ

## เนื้อหาตัวอย่าง

ชุด “ฟองสบู่ AI ดูจากอะไร?” เป็นสื่อความรู้เชิงตั้งคำถาม ไม่ได้ฟันธงว่าตลาดเป็นฟองสบู่ ภาพปกเป็นภาพประกอบแนวคิดที่สร้างขึ้น และ Data เป็นแผนภาพความคาดหวังกับรายได้จริง ไม่ใช่ภาพเหตุการณ์หรือกราฟราคา แหล่งอ้างอิงอยู่ใน `SOURCES.md` และ JSON ไม่มีตัวเลขราคาหุ้นที่แต่งขึ้น

## ทดสอบ

```bash
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

Browser tests ใช้พอร์ต 5184 รองรับ CHROME_PATH สำหรับ Chrome ที่ติดตั้งอยู่ ทดสอบ live JSON, invalid JSON, upload, export PNG/ZIP, ภาพ Data, กราฟ, ปกสามแบบ และมือถือ

ไฟล์สำคัญ: `src/validation.ts` (types/parser), `src/SlideCard.tsx` (layouts), `src/App.tsx` (live editor), `src/style.css` (design), `src/export.ts` (PNG/ZIP)

ฟอนต์ Noto Sans Thai โหลดในเครื่อง การ export รอภาพและฟอนต์พร้อม รองรับข้อความธรรมดา ไม่ประมวลผล HTML ใน JSON ภาพผิดรูปแบบจะแจ้งตอนส่งออก ข้อความล้นจะให้ย่อก่อนส่งออก
