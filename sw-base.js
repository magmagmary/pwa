importScripts("workbox-sw.prod.v2.1.3.js");

const workboxSW = new self.WorkboxSW();

// google fonts
workboxSW.router.registerRoute(
  /.*(googleapis|gstatic)\.com/,
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "google-fonts",
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

workboxSW.precache([]);
