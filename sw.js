const CACHE_NAME = "rsp-ghanti-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./rsp.png",
  "./bell_sound.mp3"
];

// 1. Install Service Worker and Cache Files
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Serve Files from Cache (Offline Support)
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});