/* COMMEL 프로토타입 서비스 워커.
   안드로이드 크롬이 '앱 설치'를 띄우려면 fetch 를 받는 워커가 있어야 한다.
   캐시는 '망 먼저'다 — 캐시 먼저로 두면 새로 올린 프로토타입이 안 보인다.
   망이 끊겼을 때만 마지막으로 받아 둔 것을 내준다. */
const CACHE = "commel-app2-v1";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(["./", "./index.html"]))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok && new URL(req.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(req).then(m => m || caches.match("./")))
  );
});
