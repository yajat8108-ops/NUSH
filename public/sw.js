self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('nush-cache-v1').then((cache) => {
      return cache.addAll(['/']);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Only cache successful responses for GET requests
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
