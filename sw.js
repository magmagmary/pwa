self.addEventListener('install', function(event) {
    console.log('Service Worker: installing.' , event);
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker: activating.' , event);
});

self.addEventListener('fetch', function(event) {
    console.log('Service Worker: fetching.' , event);

    event.respondWith(
        fetch(event.request)
    );
});