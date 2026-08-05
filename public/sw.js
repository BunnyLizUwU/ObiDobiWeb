const CACHE_NAME = 'obidobi-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/logo.png'
];

// Instalar SW y almacenar archivos estáticos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Responder con caché si está disponible, o hacer petición de red
self.addEventListener('fetch', event => {
  // Ignorar peticiones de API de Supabase o no GET
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Devolver del caché
        }
        return fetch(event.request); // Hacer petición a internet
      })
  );
});
