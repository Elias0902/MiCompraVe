/* MiCompraVE - service worker: cache offline + instalable como PWA (build de Vite) */
var CACHE = "micompreve-v1";

/* Solo el "shell" con nombres estables. Los JS/CSS con hash del build
   se guardan en cache al vuelo (runtime), no hace falta listarlos aqui. */
var SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./logo.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
      .catch(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; })
                              .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  var url = new URL(req.url);

  /* Deja pasar sin tocar las llamadas a otras webs (APIs de tasas, CDN de iconos) */
  if (url.origin !== self.location.origin) return;

  /* Navegacion: red primero, cache de respaldo (siempre abre, aun sin internet) */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put("./index.html", copy); });
          return res;
        })
        .catch(function () { return caches.match("./index.html"); })
    );
    return;
  }

  /* Assets del build: cache primero, red de respaldo */
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
