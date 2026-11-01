import { getFontEmbedCSS, toBlob } from 'html-to-image';
import JSZip from 'jszip';
export function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
export function assertFits(nodes: HTMLElement[]) {
  nodes.forEach((node, i) => {
    const copy = node.querySelector<HTMLElement>('.slide-copy')!;
    if (copy.scrollHeight > copy.clientHeight + 2 || copy.scrollWidth > copy.clientWidth + 2) throw new Error(`สไลด์ ${i + 1}: ข้อความล้นพื้นที่ กรุณาลดความยาวก่อนส่งออก`);
  });
}
export async function exportImages(nodes: HTMLElement[], indexes: number[], onProgress: (message: string) => void) {
  await document.fonts.ready;
  assertFits(nodes);
  const fontEmbedCSS = await getFontEmbedCSS(nodes[0], { preferredFontFormat: 'woff2' });
  // Let text reflow inside the SVG clone instead of freezing browser-measured heights.
  const includeStyleProperties = Array.from(getComputedStyle(nodes[0])).filter(name => name !== 'height' && name !== 'block-size');
  const zip = new JSZip();
  for (const index of indexes) {
    onProgress(`กำลังสร้างภาพ ${index + 1} / 5…`);
    const blob = await toBlob(nodes[index], { width: 540, height: 720, pixelRatio: 2, includeStyleProperties, fontEmbedCSS, cacheBust: false });
    if (!blob) throw new Error('สร้างภาพไม่สำเร็จ กรุณาลองอีกครั้ง');
    const name = `faiichannn-slide-${String(index + 1).padStart(2, '0')}.png`;
    if (indexes.length === 1) download(blob, name); else zip.file(name, blob);
  }
  if (indexes.length > 1) {
    onProgress('กำลังรวมไฟล์ ZIP…');
    download(await zip.generateAsync({ type: 'blob' }), 'faiichannn-carousel.zip');
  }
}
