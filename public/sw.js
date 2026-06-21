const CACHE_NAME = "cashtalk-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/logo.svg",
  "/manifest.json"
];

// Install Event: cache core app shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event: prune old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: server static assets offline, fallback gracefully
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // CRITICAL: NEVER cache or intercept /api/* backend dynamic network requests
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Handle local document/asset routing with stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch from network in background to silently update cache
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Silently ignore network failures (e.g. offline mode)
          });

        return cachedResponse;
      }

      // If not in cache, fallback to live fetch
      return fetch(event.request).then((response) => {
        // Only cache valid standard GET responses
        if (
          !response || 
          response.status !== 200 || 
          response.type !== "basic" || 
          event.request.method !== "GET"
        ) {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch((err) => {
        // If navigating to page offline, fallback to index.html
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
        throw err;
      });
    })
  );
});
