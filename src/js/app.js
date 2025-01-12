const VAPID_PUBLIC_KEY =
  "BHjSoVgchkHG7ccuFGFi1lDWqPJUeldmin6VE6FuwGhm2TL5jTlMpMvyAgv6eoKuqOMwwEYrDIwivTCdghQsUaQ";
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

const displayConfirmNotification = (title, body = "") => {
  const options = {
    body,
    icon: "src/images/icons/app-icon-96x96.png",
    image: "src/images/sf-boat.jpg", // not supported in all devices
    dir: "ltr",
    lang: "en-US", // BCP 47
    vibrate: [100, 50, 200], // vibration, pause, vibration
    badge: "src/images/icons/app-icon-96x96.png",
    // tag: "confirm-notification", // to avoid multiple notifications
    // renotify: false, // to make the device vibrate again
    actions: [
      {
        action: "confirm",
        title: "Okay",
        icon: "src/images/icons/app-icon-96x96.png",
      },
      {
        action: "cancel",
        title: "Cancel",
        icon: "src/images/icons/app-icon-96x96.png",
      },
    ],
  };
  navigator.serviceWorker.ready.then((sw) => {
    sw.showNotification(title, options);
  });
};

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

const configurePushSubscription = () => {
  navigator.serviceWorker.ready.then((sw) => {
    sw.pushManager
      .getSubscription()
      .then((sub) => {
        if (sub === null) {
          // create a new subscription
          return sw.pushManager.subscribe({
            userVisibleOnly: true, // only show notification if the user is on the page
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        }
      })
      .then((newSub) => {
        return fetch(`${DATA_BASE_URL}/subscriptions.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(newSub),
        });
      })
      .then((res) => {
        if (res.ok) {
          displayConfirmNotification("You successfully subscribe!");
        }
      })
      .catch((err) => {
        console.error("Error while subscribing", err);
      });
  });
};

const askForNotificationPermission = () => {
  Notification.requestPermission((result) => {
    if (result !== "granted") {
      return console.log("No notification permission granted");
    }

    configurePushSubscription();

    // displayConfirmNotification(
    //   "You successfully subscribed",
    //   "Thanks for subscribing"
    // );
  });
};

if ("Notification" in window && "serviceWorker" in navigator) {
  for (button of enableNotificationsButtons) {
    button.style.display = "inline-block";
    button.addEventListener("click", askForNotificationPermission);
  }
}
