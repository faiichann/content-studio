export type Source = { id: string; type: 'primary' | 'secondary'; url: string };
export type Point = { date: string; value: number };
type Base = { id: string; title: string };
export type Metric = { value: number; unit: string; label: string; sourceIds: string[] };
export type Cover = Base & { type: 'cover'; subtitle: string; emoji: string; layout?: 'classic' | 'dark' | 'feature'; image?: { src: string; alt: string }; metric?: Metric };
export type LineChart = { kind: 'line'; ticker: string; interval: '1d'; startDate: string; endDate: string; points: Point[]; status: 'awaiting_market_data' | 'ready'; sourceIds: string[] };
export type Visual = { kind: 'placeholder'; label: string } | { kind: 'chart'; chart: LineChart } | { kind: 'image'; src: string; alt: string; caption: string; sourceIds: string[] } | { kind: 'stats'; stats: Metric[] };
export type Chart = Base & { type: 'data'; visual: Visual; explanation: string; sourceIds: string[] };
export type Reasons = Base & { type: 'reasons'; items: { heading: string; body: string; sourceIds: string[] }[] };
export type Summary = Base & { type: 'summary'; lines: string[]; sourceIds: string[] };
export type Takeaways = Base & { type: 'takeaways'; items: string[]; cta?: string };
export type Slide = Cover | Chart | Reasons | Summary | Takeaways;
export type Carousel = {
  schemaVersion: 2; category: string; id: string; brand: string;
  format: { platform: 'tiktok'; width: 1080; height: 1440; theme: 'financial-journal' };
  event: { ticker: string; date: string; timezone: string; currency: string };
  theme: { background: string; foreground: string; muted: string; accent: string; pastels: string[] };
  slides: [Cover, Chart, Reasons, Summary, Takeaways]; sources: Source[];

};
export const MAX_BYTES = 8_000_000;
export const SLIDE_LABELS = ['Hook', 'Data', 'Why', 'Summary', 'Key Takeaways'];
// Small schema helpers keep nested errors readable without an additional runtime dependency.
type Rule = (value: unknown, path: string, errors: string[]) => void;
const text = (max: number): Rule => (v, p, e) => { if (typeof v !== 'string' || !v.trim() || Array.from(v).length > max) e.push(`${p}: ต้องเป็นข้อความ 1–${max} ตัวอักษร`); };
const choice = (...values: unknown[]): Rule => (v, p, e) => { if (!values.includes(v)) e.push(`${p}: ต้องเป็น ${values.join(' / ')}`); };
const number: Rule = (v, p, e) => { if (typeof v !== 'number' || !Number.isFinite(v) || Math.abs(v) > 1e12) e.push(`${p}: ต้องเป็นตัวเลข finite ในช่วง ±1 ล้านล้าน`); };
const list = (rule: Rule, min: number, max = Infinity): Rule => (v, p, e) => { if (!Array.isArray(v) || v.length < min || v.length > max) { e.push(`${p}: ต้องมี ${min}–${Number.isFinite(max) ? max : "unlimited"} รายการ`); return; } v.forEach((x,i) => rule(x,`${p}[${i}]`,e)); };
const optional = (rule: Rule): Rule => (v,p,e) => { if (v !== undefined) rule(v,p,e); };
const object = (shape: Record<string, Rule>): Rule => (v,p,e) => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) { e.push(`${p}: ต้องเป็น object`); return; }
  const data = v as Record<string, unknown>;
  Object.keys(data).filter(k => !(k in shape)).forEach(k => e.push(`${p}.${k}: ไม่รองรับฟิลด์นี้`));
  Object.entries(shape).forEach(([k,rule]) => rule(data[k],`${p}.${k}`,e));
};
const date: Rule = (v,p,e) => { if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v) || !Number.isFinite(Date.parse(v)) || new Date(v).toISOString().slice(0,10) !== v) e.push(`${p}: ต้องเป็นวันที่ YYYY-MM-DD ที่ถูกต้อง`); };
const color: Rule = (v,p,e) => { if (typeof v !== 'string' || !/^#[\da-f]{6}$/i.test(v)) e.push(`${p}: ต้องเป็นสี HEX 6 หลัก เช่น #FAF8F1`); };
const refs = list(text(80),0);
const base = { id: text(80), title: text(65) };
const metric = object({value:number,unit:text(12),label:text(45),sourceIds:refs});
const chartRule = object({kind:choice('line'),ticker:text(16),interval:choice('1d'),startDate:date,endDate:date,points:list(object({date,value:number}),0),status:choice('awaiting_market_data','ready'),sourceIds:refs});
const visualRule: Rule = (v,p,e) => {
  const kind = (v as {kind?:string} | null)?.kind;
  const shapes: Record<string,Rule> = {
    placeholder:object({kind:choice('placeholder'),label:text(70)}),
    chart:object({kind:choice('chart'),chart:chartRule}),
    image:object({kind:choice('image'),src:(v,p,e)=>{if(typeof v !== 'string' || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(v))e.push(`${p}: ใช้ภาพ PNG/JPEG/WebP ที่อัปโหลดเป็น data URL`);},alt:text(120),caption:text(80),sourceIds:refs}),
    stats:object({kind:choice('stats'),stats:list(metric,1)})
  };
  if (!kind || !shapes[kind]) e.push(`${p}.kind: ใช้ placeholder / chart / image / stats`); else shapes[kind](v,p,e);
};
const rules: Rule[] = [
  object({...base,type:choice('cover'),subtitle:text(140),emoji:text(8),layout:optional(choice('classic','dark','feature')),image:optional(object({src:text(7000000),alt:text(120)})),metric:optional(metric)}),
  object({...base,type:choice('data'),visual:visualRule,explanation:text(140),sourceIds:refs}),
  object({...base,type:choice('reasons'),items:list(object({heading:text(35),body:text(90),sourceIds:refs}),1)}),
  object({...base,type:choice('summary'),lines:list(text(75),1),sourceIds:refs}),
  object({...base,type:choice('takeaways'),items:list(text(85),1),cta:optional(text(65))})
];
const schema = object({
  schemaVersion:choice(2),category:text(28),id:text(100),brand:text(40),
  format:object({platform:choice('tiktok'),width:choice(1080),height:choice(1440),theme:choice('financial-journal')}),
  event:object({ticker:text(16),date,timezone:(v,p,e) => { try { if(typeof v !== 'string') throw new Error(); new Intl.DateTimeFormat('en',{timeZone:v}); } catch { e.push(`${p}: timezone ไม่ถูกต้อง`); } },currency:(v,p,e) => { if(typeof v !== 'string' || !/^[A-Z]{3}$/.test(v)) e.push(`${p}: ใช้รหัสสกุลเงิน 3 ตัว เช่น USD`); }}),
  theme:object({background:color,foreground:color,muted:color,accent:color,pastels:list(color,4,4)}),
  slides:(v,p,e) => { if(!Array.isArray(v) || v.length !== 5) {e.push(`${p}: ต้องมี 5 สไลด์ เรียง cover → data → reasons → summary → takeaways`);return;} rules.forEach((r,i) => r(v[i],`${p}[${i}]`,e)); },
  sources:list(object({id:text(80),type:choice('primary','secondary'),url:(v,p,e) => { try { const url=new URL(String(v)); if(!['https:','http:'].includes(url.protocol)) throw new Error(); } catch { e.push(`${p}: ต้องเป็น URL แบบ http/https`); } }}),0),

});
export function parseCarousel(raw: string): Carousel {
  if(new TextEncoder().encode(raw).length > MAX_BYTES) throw new Error('JSON ต้องมีขนาดไม่เกิน 8 MB');
  let value: unknown;
  try { value=JSON.parse(raw.replace(/^\uFEFF/,'')); } catch { throw new Error('รูปแบบ JSON ไม่ถูกต้อง: ตรวจสอบคำพูด จุลภาค และวงเล็บ'); }
  if(value && typeof value === 'object' && !Array.isArray(value)) { const legacy=value as Record<string,unknown>; delete legacy.status; delete legacy.verification;
    if(Array.isArray(legacy.slides)) for(const slide of legacy.slides) {
      if(slide && typeof slide === 'object' && slide.type === 'takeaways' && slide.questions !== undefined) {
        if(slide.items === undefined) slide.items=slide.questions;
        delete slide.questions;
      }
    } }
  const errors: string[]=[]; schema(value,'root',errors);
  if(errors.length) throw new Error(errors.join('\n'));
  const data=value as Carousel;
  const coverImage=data.slides[0].image;
  if(coverImage && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(coverImage.src)) errors.push('cover.image.src: ใช้ภาพที่อัปโหลดเป็น data URL');
  const ids=new Set(data.sources.map(s=>s.id));
  if(ids.size !== data.sources.length) errors.push('sources: id ต้องไม่ซ้ำกัน');
  if(new Set(data.slides.map(s=>s.id)).size !== 5) errors.push('slides: id ต้องไม่ซ้ำกัน');
  const visual=data.slides[1].visual;
  const visualRefs=visual.kind === 'chart' ? visual.chart.sourceIds : visual.kind === 'image' ? visual.sourceIds : visual.kind === 'stats' ? visual.stats.flatMap(m=>m.sourceIds) : [];
  const references=[...(data.slides[0].metric?.sourceIds ?? []),...data.slides[1].sourceIds,...data.slides[2].items.flatMap(i=>i.sourceIds),...data.slides[3].sourceIds,...visualRefs];
  for(const id of new Set(references)) if(!ids.has(id)) errors.push(`sourceIds: ไม่พบแหล่งอ้างอิง "${id}" ใน sources`);
  if(visual.kind === 'chart') {
    const chart=visual.chart;
    if(chart.startDate > chart.endDate) errors.push('chart: startDate ต้องไม่อยู่หลัง endDate');
    if(chart.status === 'ready' && chart.points.length < 2) errors.push('chart.points: สถานะ ready ต้องมีอย่างน้อย 2 จุด');
    if(chart.status === 'awaiting_market_data' && chart.points.length) errors.push('chart: มี points แล้ว ให้เปลี่ยน status เป็น ready');
    chart.points.forEach((p,i) => {
      if(p.date < chart.startDate || p.date > chart.endDate) errors.push(`chart.points[${i}]: วันที่อยู่นอกช่วงกราฟ`);
      if(i && p.date <= chart.points[i-1].date) errors.push(`chart.points[${i}]: วันที่ต้องเรียงจากเก่าไปใหม่และไม่ซ้ำ`);
    });
  }
  if(errors.length) throw new Error(errors.join('\n'));
  return data;
}
