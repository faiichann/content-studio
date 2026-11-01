import { useEffect, useRef, useState } from 'react';
import sample from '../sample.json';
import { MAX_BYTES, parseCarousel, SLIDE_LABELS, type Carousel } from './validation';
import { SlideCard } from './SlideCard';
import { contentPrompt, structureJson } from './contentPrompt';
import { assertFits, download, exportImages } from './export';
const sampleText = JSON.stringify(sample, null, 2);
export default function App() {
  const [copyStatus, setCopyStatus] = useState('');
  const [copyFallback, setCopyFallback] = useState(false);
  const copyArea = useRef<HTMLTextAreaElement>(null);
  async function copyStructure() {
    try { await navigator.clipboard.writeText(contentPrompt); setCopyFallback(false); setCopyStatus('คัดลอกแล้ว พร้อมนำไปวางในแชทสร้างคอนเทนต์'); }
    catch { setCopyFallback(true); setCopyStatus('คัดลอกอัตโนมัติไม่ได้ เลือกข้อความด้านล่างแล้วกด Ctrl+C หรือ ⌘C'); }
  }
  const [raw, setRaw] = useState(sampleText);
  const [applied, setApplied] = useState(sampleText);
  const [data, setData] = useState<Carousel>(() => parseCarousel(sampleText));
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState('');
  const [layoutError, setLayoutError] = useState('');
  const [status, setStatus] = useState('ตัวอย่างพร้อมแล้ว • ลองแก้ JSON ของคุณได้เลย');
  const [busy, setBusy] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);
  const nodes = useRef<(HTMLElement | null)[]>([]);
  const upload = useRef<HTMLInputElement>(null);
  const imageUpload = useRef<HTMLInputElement>(null);
  const [imageTarget, setImageTarget] = useState<'cover' | 'data'>('data');
  const dirty = raw !== applied;
  useEffect(() => { apply(raw); }, [raw]);
  useEffect(() => {
    let active = true;
    setLayoutReady(false);
    document.fonts.ready.then(() => requestAnimationFrame(() => {
      if (!active) return;
      try { assertFits(nodes.current.filter((n): n is HTMLElement => !!n)); setLayoutError(''); }
      catch (e) { setLayoutError((e as Error).message); }
      setLayoutReady(true);
    }));
    return () => { active = false; };
  }, [data]);
  function apply(text = raw) {
    try { const parsed = parseCarousel(text); setLayoutReady(false); setData(parsed); setApplied(text); setError(''); setStatus('อัปเดตสไลด์อัตโนมัติแล้ว'); }
    catch (e) { setError((e as Error).message); setStatus('JSON ยังไม่สมบูรณ์ • แสดงพรีวิวล่าสุด'); }
  }
  async function loadFile(file?: File) {
    if (!file) return;
    try {
      if (file.size > MAX_BYTES) throw new Error('ไฟล์ต้องมีขนาดไม่เกิน 8 MB');
      const text = await file.text(); setRaw(text); apply(text);
    } catch (e) { setError((e as Error).message); }
  }
  async function exportSet(all: boolean) {
    setBusy(true); setError('');
    try {
      const elements = nodes.current.filter((n): n is HTMLElement => !!n);
      if (elements.length !== 5) throw new Error('พรีวิวยังไม่พร้อม กรุณาลองอีกครั้ง');
      await Promise.all(elements.flatMap(node => Array.from(node.querySelectorAll('img')).map(img => img.decode())));
      await exportImages(elements, all ? [0, 1, 2, 3, 4] : [selected], setStatus);
      setStatus(all ? 'ส่งออก ZIP ครบ 5 ภาพแล้ว' : `ส่งออกภาพที่ ${selected + 1} แล้ว`);
    } catch (e) { setError(`ส่งออกไม่สำเร็จ: ${(e as Error).message}`); setStatus('กรุณาตรวจสอบข้อความแจ้งเตือน'); }
    finally { setBusy(false); }
  }
  return <div className="app-shell">
    <header className="app-header"><a className="wordmark" href="#"><span className="brand-icon">f.</span><span>content-studio<span className="wordmark-sub">BY FAIICHANNN 🐥</span></span></a><span className="local-badge"><i /> LOCAL WORKSPACE</span></header>
    <main>
      <section className="intro"><div><div className="kicker">A LITTLE CURIOUS. A LITTLE FINANCIAL.</div><h1>เรื่องยาก เล่าให้ง่าย<span>.</span></h1><p>จากข่าวหนึ่งเรื่อง สู่คารูเซล 5 หน้าที่เป็นคุณ</p></div><div className="format-label"><strong>3:4</strong><span>TIKTOK CAROUSEL<br />1080 × 1440 PX</span></div></section>
      <div className="workspace">
        <section className="editor panel" aria-labelledby="editor-title"><div className="panel-heading"><div><span className="step">01</span><h2 id="editor-title">ใส่คอนเทนต์</h2></div><span className="subtle">JSON EDITOR</span></div>
          <p className="panel-description">วางหรือแก้ JSON แล้วสไลด์อัปเดตทันที</p>
          <div className="editor-tools"><button disabled={busy} onClick={() => upload.current?.click()}>↑ อัปโหลด JSON</button><button disabled={busy} className="text-button" onClick={() => { setRaw(sampleText); apply(sampleText); }}>ใช้ตัวอย่าง</button></div>
          <button className="channel-theme-button" disabled={busy} onClick={() => { try { const current = parseCarousel(raw); const text = JSON.stringify({...current, theme: sample.theme}, null, 2); setRaw(text); apply(text); } catch (e) { setError((e as Error).message); } }}>◐ ใช้ธีมช่อง · Yellow & Black Editorial</button>
          <input ref={upload} type="file" accept=".json,application/json" aria-label="อัปโหลดไฟล์ JSON" hidden onChange={e => { void loadFile(e.target.files?.[0]); e.target.value = ''; }} />
          <label className="sr-only" htmlFor="json-input">เนื้อหา JSON</label><textarea id="json-input" spellCheck={false} value={raw} disabled={busy} onChange={e => setRaw(e.target.value)} aria-invalid={!!error} aria-describedby="json-help" />
          <div className="editor-caption" id="json-help"><span>UTF-8 · สูงสุด 8 MB</span><span>{dirty ? '● รอ JSON ที่สมบูรณ์' : '● LIVE PREVIEW'}</span></div>
          {(error || layoutError) && <div className="error" role="alert">{error || layoutError}</div>}
          <button className="text-button" disabled={busy} onClick={()=>download(new Blob([raw],{type:'application/json;charset=utf-8'}),'content.json')}>↓ บันทึก JSON ปัจจุบัน</button>
          <details><summary>โครงสร้าง JSON ที่รองรับ</summary><p>5 เทมเพลต: cover → data → reasons → summary → takeaways<br />รองรับ theme, event และ sources<br />schemaVersion: 2 · data.visual เลือก placeholder / image / chart / stats</p><button className="primary copy-structure" onClick={()=>void copyStructure()}>คัดลอกโครงสร้าง JSON</button><p className="copy-help">พร้อม prompt ภาษาไทย ฟิลด์ที่รองรับ และแม่แบบครบ 5 สไลด์ ไม่มีข้อมูลจากงานที่กำลังแก้</p><p className="copy-status" role="status" aria-live="polite">{copyStatus}</p>{copyFallback && <div className="copy-fallback"><label htmlFor="structure-prompt">Prompt และโครงสร้าง JSON สำหรับคัดลอก</label><textarea ref={copyArea} id="structure-prompt" readOnly value={contentPrompt}/><button onClick={()=>{copyArea.current?.focus();copyArea.current?.select();}}>เลือกข้อความทั้งหมด</button></div>}<button className="text-button" onClick={() => download(new Blob([structureJson], {type:'application/json;charset=utf-8'}), 'template.json')}>↓ ดาวน์โหลด template.json</button></details>
          <details className="sources-panel"><summary>แหล่งอ้างอิง ({data.sources.length})</summary>{data.sources.map((source,i)=><a key={source.id} href={source.url} target="_blank" rel="noreferrer">[{i+1}] {source.id} ↗</a>)}</details>
          <div className="privacy-note"><span>◌</span><p>พื้นที่สร้างสรรค์ส่วนตัว<br /><small>ประมวลผลบนเบราว์เซอร์ ไม่ส่ง JSON ไปเซิร์ฟเวอร์</small></p></div>
        </section>
        <section className="preview panel" aria-labelledby="preview-title"><div className="panel-heading"><div><span className="step">02</span><h2 id="preview-title">พรีวิวสไลด์</h2></div><span className="theme-tag">Yellow & Black Editorial</span></div>
          <div className="preview-stage"><div className="preview-frame"><div className="scaled-slide"><SlideCard slide={data.slides[selected]} index={selected} data={data}/></div></div><div className="stage-caption"><span>{data.slides[0].title}</span><span>{selected + 1} / 5</span></div></div>
          <div className="image-tools"><label className="layout-picker">รูปแบบปก <select disabled={busy} value={data.slides[0].layout ?? 'classic'} onChange={e=>{try {const next=parseCarousel(raw);next.slides[0].layout=e.target.value as 'classic'|'dark'|'feature';setRaw(JSON.stringify(next,null,2));}catch(e){setError((e as Error).message);}}}><option value="classic">News Classic</option><option value="dark">News Dark</option><option value="feature">News Feature</option></select></label><button disabled={busy} onClick={()=>{setImageTarget('cover');imageUpload.current?.click();}}>＋ ใส่ภาพข่าวบนปก</button><button disabled={busy} onClick={()=>{setImageTarget('data');imageUpload.current?.click();}}>＋ ใส่รูปในสไลด์ Data</button><input hidden ref={imageUpload} type="file" accept="image/png,image/jpeg,image/webp" aria-label="อัปโหลดภาพ Data" onChange={async e=>{ const file=e.target.files?.[0]; e.target.value=''; if(!file)return; try { if(file.size>5_000_000)throw new Error('ภาพต้องไม่เกิน 5 MB'); if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('ใช้ PNG/JPEG/WebP'); const current=parseCarousel(raw); const src=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('อ่านภาพไม่ได้'));reader.readAsDataURL(file);}); const img=new Image();img.src=src;await img.decode(); if(imageTarget==='cover') current.slides[0].image={src,alt:'ภาพประกอบข่าว'}; else current.slides[1].visual={kind:'image',src,alt:'ภาพประกอบข่าว',caption:'ภาพประกอบข่าว',sourceIds:[]};const text=JSON.stringify(current,null,2);setRaw(text);apply(text);setSelected(imageTarget==='cover'?0:1); }catch(e){setError((e as Error).message);} }}/><p>PNG / JPEG / WebP ไม่เกิน 5 MB · แนบรูปไว้ใน JSON และระบุที่มาภาพก่อนเผยแพร่</p></div>
          <nav className="slide-tabs" aria-label="เลือกสไลด์">{data.slides.map((s, i) => <button key={i} disabled={busy} aria-current={selected === i ? 'step' : undefined} aria-label={`ดูสไลด์ ${i + 1}`} onClick={() => setSelected(i)}><span className={`mini-card ${i === 0 || i === 4 ? 'mini-dark' : ''}`}><span>{String(i + 1).padStart(2, '0')}</span><b>{SLIDE_LABELS[i]}</b><i /></span><span>{SLIDE_LABELS[i]}</span></button>)}</nav>
          <div className="export-bar"><div><strong>พร้อมเล่าเรื่องของคุณ?</strong><small>PNG คมชัด · 1080 × 1440 px</small></div><div className="export-actions"><button disabled={busy || dirty || !layoutReady || !!layoutError} onClick={() => void exportSet(false)}>↓ PNG ภาพนี้</button><button className="primary" disabled={busy || dirty || !layoutReady || !!layoutError} onClick={() => void exportSet(true)}>↓ ZIP ทั้ง 5 ภาพ</button></div></div>
          <p className="status" role="status" aria-live="polite">{dirty ? 'แก้ JSON ให้สมบูรณ์เพื่ออัปเดตสไลด์' : status}</p>
        </section>
      </div>
      <footer className="app-footer"><span>MADE FOR YOUR NEXT GOOD IDEA.</span><span>content-studio / faiichannn 🐥</span></footer>
    </main>
    <div className="export-render" aria-hidden="true">{data.slides.map((slide, i) => <SlideCard key={i} ref={node => { nodes.current[i] = node; }} slide={slide} index={i} data={data}/>)}</div>
  </div>;
}
