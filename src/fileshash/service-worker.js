const CACHE_NAME = 'files-hash-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './main.js'
];

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截请求
// 策略：stale-while-revalidate（先返回缓存，后台更新）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. 如果有缓存，先返回缓存（快速响应）
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // 2. 后台请求最新版本
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // 网络失败，静默处理（已经返回缓存了）
        });

      // 优先返回缓存，如果没有缓存则等待网络请求
      return cachedResponse || fetchPromise;
    })
  );
});
