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

workboxSW.precache([]);
