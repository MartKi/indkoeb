// Service worker: gemmer appens filer, så den kan åbnes uden net.
// Selve listedata håndteres af Firestores egen offline-cache.
// Hæv versionsnummeret, hvis du vil tvinge en ren genindlæsning af cachen.
const CACHE = "indkoeb-v6";
const SHELL = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png"];
const SDK_HOST = "www.gstatic.com";
const NET_TIMEOUT_MS = 3000; // dårlig dækning i butikken: brug cachen efter 3 sek.

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Firebase SDK: versionsnummer i URL'en, så cache først er sikkert
  if (url.hostname === SDK_HOST && url.pathname.startsWith("/firebasejs/")) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }))
    );
    return;
  }

  // Egne filer: netværk først (så opdateringer slår igennem), cache som reserve
  if (url.origin === self.location.origin) {
    e.respondWith(networkFirst(req));
  }
  // Alt andet (Firestore m.m.) håndteres ikke her
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  const fromCache = () => cache.match(req, { ignoreSearch: true })
    .then((hit) => hit || (req.mode === "navigate" ? cache.match("index.html") : undefined));

  const net = fetch(req).then((res) => {
    if (res.ok) cache.put(req, res.clone());
    return res;
  });
  net.catch(() => {}); // undgå advarsel, hvis nettet fejler efter cachen er brugt

  const timeout = new Promise((resolve) => setTimeout(resolve, NET_TIMEOUT_MS)).then(fromCache);
  try {
    const res = await Promise.race([net, timeout]);
    if (res) return res;
    return await net;
  } catch {
    const hit = await fromCache();
    if (hit) return hit;
    throw new Error("Offline og ikke i cache");
  }
}
