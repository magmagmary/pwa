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
  };
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((sw) => {
      sw.showNotification("hihi", options);
    });
  }
};

const askForNotificationPermission = () => {
  Notification.requestPermission((result) => {
    if (result !== "granted") {
      return console.log("No notification permission granted");
    }
    displayConfirmNotification(
      "You successfully subscribed to our notification service!"
    );
  });
};

if ("Notification" in window) {
  for (button of enableNotificationsButtons) {
    button.style.display = "inline-block";
    button.addEventListener("click", askForNotificationPermission);
  }
}
