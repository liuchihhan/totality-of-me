// Service Worker for 好事壞事紀錄表
// 版本號：每次更新網站內容時記得改這個數字
const CACHE_VERSION = 'v1';
const CACHE_NAME = '好事壞事-' + CACHE_VERSION;

// 需要快取的檔案
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// 安裝：快取基本檔案
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 啟動：清除舊快取
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 請求攔截：網路優先，失敗才用快取
self.addEventListener('fetch', e => {
  // Supabase API 請求永遠走網路，不快取
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 成功的話順便更新快取
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
