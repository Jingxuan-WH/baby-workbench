/* 柚子带娃工作台 · 离线缓存：打开过一次后，断网也能从桌面图标打开 */
const CACHE = 'bbws-v1';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* 先用缓存秒开，同时在后台取最新版本更新缓存（下次打开生效） */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const net = fetch(req).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => null);
  e.waitUntil(net.then(() => {}));
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || net.then(res => res || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
