importScripts("/src/js/idb.js");
importScripts("/src/js/indexedDB.js");
importScripts("/src/js/config.js");

const STATIC_CACHE_NAME = "static-v57";
const DYNAMIC_CACHE_NAME = "dynamic-v7";

const cachedAssets = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/config.js",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/idb.js",
  "/src/js/material.min.js",
  "/src/js/backGroundSync.js",
  "/src/js/indexedDB.js",
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

function isInArray(string, array) {
  let cachePath;

  if (string.indexOf(self.origin) === 0) {
    // request targets domain where we serve the page from (i.e. NOT a CDN)
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
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

self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background syncing", event);

  if (event.tag === "sync-new-posts") {
    console.log(">>>>Syncing new posts");

    event.waitUntil(
      readAllData(POST_SYNC_STORE).then((data) => {
        for (const post of data) {
          fetch(generateUrl("storePost"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(post),
          })
            .then((res) => res.json())
            .then(({ message, id }) => {
              console.log(message);
              deleteItemFromData(POST_SYNC_STORE, id);
            })
            .catch((err) => {
              console.error("Error while sending data", err);
            });
        }
      })
    );
  }
});

// index db approach
self.addEventListener("fetch", (event) => {
  const url = generateUrl("getPosts");

  if (event.request.url.indexOf(url) > -1) {
    return event.respondWith(
      fetch(event.request).then((res) => {
        const clonedRes = res.clone();

        clonedRes.json().then((data) => {
          for (const key in data) {
            writeData(POST_OBJECT_STORE, data[key]);
          }
        });

        return res;
      })
    );
  }

  // cache only strategy for static assets
  if (isInArray(event.request.url, cachedAssets)) {
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
//   const url = generateUrl("getPosts");
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

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const action = event.action;

  if (action === "confirm") {
    console.log("confirm was chosen");

    return notification.close();
  }

  event.waitUntil(
    clients.matchAll().then((clients) => {
      const client = clients.find((cli) => cli.visibilityState === "visible");
      notification.close();
      if (client) {
        client.navigate(notification.data.url);
        return client.focus();
      }

      clients.openWindow(notification.data.url);
    })
  );
});

self.addEventListener("notificationclose", (event) => {
  console.log("notification was closed", event);
});

self.addEventListener("push", (event) => {
  console.log("Push notification received", event);
  let data = {
    title: "New!",
    content: "Something new happened!",
    openUrl: "/",
  };

  if (event.data) {
    data = JSON.parse(event.data.text());
  }

  const notificationOptions = {
    body: data.content,
    icon: "/src/images/icons/app-icon-96x96.png",
    badge: "/src/images/icons/app-icon-96x96.png",
    data: {
      url: data.openUrl,
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});
