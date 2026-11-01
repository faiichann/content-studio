import template from '../template.json';

// Keep the copyable example tied to the JSON file shipped with the app.
export const structureJson = JSON.stringify(template, null, 2);
export const contentPrompt = `ช่วยสร้างคอนเทนต์ TikTok Photo Carousel ภาษาไทยสำหรับช่อง faiichannn 🐥
หัวข้อ: [ใส่หัวข้อข่าวหรือความรู้ที่ต้องการ]
กลุ่มผู้อ่าน: Gen Z และวัยทำงาน อ่านง่าย กระชับ

ส่งกลับเป็น JSON object เดียวที่ใช้กับ content-studio ได้ทันที ไม่ต้องมีคำอธิบายก่อนหรือหลัง JSON ไม่ใส่ comment หรือ trailing comma
ใช้แม่แบบด้านล่าง เปลี่ยนข้อความและข้อมูลให้ตรงกับหัวข้อจริง ห้ามเพิ่มฟิลด์นอกโครงสร้าง ไม่ต้องมี status, verification หรือ approvedByUser

แนวทางเนื้อหา:
- สไลด์ 1 cover: ภาพข่าว + พาดหัวดึงดูด + subtitle เกริ่นสั้น เลือก layout classic / dark / feature (ค่าเริ่มต้น classic)
- สไลด์ 2 data: ภาพ กราฟ หรือสถิติ พร้อม explanation ว่าเกิดอะไรขึ้น
- สไลด์ 3 reasons: items เป็น objects ที่มี heading ตัวหนาและ body อธิบายสั้น ๆ
- สไลด์ 4 summary: lines เป็นประโยคสรุปให้เข้าใจเร็ว
- สไลด์ 5 takeaways: items เป็นข้อความเช็กลิสต์สิ่งที่ควรรู้ ไม่ใช่คำถาม ใช้ cta ได้ถ้าจำเป็น
- ทุกหน้ามี footer faiichannn 🐥 ให้อัตโนมัติ ไม่ต้องใส่ซ้ำในเนื้อหา
- ไม่จำกัดจำนวน items / lines / stats แต่ต้องมีอย่างน้อย 1 รายการ เลือกจำนวนให้พอดีพื้นที่ 3:4 และอ่านจบเร็ว
- แหล่งอ้างอิงเก็บใน sources/sourceIds ไม่แสดงเลข [1] [2] บนภาพ
- หากมีตัวเลขหรือข้อเท็จจริง ให้ค้นต้นทางที่เชื่อถือได้ ระบุ sources ห้ามสร้างราคาหุ้น กราฟ หรือ URL แหล่งข้อมูลขึ้นเอง ถ้าไม่มีข้อมูล ให้ใช้ visual.kind=placeholder และบอกว่ารอข้อมูล

ข้อกำหนดของเว็บ:
- schemaVersion ต้องเป็น 2; slides ต้องมี 5 หน้าเรียง cover → data → reasons → summary → takeaways และ id แต่ละหน้าห้ามซ้ำ
- format คง platform=tiktok, width=1080, height=1440, theme=financial-journal
- brand ใช้ faiichannn; category คือ tag ข่าว; event.date ใช้ YYYY-MM-DD ที่มีอยู่จริงและตรงกับเนื้อหา ไม่ใช้วันที่ในแม่แบบเป็นวันข่าวโดยอัตโนมัติ
- event.timezone ใช้ชื่อจริง เช่น Asia/Bangkok หรือ America/New_York; currency เป็นอักษรใหญ่ 3 ตัว เช่น THB/USD; ticker ใช้ MARKET สำหรับข่าวภาพรวม
- theme ใช้สี HEX 6 หลัก เช่น #171717 และ pastels ต้องมี 4 สีตามแม่แบบ
- sourceIds เป็น array ของ id ที่มีใน sources (หากไม่มีอ้างอิง ใช้ []); sources เป็น array ของ {id,type,url}, type เป็น primary/secondary และ url เป็น http/https
- ข้อความที่ส่งมาต้องไม่ว่าง ฟิลด์ optional ที่ไม่ใช้ให้ลบทิ้ง ไม่ส่ง null
- ใช้ \\n ในข้อความเพื่อขึ้นบรรทัดใหม่ และ escape เครื่องหมายคำพูดให้ถูกต้อง
- ความยาวนับ Unicode code points (สระ/วรรณยุกต์อาจนับแยก): title ทุกหน้า ≤65; category ≤28; root.id ≤100; brand ≤40; slide.id/source.id ≤80; ticker ≤16
- cover: subtitle ≤140, emoji ≤8 (ต้องมีแม้ไม่แสดงใน layout ข่าว)
- data: explanation ≤140; placeholder.label ≤70; image.alt ≤120, caption ≤80
- reasons: heading ≤35, body ≤90; summary.lines ข้อละ ≤75; takeaways.items ข้อละ ≤85, cta optional ≤65
- metric: value ต้องเป็น number finite ไม่เกิน ±1 ล้านล้าน, unit ≤12, label ≤45, sourceIds ต้องมี (ใช้ [] ได้)
- JSON รวมไม่เกิน 8 MB; รายการยาวเกินพื้นที่ภาพต้องย่อเนื้อหาเอง

ตัวเลือกเสริม (ใช้เฉพาะเมื่อมีข้อมูลจริง):
1) cover.metric = {"value": NUMBER, "unit": "หน่วย", "label": "คำอธิบาย", "sourceIds": []}
2) cover.image = {"src": "data:image/png;base64,...", "alt": "คำอธิบายภาพ"}
   ภาพต้องเป็น data URL ของ PNG/JPEG/WebP ที่มีอยู่จริง ไม่ใช้ URL เว็บหรือ path ไฟล์ ห้ามสร้าง base64 ปลอม หากไม่มีภาพ ให้ละ cover.image และอัปโหลดภาพในแอปภายหลัง
3) data.visual เลือกได้เพียงหนึ่งแบบ:
   placeholder: {"kind":"placeholder","label":"รอข้อมูลหรือภาพประกอบ"}
   image: {"kind":"image","src":"DATA_URL_จากภาพจริง","alt":"คำอธิบายภาพ","caption":"คำบรรยาย","sourceIds":[]}
   stats: {"kind":"stats","stats":[{"label":"คำอธิบาย","value":NUMBER,"unit":"หน่วย","sourceIds":[]}]}
   chart: {"kind":"chart","chart":{"kind":"line","ticker":"TICKER","interval":"1d","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","points":[],"status":"awaiting_market_data","sourceIds":[]}}
   เมื่อมีข้อมูลกราฟจริง ใช้ status=ready และ points อย่างน้อย 2 จุดรูปแบบ {"date":"YYYY-MM-DD","value":NUMBER} เรียงวันที่จากเก่าไปใหม่ ไม่ซ้ำ อยู่ใน startDate/endDate; หาก points=[] ใช้ awaiting_market_data
   NUMBER, DATA_URL และ YYYY-MM-DD ด้านบนเป็นคำอธิบายรูปแบบ ต้องแทนค่าจริงก่อนส่ง JSON; ถ้าไม่รู้ข้อมูล ใช้ placeholder แทน

แม่แบบ JSON ที่เว็บรองรับ (แทนเนื้อหาตัวอย่างด้วยหัวข้อที่ต้องการ):
\`\`\`json
${structureJson}
\`\`\`
`;
