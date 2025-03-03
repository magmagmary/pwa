importScripts("workbox-sw.prod.v2.1.3.js");
importScripts("/src/js/idb.js");
importScripts("/src/js/indexedDB.js");
importScripts("/src/js/config.js");

const url = generateUrl("getPosts");
const workboxSW = new self.WorkboxSW();

// google fonts
workboxSW.router.registerRoute(
  /.*(googleapis|gstatic)\.com/,
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "google-fonts",
    cacheExpiration: {
      maxEntries: 3,
      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
    },
  }) // cache then network
);

// material ui
workboxSW.router.registerRoute(
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "material-css",
  })
);

// tailwind css
workboxSW.router.registerRoute(
  "https://cdn.tailwindcss.com",
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "tailwind-css",
  })
);

// fetching data from the server
workboxSW.router.registerRoute(url, (args) => {
  return fetch(args.event.request).then((res) => {
    const clonedRes = res.clone();

    clonedRes.json().then((data) => {
      for (const key in data) {
        writeData(POST_OBJECT_STORE, data[key]);
      }
    });

    return res;
  });
});

// offline page fallback
workboxSW.router.registerRoute(
  (route) => {
    return route.event.request.headers.get("accept").includes("text/html");
  },
  (args) => {
    return caches.match(args.event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(args.event.request)
        .then((res) => {
          return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(args.event.request.url, res.clone());
            return res;
          });
        })
        .catch(() => {
          return caches.match("/offline.html").then((res) => {
            return res;
          });
        });
    });
  }
);

workboxSW.precache([
  {
    "url": "index.html",
    "revision": "c288c5117911a5543f6b3c155c7f0abc"
  },
  {
    "url": "offline.html",
    "revision": "59d9957582ae1597b9ad29dd9590c952"
  },
  {
    "url": "src/images/icons/app-icon-144x144.png",
    "revision": "83011e228238e66949f0aa0f28f128ef"
  },
  {
    "url": "src/images/icons/app-icon-192x192.png",
    "revision": "f927cb7f94b4104142dd6e65dcb600c1"
  },
  {
    "url": "src/images/icons/app-icon-256x256.png",
    "revision": "86c18ed2761e15cd082afb9a86f9093d"
  },
  {
    "url": "src/images/icons/app-icon-384x384.png",
    "revision": "fbb29bd136322381cc69165fd094ac41"
  },
  {
    "url": "src/images/icons/app-icon-48x48.png",
    "revision": "45eb5bd6e938c31cb371481b4719eb14"
  },
  {
    "url": "src/images/icons/app-icon-512x512.png",
    "revision": "d42d62ccce4170072b28e4ae03a8d8d6"
  },
  {
    "url": "src/images/icons/app-icon-96x96.png",
    "revision": "56420472b13ab9ea107f3b6046b0a824"
  },
  {
    "url": "src/images/icons/apple-icon-114x114.png",
    "revision": "74061872747d33e4e9f202bdefef8f03"
  },
  {
    "url": "src/images/icons/apple-icon-120x120.png",
    "revision": "abd1cfb1a51ebe8cddbb9ada65cde578"
  },
  {
    "url": "src/images/icons/apple-icon-144x144.png",
    "revision": "b4b4f7ced5a981dcd18cb2dc9c2b215a"
  },
  {
    "url": "src/images/icons/apple-icon-152x152.png",
    "revision": "841f96b69f9f74931d925afb3f64a9c2"
  },
  {
    "url": "src/images/icons/apple-icon-180x180.png",
    "revision": "2e5e6e6f2685236ab6b0c59b0faebab5"
  },
  {
    "url": "src/images/icons/apple-icon-57x57.png",
    "revision": "cc93af251fd66d09b099e90bfc0427a8"
  },
  {
    "url": "src/images/icons/apple-icon-60x60.png",
    "revision": "18b745d372987b94d72febb4d7b3fd70"
  },
  {
    "url": "src/images/icons/apple-icon-72x72.png",
    "revision": "b650bbe358908a2b217a0087011266b5"
  },
  {
    "url": "src/images/icons/apple-icon-76x76.png",
    "revision": "bf10706510089815f7bacee1f438291c"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/mobile-screenshot.jpg",
    "revision": "e9391e9fb4c78c74676458ae654d3f05"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  },
  {
    "url": "src/images/web-screenshot.jpg",
    "revision": "976f3c1172205e4b1c487f694a448663"
  },
  {
    "url": "src/js/app.js",
    "revision": "36c1151523506732dda688babf005224"
  },
  {
    "url": "src/js/backGroundSync.js",
    "revision": "99e54a780742781b1e71ee011e71c3d0"
  },
  {
    "url": "src/js/config.js",
    "revision": "822fc93bd3ed2a8d8178ff8baec7e2dd"
  },
  {
    "url": "src/js/feed.js",
    "revision": "e0ecad57e0a5369124f660172d408779"
  },
  {
    "url": "src/js/idb.js",
    "revision": "4a06b71fe5468dcecebcc36ee1c150b1"
  },
  {
    "url": "src/js/indexedDB.js",
    "revision": "5c32a91bc8088f5d5d510ee7e2d52341"
  },
  {
    "url": "src/js/location.js",
    "revision": "aaf9d9530f5aabc4f483c683fe254d1a"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/video.js",
    "revision": "7c63b402c2fdd4d866b80e8370775f70"
  },
  {
    "url": "sw.js",
    "revision": "2fef691a406be458d73c93289858e07d"
  },
  {
    "url": "workbox-sw.prod.v2.1.3.js",
    "revision": "a9890beda9e5f17e4c68f42324217941"
  }
]);

self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background syncing", event);

  if (event.tag === "sync-new-posts") {
    console.log(">>>>Syncing new posts");

    event.waitUntil(
      readAllData(POST_SYNC_STORE).then((data) => {
        for (const post of data) {
          const formData = new FormData();

          for (const key in post) {
            formData.append(key, post[key]);
          }

          fetch(generateUrl("storePost"), {
            method: "POST",
            body: formData,
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
