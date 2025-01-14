const showPromptButton = document.querySelector("#prompt-suggestion-button");
const unregisterServiceWorkerButton = document.querySelector(
  "#unregister-service-worker-button"
);

const sharedMomentsArea = document.querySelector("#shared-moments");

const showPrompt = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === "dismissed") {
        console.log("User cancelled installation");
      } else {
        console.log("User added to home screen");
      }
    });

    deferredPrompt = null;
  }
};

const unregisterServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let i = 0; i < registrations.length; i++) {
        registrations[i].unregister();
      }
    });
  }
};

showPromptButton.addEventListener("click", showPrompt);

unregisterServiceWorkerButton.addEventListener(
  "click",
  unregisterServiceWorker
);

// Currently not in use, allows to save assets in cache on demand
// function onSaveButtonClicked() {
//   if ("caches" in window) {
//     caches.open("user-requested").then((cache) => {
//       cache.add("https://httpbin.org/get");
//       cache.add("/src/images/sf-boat.jpg");
//     });
//   }
// }

function clearCards() {
  if (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.innerHTML = "";
  }
}

function createCard(data) {
  const cardWrapper = document.createElement("div");
  cardWrapper.className =
    "shared-moment-card mdl-card mdl-shadow--2dp w-[200px]";
  const cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = `url(${data.image})`;
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardWrapper.appendChild(cardTitle);
  const cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  const cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = "center";
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);

  /******
  ** This is the code which is used to add a button to the card
  const cardSaveButton = document.createElement("button");
  cardSaveButton.textContent = "Save";
  cardSaveButton.className = "mdl-button mdl-js-button mdl-button--colored";
  cardSaveButton.addEventListener("click", onSaveButtonClicked);
  cardSupportingText.appendChild(cardSaveButton);
  ******/
}

function updateUI(data) {
  clearCards();

  for (post of data) {
    createCard(post);
  }
}

// (function loadCardWithCacheSupport() {
//   let networkDataReceived = false;
//   const url = generateUrl("getPosts);

//   fetch(url)
//     .then((res) => res.json())
//     .then((data) => {
//       console.log("From web", data);
//       networkDataReceived = true;
//       updateUI(Object.values(data));
//     })
//     .catch(() => {});

//   if ("caches" in window) {
//     caches
//       .match(url)
//       .then((response) => {
//         if (response) {
//           return response.json();
//         }
//       })
//       .then((data) => {
//         console.log("From cache", data);
//         if (networkDataReceived) return;
//         updateUI(Object.values(data));
//       });
//   }
// })();

(function loadCardWithIndexDb() {
  let networkDataReceived = false;
  const url = generateUrl("getPosts");

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      console.log("From web", data);
      networkDataReceived = true;
      updateUI(Object.values(data));
    })
    .catch(() => {});

  if ("indexedDB" in window) {
    readAllData(POST_OBJECT_STORE).then((response) => {
      console.log("From indexedDB", response);
      if (!networkDataReceived) {
        updateUI(Object.values(response));
      }
    });
  }
})();
