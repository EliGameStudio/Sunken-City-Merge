/* Sunken City — service worker.
   Правила, выведенные из белого экрана на телефоне:
   1) НИКОГДА не перехватывать переходы (navigate) — страница всегда из сети.
      Битый кэш HTML = белый экран, а офлайн-запуск того не стоит.
   2) Без skipWaiting и без clients.claim — новая версия не захватывает
      уже открытую страницу.
   3) Кэшируем только иконки и манифест.
   КЛЮЧ КЭША ПОДНИМАТЬ ПРИ КАЖДОЙ ПРАВКЕ. */
const CACHE = 'sunken-v6.9';
const ICONS = ['icon-180.png','icon-512.png','manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ICONS)).catch(()=>{}));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
});
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') return;            // страницу не трогаем вообще
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;      // чужие домены (Firebase) не трогаем
  if (!ICONS.some(n => url.pathname.endsWith(n))) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return resp;
    }))
  );
});
