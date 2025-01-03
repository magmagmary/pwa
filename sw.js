const cachedAssets = [
    '/',
    '/index.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/material.min.js',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
];

self.addEventListener('install', function(event) {
    console.log('Service Worker: installing.' , event);
    event.waitUntil(
        caches.open('static').then((cache)=>{
            console.log('service worker: pre-caching app shell');

            cache.addAll(cachedAssets);
        })
    );
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker: activating.' , event);
    return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then((response)=>{
            if(response){
                return response;
            } else {
                return fetch(event.request);
            }
        })
    );
});