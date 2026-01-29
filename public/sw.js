// Aptos Explorer Service Worker
// Provides offline support, caching, and PWA functionality

const CACHE_NAME = "aptos-explorer-v1";
const STATIC_CACHE_NAME = "aptos-explorer-static-v1";
const DYNAMIC_CACHE_NAME = "aptos-explorer-dynamic-v1";

// Static assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/favicon.ico",
  "/favicon-light.svg",
  "/favicon-dark.svg",
  "/favicon-192.png",
  "/favicon-512.png",
  "/apple-touch-icon.png",
  "/manifest.json",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("[SW] Static assets cached");
        return self.skipWaiting();
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name !== STATIC_CACHE_NAME && name !== DYNAMIC_CACHE_NAME;
            })
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            }),
        );
      })
      .then(() => {
        console.log("[SW] Service worker activated");
        return self.clients.claim();
      }),
  );
});

// Fetch event - handle requests with appropriate caching strategies
self.addEventListener("fetch", (event) => {
  const {request} = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Google Fonts - Cache First (fonts rarely change)
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(
      cacheFirst(request, "google-fonts-cache", 365 * 24 * 60 * 60),
    );
    return;
  }

  // Aptos API calls - Network First (always try fresh data)
  if (
    url.hostname.includes("aptoslabs.com") &&
    url.pathname.startsWith("/v1")
  ) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME, 5 * 60));
    return;
  }

  // Static assets (JS, CSS, images) - Cache First
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      cacheFirst(request, STATIC_CACHE_NAME, 30 * 24 * 60 * 60),
    );
    return;
  }

  // HTML pages - Network First (for SSR content)
  if (
    request.destination === "document" ||
    request.headers.get("accept")?.includes("text/html")
  ) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME, 60 * 60));
    return;
  }

  // Default - Network First
  event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME, 60 * 60));
});

// Cache First strategy - good for static assets that rarely change
async function cacheFirst(request, cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log(
      "[SW] Network request failed, no cache available:",
      request.url,
    );
    return new Response("Network error", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

// Network First strategy - good for dynamic content
async function networkFirst(request, cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("[SW] Network request failed, trying cache:", request.url);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback for navigation requests
    if (request.destination === "document") {
      const offlineFallback = await cache.match("/");
      if (offlineFallback) {
        return offlineFallback;
      }
    }

    return new Response("Network error", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

// Handle messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
