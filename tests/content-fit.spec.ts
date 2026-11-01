import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import JSZip from 'jszip';
const sample=JSON.parse(readFileSync(new URL('../sample.json',import.meta.url),'utf8'));
test('long data and unlimited checklist fit and still export all five slides',async({page})=>{
  await page.goto('/content-studio/');
  const data=structuredClone(sample);
  data.slides[1].title='ข้อมูล\nที่ควรรู้\nก่อนลงทุน';
  data.slides[1].visual={kind:'stats',stats:Array.from({length:9},(_,i)=>({label:`ตัวอย่างสถิติสำหรับทดสอบ ${i+1}`,value:i,unit:'รายการ',sourceIds:[]}))};
  data.slides[1].explanation='ข้อความทดสอบการจัดวาง\nหลายบรรทัด\nให้พอดีกับภาพ';
  data.slides[4].items=Array.from({length:12},(_,i)=>`หัวข้อเช็กลิสต์ ${i+1} ที่ควรรู้ก่อนอ่านข่าว`);
  await page.getByLabel('เนื้อหา JSON').fill(JSON.stringify(data));
  const zipButton=page.getByRole('button',{name:'ZIP ทั้ง 5 ภาพ'});
  await expect(zipButton).toBeEnabled();
  await page.getByRole('button',{name:'ดูสไลด์ 2'}).click();
  await expect.poll(async()=>Number(await page.locator('.preview-frame article').getAttribute('data-content-scale'))).toBeLessThan(1);
  for(const i of [2,5]){
    await page.getByRole('button',{name:`ดูสไลด์ ${i}`}).click();
    const fits=await page.locator('.preview-frame .slide-content-viewport').evaluate(el=>{
      const v=el.getBoundingClientRect();const c=el.querySelector('.slide-copy')!.getBoundingClientRect();
      return c.top>=v.top-1 && c.bottom<=v.bottom+1 && c.left>=v.left-1 && c.right<=v.right+1;
    });expect(fits).toBe(true);
  }
  const style=await page.locator('.preview-frame .journal-checklist').evaluate(el=>({gap:getComputedStyle(el).gap,padding:getComputedStyle(el.querySelector('li')!).padding,weight:getComputedStyle(el.querySelector('p')!).fontWeight,size:getComputedStyle(el.querySelector('p')!).fontSize,itemGap:getComputedStyle(el.querySelector('li')!).gap}));
  expect(style).toEqual({gap:'8px',padding:'0px',weight:'400',size:'17px',itemGap:'8px'});
  const download=page.waitForEvent('download');await zipButton.click();
  const archive=await JSZip.loadAsync(readFileSync((await (await download).path())!));
  expect(Object.keys(archive.files)).toHaveLength(5);
  for(const file of Object.values(archive.files)){const bytes=await file.async('nodebuffer');expect(bytes.readUInt32BE(16)).toBe(1080);expect(bytes.readUInt32BE(20)).toBe(1440);}
  // Returning to shorter content must restore its original size.
  await page.getByLabel('เนื้อหา JSON').fill(JSON.stringify(sample));
  await page.getByRole('button',{name:'ดูสไลด์ 2'}).click();
  await expect.poll(async()=>Number(await page.locator('.preview-frame article').getAttribute('data-content-scale'))).toBe(1);
});
