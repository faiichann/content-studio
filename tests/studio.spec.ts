import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import JSZip from 'jszip';
import type { Carousel } from '../src/validation';
const sample: Carousel=JSON.parse(readFileSync(new URL('../sample.json',import.meta.url),'utf8'));
test('five editorial templates, import validation, actual PNG/ZIP and mobile',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/content-studio/');
  const zipButton=page.getByRole('button',{name:'ZIP ทั้ง 5 ภาพ'});
  await expect(zipButton).toBeEnabled();
  await expect(page.locator('.preview-frame .journal-footer strong')).toHaveText('faiichannn 🐥');
  await expect(page.locator('.preview-frame h2')).toHaveText(sample.slides[0].title);
  await expect(page.getByRole('button',{name:'ตรวจสอบ & อัปเดตพรีวิว'})).toHaveCount(0);
  const live=structuredClone(sample);live.slides[0].title='ทดสอบแก้หัวข้อทันที';await page.getByLabel('เนื้อหา JSON').fill(JSON.stringify(live));await expect(page.locator('.preview-frame h2')).toHaveText(live.slides[0].title);await page.getByLabel('เนื้อหา JSON').fill(JSON.stringify(sample));await expect(page.locator('.preview-frame h2')).toHaveText(sample.slides[0].title);
  await page.screenshot({path:'test-results/studio-desktop.png',fullPage:true});
  await page.getByLabel('เนื้อหา JSON').fill('{');
  
  await expect(page.getByRole('alert')).toContainText('JSON');await expect(zipButton).toBeDisabled();
  await page.getByLabel('อัปโหลดไฟล์ JSON').setInputFiles({name:'news.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(sample))});
  await expect(zipButton).toBeEnabled();
  for(let i=1;i<=5;i++) { await page.getByRole('button',{name:`ดูสไลด์ ${i}`}).click();await expect(page.locator('.preview-frame h2')).toHaveText(sample.slides[i-1].title); }
  await page.getByRole('button',{name:'ดูสไลด์ 2'}).click();
  await expect(page.locator('.preview-frame .journal-visual img')).toBeVisible();
  await expect(page.locator('.preview-frame svg path')).toHaveCount(0);
  const pngWait=page.waitForEvent('download');await page.getByRole('button',{name:'PNG ภาพนี้'}).click();const png=await pngWait;
  const bytes=await fs.readFile((await png.path())!);expect(bytes.readUInt32BE(16)).toBe(1080);expect(bytes.readUInt32BE(20)).toBe(1440);
  const zipWait=page.waitForEvent('download');await zipButton.click();const zip=await zipWait;await zip.saveAs('test-results/ai-bubble-carousel.zip');
  const archive=await JSZip.loadAsync(await fs.readFile((await zip.path())!));expect(Object.keys(archive.files)).toHaveLength(5);
  for(const file of Object.values(archive.files)) { const b=await file.async('nodebuffer');expect(b.readUInt32BE(16)).toBe(1080);expect(b.readUInt32BE(20)).toBe(1440);await fs.writeFile(`test-results/${file.name}`,b); }
  const gallery=await page.context().newPage();
  await gallery.setViewportSize({width:1200,height:400});
  const images=await Promise.all(Object.values(archive.files).map(async f=>`<img src="data:image/png;base64,${await f.async('base64')}"/>`));
  await gallery.setContent(`<html><body style="margin:0;padding:22px;background:#eee9df;font:14px sans-serif;color:#262626"><div style="margin-bottom:18px">faiichannn 🐥 · Hook / Data / Why / Summary / Key Takeaways</div><div style="display:flex;gap:14px">${images.join('')}</div><style>img{width:220px;height:auto;box-shadow:0 4px 12px #0001}</style></body></html>`);
  await gallery.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(img=>(img as HTMLImageElement).decode())));
  await gallery.screenshot({path:'test-results/preview-slides.png'});await gallery.close();
  const expanded=structuredClone(sample);
  expanded.slides[2].items=Array.from({length:5},(_,i)=>({heading:`Point ${i+1}`,body:'Short supporting detail',sourceIds:[]}));
  expanded.slides[4].items=Array.from({length:6},(_,i)=>`Checklist item ${i+1}`);
  await page.getByLabel('เนื้อหา JSON').fill(JSON.stringify(expanded));
  await expect(page.locator('.export-render .journal-reason')).toHaveCount(5);
  await expect(page.locator('.export-render .journal-checklist li')).toHaveCount(6);
  await expect(zipButton).toBeEnabled();
  expect(await page.locator('.export-render .journal-checklist li').first().evaluate(el=>getComputedStyle(el).borderTopWidth)).toBe('0px');
  // Synthetic data only: test the chart renderer, not the financial claims in the sample.
  const ready=structuredClone(sample);ready.slides[1].visual={kind:'chart',chart:{kind:'line',ticker:'TEST',interval:'1d',startDate:'2026-09-29',endDate:'2026-10-29',status:'ready',sourceIds:[],points:[{date:'2026-09-29',value:100},{date:'2026-10-05',value:105},{date:'2026-10-20',value:99},{date:'2026-10-29',value:90}]}};
  await page.getByLabel('เนื้อหา JSON').fill(JSON.stringify(ready));
  await expect(page.locator('.preview-frame svg')).toBeVisible();await expect(zipButton).toBeEnabled();
  const chartWait=page.waitForEvent('download');await page.getByRole('button',{name:'PNG ภาพนี้'}).click();await (await chartWait).saveAs('test-results/chart-test-only.png');
  await page.getByLabel('อัปโหลดภาพ Data').setInputFiles('public/ai-expectations.png');await expect(page.locator('.preview-frame img')).toBeVisible();await expect(zipButton).toBeEnabled();
  await page.getByRole('button',{name:'ดูสไลด์ 1'}).click();for(const layout of ['dark','feature','classic']){await page.getByLabel('รูปแบบปก').selectOption(layout);await expect(page.locator('.preview-frame article')).toHaveClass(new RegExp('cover-'+layout));await expect(zipButton).toBeEnabled();}
  await page.setViewportSize({width:375,height:812});await page.screenshot({path:'test-results/studio-mobile.png',fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const long=structuredClone(sample);long.slides[0].title='ก\n'.repeat(20);
  await page.getByLabel('เนื้อหา JSON').fill(JSON.stringify(long));await expect(zipButton).toBeEnabled();
  await expect.poll(async()=>Number(await page.locator('.preview-frame article').getAttribute('data-content-scale'))).toBeLessThan(1);
  expect(errors).toEqual([]);
});
