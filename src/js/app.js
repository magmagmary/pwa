let deferredPrompt;

const enableNotificationsButtons = document.querySelectorAll(
  ".enable-notifications"
);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js")
    .then((reg) => {
      console.log("Service Worker Registered");
    })
    .catch((err) => {
      console.log("Service Worker Not Registered");
    });
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  return false;
});

const displayConfirmNotification = (title) => {
  const options = {
    body: "some Random body!",
    icon: "/src/images/icons/app-icon-96x96.png",
    image: "/src/images/sf-boat.jpg", // not supported in all devices
    dir: "ltr",
    lang: "en-US", // BCP 47
    vibrate: [100, 50, 200], // vibration, pause, vibration
    badge: "/src/images/icons/app-icon-96x96.png",
  };
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((sw) => {
      sw.showNotification(title, options);
    });
  }
};

const askForNotificationPermission = () => {
  Notification.requestPermission((result) => {
    if (result !== "granted") {
      return console.log("No notification permission granted");
    }
    displayConfirmNotification("You successfully subscribed");
  });
};

if ("Notification" in window) {
  for (button of enableNotificationsButtons) {
    button.style.display = "inline-block";
    button.addEventListener("click", askForNotificationPermission);
  }
}
