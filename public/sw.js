self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('nush-cache-v1').then((cache) => {
      return cache.addAll(['/']);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache API calls — always fetch fresh from network
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Only cache successful GET responses for non-API routes
        if (event.request.method === 'GET' && fetchResponse.status === 200) {
          return caches.open('nush-cache-v1').then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        }
        return fetchResponse;
      });
    }).catch(() => {
      // Offline fallback can go here
      return new Response('Offline');
    })
  );
});
