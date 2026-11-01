/** Fit natural content inside the fixed 3:4 canvas, shared by preview and export. */
export function fitSlideContent(node: HTMLElement) {
  const viewport = node.querySelector<HTMLElement>('.slide-content-viewport');
  const content = node.querySelector<HTMLElement>('.slide-copy');
  if (!viewport || !content || !viewport.clientHeight) return;

  content.style.transform = 'none';
  content.style.minHeight = `${viewport.clientHeight}px`;
  const height = content.scrollHeight;
  const width = Math.max(content.scrollWidth, viewport.clientWidth);
  const fits = height <= viewport.clientHeight && width <= viewport.clientWidth;
  const scale = fits ? 1 : Math.min((viewport.clientHeight - 2) / height, (viewport.clientWidth - 2) / width);
  const offset = (viewport.clientWidth - width * scale) / 2;
  content.style.transform = `translateX(${offset}px) scale(${scale})`;
  node.dataset.contentScale = String(scale);
}
