# content-studio · faiichannn 🐥

เครื่องมือสร้าง TikTok carousel 5 ภาพ ขนาด 1080 × 1440 จาก JSON แบบ live preview — วางหรือแก้ข้อความแล้วสไลด์เปลี่ยนทันที ไม่มี approve, verify หรือปุ่ม Generate ใช้ได้ทั้ง local และ GitHub Pages

## คู่มือแก้โค้ดและ deploy GitHub Pages

| รายการ | ค่าที่ใช้ |
| --- | --- |
| เว็บจริง | https://faiichann.github.io/content-studio/ |
| Repository | https://github.com/faiichann/content-studio |
| Branch ที่เผยแพร่เว็บ | `main` |
| Workflow | `.github/workflows/deploy.yml` |
| ติดตาม deployment | https://github.com/faiichann/content-studio/actions |
| Node.js | 22.12+ (GitHub Actions ใช้ Node 22) |

**คำสั่งที่ทำให้เว็บอัปเดตคือ `git push origin main`** หลังจาก commit การเปลี่ยนแปลงแล้ว GitHub Actions จะรัน `npm ci` → `npm test` → `npm run build` และเผยแพร่โฟลเดอร์ `dist` ให้เอง การแก้ไฟล์หรือ build ในเครื่องอย่างเดียวยังไม่อัปเดตเว็บ ไม่มี script `npm run deploy` และไม่ต้องสร้าง branch `gh-pages`

### 1. เตรียมโปรเจกต์ในเครื่อง

ถ้าใช้โฟลเดอร์เดิมบนเครื่องนี้:

```bash
cd /Users/fairon/Desktop/Faii/content-studio
```

ถ้าใช้เครื่องใหม่หรือยังไม่มี repo ให้เปิด Terminal ที่โฟลเดอร์ที่จะเก็บงาน แล้วรันชุดนี้แทน:

```bash
git clone https://github.com/faiichann/content-studio.git
cd content-studio
```

ก่อนเริ่มแก้แต่ละครั้ง ตรวจว่าไม่มีงานเก่าที่ยังไม่ได้ commit แล้วดึงเวอร์ชันล่าสุด:

```bash
git status
git switch main
git pull --ff-only origin main
npm ci
npm run dev
```

เปิด URL ที่ Terminal แสดง (ปกติ `http://127.0.0.1:5173/content-studio/`) แล้วแก้โค้ดได้ทันที กด `Ctrl+C` เพื่อหยุดเซิร์ฟเวอร์ก่อนรันคำสั่งถัดไป หากมีงานค้างให้ commit หรือเก็บงานนั้นก่อนสลับ branch/pull

ใช้ npm เป็นหลักตาม workflow และเก็บ `package-lock.json` คู่กับ `package.json` เสมอ ถ้าเพิ่มหรือเปลี่ยน dependency ให้ใช้ `npm install` เพื่ออัปเดต lockfile ด้วย

### 2. แก้โค้ดและทดสอบ

| ต้องการแก้ | ไฟล์ |
| --- | --- |
| หน้า editor / ปุ่ม | `src/App.tsx` |
| รูปแบบสไลด์ | `src/SlideCard.tsx`, `src/style.css` |
| โครงสร้างและการตรวจ JSON | `src/validation.ts` |
| Prompt สำหรับปุ่มคัดลอก | `src/contentPrompt.ts`, `template.json` |
| เนื้อหาตัวอย่าง | `sample.json` |
| Export PNG / ZIP | `src/export.ts` |

เมื่อแก้เสร็จ รันทีละคำสั่งและแก้ error ให้ผ่านก่อน deploy:

```bash
npm test
npm run build
npm run preview
```

เปิด `http://127.0.0.1:4173/content-studio/` เพื่อดูไฟล์ build จริง ลองแก้ JSON, เปลี่ยนสไลด์ และดาวน์โหลด PNG/ZIP แล้วหยุด preview ด้วย `Ctrl+C`

ถ้าแก้หน้าจอ, JSON หรือ export ให้ทดสอบในเบราว์เซอร์เพิ่ม:

```bash
npx playwright install chromium
npm run test:e2e
```

Browser tests จะ build และเปิด preview ให้เองที่พอร์ต 5184 ต้องให้พอร์ตนี้ว่าง

### 3. เพิ่มเลขเวอร์ชัน (เลือกทำเมื่อออก release)

Deploy ได้โดยไม่ต้องเปลี่ยนเลขเวอร์ชัน แต่ถ้าต้องการติดตาม release ให้เลือก **เพียงหนึ่งคำสั่ง**:

| ลักษณะการเปลี่ยน | คำสั่ง | ตัวอย่างจาก 1.0.0 |
| --- | --- | --- |
| แก้บั๊ก / ปรับเล็กน้อย | `npm version patch --no-git-tag-version` | 1.0.1 |
| เพิ่มฟีเจอร์ที่ยังรองรับของเดิม | `npm version minor --no-git-tag-version` | 1.1.0 |
| เปลี่ยนจนไม่รองรับรูปแบบเดิม | `npm version major --no-git-tag-version` | 2.0.0 |

คำสั่งนี้อัปเดต `package.json` และ `package-lock.json` โดยยังไม่สร้าง commit/tag และยังไม่ deploy ตรวจการเปลี่ยนแปลงก่อน commit อ่านรายละเอียดได้ที่ [npm version](https://docs.npmjs.com/cli/v11/commands/npm-version/)

### 4. Commit และ deploy จาก main

ตัวอย่างนี้ใช้เมื่อแก้งานบน `main` ตามขั้นตอนข้างต้น:

```bash
git branch --show-current
git status
git diff
git add -u
# ถ้ามีไฟล์ใหม่ ให้เพิ่มเฉพาะไฟล์ที่ต้องการ เช่น:
# git add src/NewComponent.tsx
git diff --cached
git commit -m "Update carousel templates"
git push origin main
```

ผลคำสั่งแรกควรเป็น `main` เปลี่ยนข้อความ commit ให้ตรงกับงาน `git add -u` จะเพิ่มเฉพาะการแก้/ลบไฟล์ที่ Git ติดตามแล้ว จึงต้องเพิ่มไฟล์ใหม่แยกต่างหาก ไม่ต้อง commit `dist` หรือ `node_modules` ส่วนไฟล์ preview/export ส่วนตัวไม่จำเป็นต่อการ deploy

ถ้า Git ขอให้ลงชื่อเข้าใช้ ให้ใช้บัญชี `faiichann` หรือบัญชีที่มีสิทธิ์เขียน repo ผ่าน GitHub Desktop/ตัวจัดการ credentials ที่ใช้กับ Git (GitHub ไม่รับรหัสผ่านบัญชีเป็น password สำหรับ HTTPS push)

ถ้าต้องการติดป้าย release เพิ่ม หลัง commit แล้ว สามารถใช้เลขที่ตรงกับ `package.json` เช่น:

```bash
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1
```

Tag เป็นตัวเลือกสำหรับอ้างอิงเวอร์ชัน ไม่ได้ทำให้เว็บ deploy เอง Workflow นี้รับ push ที่ `main` และการกด Run workflow เท่านั้น

### 5. ตรวจว่าเว็บอัปเดตแล้ว

1. เปิด [Actions](https://github.com/faiichann/content-studio/actions) แล้วเลือก **Deploy Content Studio to GitHub Pages** ของ commit ล่าสุด
2. รอ job `deploy` เป็นสีเขียว / Success โดยขั้นตอน Deploy ต้องผ่านด้วย
3. เปิด [เว็บจริง](https://faiichann.github.io/content-studio/) และตรวจสิ่งที่แก้ รวมถึงลอง export หากมีการเปลี่ยนส่วนนี้
4. ถ้าเห็นหน้าเก่า ให้รอการเผยแพร่สักครู่แล้ว hard refresh (`Cmd+Shift+R` บน Mac หรือ `Ctrl+Shift+R` บน Windows)

### ทางเลือก: แยก branch เพื่อทดลองก่อนเผยแพร่

เริ่มจาก `main` ที่ดึงล่าสุดแล้ว สร้าง branch ใหม่:

```bash
git switch -c feature/update-carousel
# แก้โค้ดและทดสอบตามขั้นตอนที่ 2
git add -u
# เพิ่มไฟล์ใหม่ด้วย git add ตามต้องการ
git commit -m "Improve carousel layout"
git push -u origin feature/update-carousel
```

เปิด Pull Request บน GitHub โดยเลือก base เป็น `main` และ compare เป็น `feature/update-carousel` แล้ว merge เมื่อพร้อม เว็บจะ deploy หลัง merge เข้า `main` เท่านั้น การ push branch ทดลองยังไม่อัปเดตเว็บและไม่มี preview deployment อัตโนมัติ หลัง merge กลับมาที่เครื่อง:

```bash
git switch main
git pull --ff-only origin main
```

### Deploy ซ้ำโดยไม่แก้โค้ด

เปิด Actions → **Deploy Content Studio to GitHub Pages** → **Run workflow** → เลือก branch **main** → **Run workflow** ระบบจะ build และ deploy โค้ดล่าสุดใน `main` อีกครั้ง ไม่จำเป็นต้องสร้าง commit เปล่า

### เมื่อ deploy ไม่ผ่าน

- **Install / npm ci ล้มเหลว:** ตรวจ `package.json` กับ `package-lock.json` ให้ตรงกัน ใช้ `npm install` ในเครื่องแล้ว commit ทั้งสองไฟล์
- **Test / Build ล้มเหลว:** เปิดขั้นตอนสีแดงใน Actions อ่าน error แล้วรัน `npm test` / `npm run build` ในเครื่อง แก้แล้ว commit และ push อีกครั้ง
- **Push ถูกปฏิเสธเพราะมีโค้ดใหม่บน remote:** หลัง commit งานของตัวเองแล้ว รัน `git pull --rebase origin main` ถ้ามี conflict ให้แก้ไฟล์ที่ Git แจ้ง จากนั้น `git add` ไฟล์นั้นและ `git rebase --continue` ทดสอบอีกครั้งแล้ว `git push origin main` ไม่ใช้ force push แทนการแก้ conflict
- **GitHub Pages แจ้งไม่ได้ตั้งค่า:** ตรวจ Settings → Pages → Build and deployment → Source เป็น **GitHub Actions** (repo นี้ตั้งไว้แล้ว)
- **หน้าเว็บว่างหรือไฟล์ 404:** `vite.config.ts` ต้องคง `base: '/content-studio/'` และ workflow ต้อง upload `dist` ตรวจว่า Deploy ของ commit ล่าสุดสำเร็จ

หากต้องย้อนการแก้ไขหนึ่ง commit บน `main` ให้หา commit นั้นจาก `git log --oneline` แล้วใช้ `git revert COMMIT_SHA` (แทน `COMMIT_SHA` ด้วยรหัสจริง) ทดสอบและ `git push origin main` อีกครั้ง จะได้ commit ย้อนกลับและ deploy ใหม่โดยไม่ลบประวัติ สำหรับ merge commit ต้องเลือก parent ให้ถูกก่อน revert

เว็บประมวลผล JSON และสร้างภาพในเบราว์เซอร์ ไม่อัปโหลด JSON/ภาพของผู้ใช้ไป GitHub การแก้คอนเทนต์ในหน้าเว็บจึงไม่เปลี่ยน source code หรือเวอร์ชันเว็บ

อ้างอิงการตั้งค่า: [Vite GitHub Pages](https://vite.dev/guide/static-deploy#github-pages)

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
