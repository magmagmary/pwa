let deferredPrompt;

if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then((reg) => {
        console.log('Service Worker Registered');
    })
    .catch((err) => {
        console.log('Service Worker Not Registered');
    });
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    return false;
});