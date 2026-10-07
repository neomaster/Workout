/* Modo offline do Torquímetro Gym (só no GitHub Pages ou outro servidor http/https).
   A página e os ícones vêm do cache e se atualizam em segundo plano;
   alta.json tenta a rede primeiro para a renovação semanal pegar a versão mais nova. */
const VERSAO = "tg-v3";
const ARQUIVOS = ["./", "./index.html", "./alta.json", "./manifest.webmanifest",
  "./icones/icone-192.png", "./icones/icone-512.png", "./icones/icone-maskable-512.png", "./icones/apple-touch-icon.png", "./cadastro.html", "./vendor/supabase-2.117.3.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;   /* fontes e redes: direto da rede */
  if (url.pathname.endsWith("/alta.json")) {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSAO).then(x => x.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(emCache => {
    const daRede = fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(VERSAO).then(x => x.put(e.request, c)); } return r; }).catch(() => emCache);
    return emCache || daRede;
  }));
});
