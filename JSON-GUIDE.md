# โครงสร้าง JSON v2 — วางแล้วเป็นสไลด์

ใช้ `template.json` เป็นแม่แบบ หรือ `sample.json` เป็นตัวอย่างพร้อมภาพ ไม่ต้องมีสถานะอนุมัติหรือ verification

## Root

| Field | ความหมาย |
|---|---|
| schemaVersion | `2` |
| id | ชื่อชุด ใช้ข้อความสั้น ๆ |
| brand | `faiichannn` (footer แสดง faiichannn 🐥 ตามช่อง) |
| category | tag ประเภทเนื้อหา ไม่เกิน 28 ตัวอักษร |
| format | platform=tiktok, width=1080, height=1440, theme=financial-journal |
| event | ticker, date YYYY-MM-DD, timezone, currency |
| theme | background, foreground, muted, accent, pastels 4 สีแบบ HEX |
| slides | 5 หน้า เรียง cover / data / reasons / summary / takeaways |
| sources | `{id,type:"primary" หรือ "secondary",url}` ใส่ [] ได้ |

## Slide 1 — Cover

```json
{
  "id": "cover",
  "type": "cover",
  "layout": "classic",
  "title": "ฟองสบู่ AI\nดูจากอะไร?",
  "subtitle": "เทคโนโลยีดี… แต่ราคาหุ้นอาจวิ่งนำอนาคตไปแล้ว",
  "emoji": "🫧"
}
```

layout ใช้ classic/dark/feature เพิ่ม `image: {src,alt}` โดย src เป็น data URL จากการอัปโหลดภาพ หากยังไม่มีภาพจะแสดงพื้นที่ให้ใส่ภาพ

เพิ่ม `metric: {value,unit,label,sourceIds}` ได้เฉพาะเมื่อมีตัวเลขจริงที่ต้องการเน้น ส่วน emoji เก็บไว้เป็น metadata เพื่อรองรับเนื้อหาเดิม ปกข่าวใหม่เน้นภาพเป็นหลัก

## Slide 2 — Data

```json
{
  "id": "data",
  "type": "data",
  "title": "ข้อมูลกำลังบอกอะไร?",
  "visual": {"kind":"placeholder","label":"ใส่ข้อมูลต้นทาง"},
  "explanation": "เล่าว่าเกิดอะไรขึ้นแบบสั้น ๆ",
  "sourceIds": []
}
```

visual เลือกหนึ่งรูปแบบ:

- `placeholder`: `{kind,label}` ไม่มีข้อมูลก็ไม่สร้างกราฟสมมติ
- `image`: `{kind,src,alt,caption,sourceIds}` อัปโหลดภาพในแอปแล้วบันทึก JSON ได้
- `stats`: `{kind,stats:[{value,unit,label,sourceIds}]}` จำนวน 1+ ค่า
- `chart`: `{kind,chart:{kind:"line",ticker,interval:"1d",startDate,endDate,points,status,sourceIds}}`

จุดกราฟเป็น `{date:"2026-10-29",value:283.82}` รูปแบบตัวอย่างเท่านั้น ไม่ใช่การยืนยันราคาจริง status เป็น ready เมื่อมี 1+66 จุดเรียงวันที่ไม่ซ้ำ และอยู่ในช่วง startDate/endDate หรือ awaiting_market_data กับ points=[] ระหว่างรอข้อมูล แอปไม่มี API ดึงราคา

## Slide 3 — Why

`{id,type:"reasons",title,items:[{heading,body,sourceIds}]}` จำนวน 1+ ข้อ หัวข้อสั้น ตัวหนา ตามด้วยคำอธิบายรองรับ

## Slide 4 — Summary

`{id,type:"summary",title,lines:["สรุปบรรทัดแรก","บรรทัดที่สอง"],sourceIds:[]}` จำนวน 1+ ประโยค อ่านจบเร็ว ไม่ใช้การ์ดสถิติซ้ำ

## Slide 5 — Key Takeaways

`{id,type:"takeaways",title,items:["สิ่งที่ควรรู้ข้อแรก","สิ่งที่ควรรู้ข้อที่สอง"],cta:"ชวนคุยสั้น ๆ"}` เช็กลิสต์ 1+ ข้อ พร้อมช่อง checkbox cta ไม่บังคับ

## ข้อจำกัดเพื่อให้อ่านง่าย

title ≤65, cover.subtitle ≤140, data.explanation ≤140, reasons.heading ≤35, reasons.body ≤90, summary.lines ข้อละ ≤75, items ของ takeaways ข้อละ ≤85 ตัวอักษร ใช้ `\n` คุมจังหวะขึ้นบรรทัดได้ ภาพฝังทำให้ JSON ยาวขึ้น รองรับรวม 8 MB

sourceIds เป็น metadata ที่เชื่อมกับ sources และไม่แสดงเลขอ้างอิงบนภาพ ต้องตรงกัน แต่ไม่ใช่ระบบ verify ไม่ตรวจความจริงให้อัตโนมัติ

สไลด์ 5 ใช้ `items` เป็นข้อสรุปที่ควรจำ ไม่ใช่คำถาม JSON รุ่นก่อนที่ส่ง `questions` ยังเปิดได้ โดยแปลงชื่อฟิลด์เป็น `items` อัตโนมัติ (คงข้อความเดิม)

Content arrays (items, lines, stats, points, sources, sourceIds) have no maximum item count. The canvas remains 3:4: shorten content if it overflows. JSON files remain limited to 8 MB.
