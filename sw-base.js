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

workboxSW.precache([]);

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
