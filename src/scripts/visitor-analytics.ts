const scriptId = 'bk-visitor-analytics-script';
const scriptUrl = 'https://cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js';

// Use the service's own collector and UV fields; do not count visits locally.
export function initVisitorAnalytics(production: boolean, browser: Window & typeof globalThis = window) {
  const { document, location } = browser;
  const panel = document.querySelector<HTMLElement>('[data-visitor-stats]');
  const status = panel?.querySelector<HTMLElement>('[data-visitor-status]');
  if (!production || location.hostname !== 'binbinku.github.io') {
    if (panel) panel.dataset.state = 'preview';
    if (status) status.textContent = '本地预览不计数';
    return;
  }
  if (document.getElementById(scriptId)) return;

  let timer: number | undefined;
  let observer: MutationObserver | undefined;
  const unavailable = () => {
    if (panel?.dataset.state === 'ready') return;
    if (panel) panel.dataset.state = 'unavailable';
    if (status) status.textContent = '统计暂不可用';
  };
  const readCount = (id: string) => {
    const value = document.getElementById(id)?.textContent?.trim() || '';
    return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : undefined;
  };
  const update = () => {
    const total = readCount('busuanzi_site_uv');
    const today = readCount('busuanzi_today_uv');
    const pageviews = readCount('busuanzi_site_pv');
    if (total === undefined || today === undefined || pageviews === undefined) return;
    const totalDisplay = panel?.querySelector('[data-visitor-total]');
    const todayDisplay = panel?.querySelector('[data-visitor-today]');
    const pageviewsDisplay = panel?.querySelector('[data-visitor-pageviews]');
    if (totalDisplay) totalDisplay.textContent = total.toLocaleString('zh-CN');
    if (todayDisplay) todayDisplay.textContent = today.toLocaleString('zh-CN');
    if (pageviewsDisplay) pageviewsDisplay.textContent = pageviews.toLocaleString('zh-CN');
    if (panel) panel.dataset.state = 'ready';
    if (status) status.textContent = '按统计服务规则去重';
    browser.clearTimeout(timer);
    observer?.disconnect();
  };
  const source = panel?.querySelector('[data-visitor-source]');
  if (source) {
    if (status) status.textContent = '统计加载中…';
    observer = new browser.MutationObserver(update);
    observer.observe(source, { childList: true, characterData: true, subtree: true });
    // Keep observing after a timeout: a late response can still replace the placeholder.
    timer = browser.setTimeout(unavailable, 10_000);
  }
  const script = document.createElement('script');
  script.id = scriptId;
  script.src = scriptUrl;
  script.async = true;
  script.onerror = () => {
    browser.clearTimeout(timer);
    unavailable();
  };
  document.body.append(script);
}
