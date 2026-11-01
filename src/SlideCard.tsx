import { forwardRef, useLayoutEffect, useRef, type CSSProperties } from 'react';
import { fitSlideContent } from './fitSlide';
import { type Carousel, type LineChart, type Slide } from './validation';
const fmt = (n: number) => new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(n);
function PriceChart({ chart, currency }: { chart: LineChart; currency: string }) {
  if(chart.status !== 'ready') return <div className="chart-pending"><span className="pending-symbol">◷</span><strong>รอข้อมูลราคาย้อนหลัง</strong><p>ยังไม่มีชุดข้อมูลสำหรับวาดกราฟ</p><small>{chart.startDate} → {chart.endDate}</small></div>;
  const values=chart.points.map(p=>p.value);
  const min=Math.min(...values), max=Math.max(...values), padding=(max-min || Math.max(Math.abs(max)*.05,1))*.15;
  const low=min-padding,high=max+padding;
  const tick = (n: number) => new Intl.NumberFormat('en-US', { notation: Math.abs(n) >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 2 }).format(n);
  const start=Date.parse(chart.startDate),end=Date.parse(chart.endDate);
  const xy=chart.points.map(p=>[58+(Date.parse(p.date)-start)/(end-start || 1)*365,184-(p.value-low)/(high-low)*146]);
  const path=xy.map(([x,y],i)=>`${i ? 'L':'M'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  return <div className="chart-ready"><svg viewBox="0 0 444 225" width="444" height="225" role="img" aria-label={`กราฟ ${chart.ticker} ${chart.points.length} จุด ตั้งแต่ ${chart.startDate} ถึง ${chart.endDate}`}>
    <text x="12" y="18" className="axis-unit" fill="var(--s-muted)" fontSize="8" fontFamily="Noto Sans Thai">{currency}</text>
    {[0,.5,1].map(t=>{ const y=184-t*146; return <g key={t}><line x1="58" x2="423" y1={y} y2={y} className="grid-line" stroke="var(--s-border)" strokeDasharray="3 4"/><text x="48" y={y+4} textAnchor="end" className="axis-label" fill="var(--s-muted)" fontSize="9" fontFamily="Noto Sans Thai">{tick(low+t*(high-low))}</text></g>; })}
    <path d={`${path} L ${xy.at(-1)![0]} 184 L ${xy[0][0]} 184 Z`} fill="var(--s-accent)" opacity=".08"/>
    <path d={path} stroke="var(--s-accent)" strokeWidth="3" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
    <circle cx={xy.at(-1)![0]} cy={xy.at(-1)![1]} r="4" fill="var(--s-accent)"/>
    <text x="58" y="211" className="axis-label" fill="var(--s-muted)" fontSize="9" fontFamily="Noto Sans Thai">{chart.startDate}</text><text x="423" y="211" textAnchor="end" className="axis-label" fill="var(--s-muted)" fontSize="9" fontFamily="Noto Sans Thai">{chart.endDate}</text>
  </svg></div>;
}
function Content({slide,data}:{slide:Slide;data:Carousel}) {
  switch(slide.type) {
    case 'cover': return <>
      {slide.layout !== 'feature' && <div className="cover-photo">{slide.image ? <img src={slide.image.src} alt={slide.image.alt}/> : <div className="cover-photo-placeholder"><span>▧</span><p>เพิ่มภาพข่าว</p></div>}</div>}
      <h2>{slide.title}</h2>
      {slide.metric && <div className="journal-metric"><strong>{fmt(slide.metric.value)}<span>{slide.metric.unit}</span></strong><p>{slide.metric.label}</p></div>}
      <p className="journal-subtitle">{slide.subtitle}</p>
      <span className="journal-swipe">ปัดอ่านต่อ <b>→</b></span>
    </>;
    case 'data': return <>
      <h2>{slide.title}</h2>
      <div className={`journal-visual visual-${slide.visual.kind}`}>
        {slide.visual.kind === 'placeholder' && <div className="journal-placeholder"><span>▧</span><strong>{slide.visual.label}</strong><small>ใส่ภาพ กราฟ หรือสถิติจากแหล่งข้อมูลจริง</small></div>}
        {slide.visual.kind === 'chart' && <PriceChart chart={slide.visual.chart} currency={data.event.currency}/>}
        {slide.visual.kind === 'image' && <figure><img src={slide.visual.src} alt={slide.visual.alt}/><figcaption>{slide.visual.caption}</figcaption></figure>}
        {slide.visual.kind === 'stats' && <div className="journal-stats">{slide.visual.stats.map((m,i)=><div key={i}><span>{m.label}</span><strong>{fmt(m.value)}<small>{m.unit}</small></strong></div>)}</div>}
      </div>
      <p className="journal-explanation">{slide.explanation}</p>
    </>;
    case 'reasons': return <>
      <h2>{slide.title}</h2>
      <div className={`journal-reasons ${slide.items.length > 3 ? "is-dense" : ""}`}>{slide.items.map((item,i)=><div className={`journal-reason tint-${i}`} key={i}><span className="bullet-mark">{['📈','💰','🔗'][i % 3]}</span><div><h3>{item.heading}</h3><p>{item.body}</p></div></div>)}</div>
    </>;
    case 'summary': return <>
      <span className="summary-kicker">สรุปแบบเข้าใจง่าย 💡</span><h2>{slide.title}</h2>
      <div className="journal-summary">{slide.lines.map((line,i)=><p key={i}>{line}</p>)}</div>
    </>;
    case 'takeaways': return <>
      <h2>{slide.title}</h2>
      <ul className={`journal-checklist ${slide.items.length > 3 ? "is-dense" : ""}`}>{slide.items.map((item,i)=><li key={i}><span className="check-box" aria-hidden="true"/><p>{item}</p></li>)}</ul>
      {slide.cta && <p className="journal-cta">{slide.cta}</p>}
    </>;
  }
}
export const SlideCard=forwardRef<HTMLElement,{slide:Slide;index:number;data:Carousel}>(function SlideCard({slide,index,data},ref){
  const card = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const node = card.current;
    if (!node) return;
    let active = true;
    const fit = () => { if (active) fitSlideContent(node); };
    fit();
    void document.fonts.ready.then(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(node);
    const images = Array.from(node.querySelectorAll('img'));
    images.forEach(image => image.addEventListener('load', fit));
    return () => { active = false; observer.disconnect(); images.forEach(image => image.removeEventListener('load', fit)); };
  }, [slide, data]);
  const t=data.theme;
  const rgb=t.background.slice(1).match(/../g)!.map(x=>parseInt(x,16));
  const dark=(rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722)<128;
  const style={'--s-glow':`${t.accent}26`,'--s-border':dark ? '#ffffff26' : '#26262621','--s-bg':t.background,'--s-fg':t.foreground,'--s-muted':t.muted,'--s-accent':t.accent,'--pastel-0':t.pastels[0],'--pastel-1':t.pastels[1],'--pastel-2':t.pastels[2],'--pastel-3':t.pastels[3]} as CSSProperties;
  return <article ref={node => { card.current = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; }} lang="th" style={style} className={`slide-card ${slide.type==='cover' ? `cover-${slide.layout ?? 'classic'}` : ''} template-${slide.type} ${dark ? 'slide-noir' : ''}`} aria-label={`สไลด์ ${index+1}: ${slide.title}`}>
    {slide.type === 'cover' && slide.layout === 'feature' && <div className="cover-photo">{slide.image && <img src={slide.image.src} alt={slide.image.alt}/>}</div>}
    <header className="journal-header"><span>{data.category}</span><time dateTime={data.event.date}>{data.event.date.split('-').reverse().join('.')}</time></header>
    <div className="slide-content-viewport"><div className="slide-copy"><Content slide={slide} data={data}/></div></div>
    <footer className="journal-footer"><strong>faiichannn 🐥</strong><span>{String(index+1).padStart(2,'0')} / 05</span></footer>
  </article>;
});
