const shareImageButton = document.querySelector("#share-image-button");
const showPromptButton = document.querySelector("#prompt-suggestion-button");
const unregisterServiceWorkerButton = document.querySelector(
  "#unregister-service-worker-button"
);

const createPostArea = document.querySelector("#create-post");
const closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
const sharedMomentsArea = document.querySelector("#shared-moments");

function openCreatePostModal() {
  createPostArea.classList.remove("hidden");
}

function closeCreatePostModal() {
  createPostArea.classList.add("hidden");
}

const showPrompt = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
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

shareImageButton.addEventListener("click", openCreatePostModal);

showPromptButton.addEventListener("click", showPrompt);

unregisterServiceWorkerButton.addEventListener(
  "click",
  unregisterServiceWorker
);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

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
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard() {
  clearCards();

  const cardWrapper = document.createElement("div");
  cardWrapper.className =
    "shared-moment-card mdl-card mdl-shadow--2dp mx-auto mt-8";
  const cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardWrapper.appendChild(cardTitle);
  const cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = "San Francisco Trip";
  cardTitle.appendChild(cardTitleTextElement);
  const cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = "In San Francisco";
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

(function loadCard() {
  let networkDataReceived = false;
  const url = "https://httpbin.org/get";

  fetch(url)
    .then(function (res) {
      return res.json();
    })
    .then(function () {
      networkDataReceived = true;
      createCard();
    })
    .catch(function () {});

  if ("caches" in window) {
    caches
      .match(url)
      .then(function (response) {
        if (response) {
          return response.json();
        }
      })
      .then(function () {
        if (networkDataReceived) return;
        createCard();
      });
  }
})();
