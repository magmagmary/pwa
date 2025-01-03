const cachedAssets = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/material.min.js",
  "/src/images/main-image.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
];
const STATIC_CACHE_NAME = "static-v17";
const DYNAMIC_CACHE_NAME = "dynamic-v5";

self.addEventListener("install", function (event) {
  console.log("Service Worker: installing.", event);
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log("service worker: pre-caching app shell");

      cache.addAll(cachedAssets);
    })
  );
});

self.addEventListener("activate", function (event) {
  console.log("Service Worker: activating.", event);
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            console.log("Service Worker: removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  const url = "https://httpbin.org/get";

  if (event.request.url.indexOf(url) > -1) {
    // cache then network strategy
    return event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((res) => {
            cache.put(event.request, res.clone());
            return res;
          })
          .catch(() => {});
      })
    );
  }

  // cache only strategy for static assets
  if (cachedAssets.includes(event.request.url)) {
    return event.respondWith(caches.match(event.request));
  }

  // cache with network fallback strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      } else {
        return fetch(event.request)
          .then((res) => {
            return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(event.request.url, res.clone());
              return res;
            });
          })
          .catch(() => {
            return caches.open(STATIC_CACHE_NAME).then((cache) => {
              return cache.match("/offline.html");
            });
          });
      }
    })
  );
});

// cache only strategy
// self.addEventListener("fetch", function (event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// network only strategy
// self.addEventListener("fetch", function (event) {
//   event.respondWith(fetch(event.request));
// });

// network with cache fallback strategy
// self.addEventListener("fetch", function (event) {
//   event.respondWith(
//     fetch(event.request)
//       .then((res) => {
//         return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
//           cache.put(event.request.url, res.clone());
//           return res;
//         });
//       })
//       .catch(() => {
//         return caches.match(event.request);
//       })
//   );
// });
