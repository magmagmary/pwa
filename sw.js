importScripts("/src/js/idb.js");
importScripts("/src/js/indexedDB.js");

const STATIC_CACHE_NAME = "static-v44";
const DYNAMIC_CACHE_NAME = "dynamic-v7";

const cachedAssets = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/idb.js",
  "/src/js/material.min.js",
  "/src/images/main-image.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
];

function trimCache(cacheName, maxItems) {
  caches.open(cacheName).then((cache) => {
    return cache.keys().then((keys) => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
      }
    });
  });
}

self.addEventListener("install", (event) => {
  console.log("Service Worker: installing.", event);
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log("service worker: pre-caching app shell");

      cache.addAll(cachedAssets);
    })
  );
});

self.addEventListener("activate", (event) => {
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

// index db approach
self.addEventListener("fetch", (event) => {
  const url =
    "https://mgm-pwa-default-rtdb.europe-west1.firebasedatabase.app/posts.json";

  if (event.request.url.indexOf(url) > -1) {
    return event.respondWith(
      fetch(event.request).then((res) => {
        const clonedRes = res.clone();

        // clearAllData()
        //   .then(() => clonedRes.json())
        //   .then((data) => {
        //     for (key in data) {
        //       writeData(data[key]);
        //     }
        //   });

        clonedRes.json().then((data) => {
          for (const key in data) {
            writeData(data[key]);
          }
        });

        return res;
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
      }

      return fetch(event.request)
        .then((res) => {
          return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request.url, res.clone());
            return res;
          });
        })
        .catch(() => {
          return caches.open(STATIC_CACHE_NAME).then((cache) => {
            if (event.request.headers.get("accept").includes("text/html")) {
              return cache.match("/offline.html");
            }
          });
        });
    })
  );
});

// final browser cache api approach
// self.addEventListener("fetch", (event) => {
//   const url =
//     "https://mgm-pwa-default-rtdb.europe-west1.firebasedatabase.app/posts.json";

//   if (event.request.url.indexOf(url) > -1) {
//     // cache then network strategy
//     return event.respondWith(
//       caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
//         return fetch(event.request)
//           .then((res) => {
//             trimCache(DYNAMIC_CACHE_NAME, 5);
//             cache.put(event.request, res.clone());
//             return res;
//           })
//           .catch(() => {});
//       })
//     );
//   }

//   // cache only strategy for static assets
//   if (cachedAssets.includes(event.request.url)) {
//     return event.respondWith(caches.match(event.request));
//   }

//   // cache with network fallback strategy
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       if (response) {
//         return response;
//       }

//       return fetch(event.request)
//         .then((res) => {
//           return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
//             cache.put(event.request.url, res.clone());
//             return res;
//           });
//         })
//         .catch(() => {
//           return caches.open(STATIC_CACHE_NAME).then((cache) => {
//             if (event.request.headers.get("accept").includes("text/html")) {
//               return cache.match("/offline.html");
//             }
//           });
//         });
//     })
//   );
// });

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
