/* Mini App service worker — makes the portfolio installable and usable offline.
   Strategy:
     shell assets → stale-while-revalidate
     data.json    → network-first (falls back to cache offline)
     images       → cache-first
     videos/ranges → untouched (streamed from network)
*/
const VERSION = "b4back-v2";
const SHELL = [
  "./",
  "index.html",
  "404.html",
  "assets/styles.css",
  "assets/app.js",
  "assets/favicon.svg",
  "data.json",
  "manifest.webmanifest",
  "images/babak.jpg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) =>
      Promise.all(SHELL.map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (/\.(mp4|webm|mov)$/i.test(url.pathname) || req.headers.get("range")) return;

  // content data → always try the network first
  if (url.pathname.endsWith("/data.json")) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // images → cache first
  if (req.destination === "image") {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
            return res;
          })
      )
    );
    return;
  }

  // everything else → stale while revalidate
  e.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(async () => {
          if (hit) return hit;
          if (req.mode === "navigate") {
            const shell = await caches.match("index.html");
            if (shell) return shell;
          }
          return Response.error();
        });
      return hit || network;
    })
  );
});
