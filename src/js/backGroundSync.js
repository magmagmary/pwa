const form = document.querySelector("form");
const titleInput = document.querySelector("#title");
const locationInput = document.querySelector("#location");
const closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
const shareImageButton = document.querySelector("#share-image-button");
const createPostArea = document.querySelector("#create-post");

const closePostModal = () => {
  createPostArea.classList.add("hidden");
};

const openPostModal = () => {
  createPostArea.classList.remove("hidden");
};

const uuidv4 = () => {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  );
};

const sendData = () => {
  const post = {
    id: new Date().toISOString(),
    image: "https://picsum.photos/200/300",
    title: titleInput.value,
    location: locationInput.value,
  };
  fetch(generateUrl("storePost"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(post),
  }).then(() => {
    console.log("Data sent", titleInput.value, locationInput.value);
    createCard(post);
  });
};

const handleSubmit = (event) => {
  event.preventDefault();
  if (!titleInput.value.trim() || !locationInput.value.trim()) {
    return alert("Please enter valid data!");
  }
  closePostModal();

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    return navigator.serviceWorker.ready.then((sw) => {
      const post = {
        id: uuidv4(),
        title: titleInput.value,
        location: locationInput.value,
        image: "https://picsum.photos/200/300",
      };

      writeData(POST_SYNC_STORE, post)
        .then(() => {
          return sw.sync.register("sync-new-posts");
        })
        .then(() => {
          const snackbar = document.querySelector("#confirmation-toast");
          const data = { message: "Your post was saved for syncing!" };

          snackbar.MaterialSnackbar.showSnackbar(data);
        })
        .catch((err) => {
          console.error(err);
        });
    });
  }

  sendData();
};

form.addEventListener("submit", handleSubmit);

shareImageButton.addEventListener("click", openPostModal);

closeCreatePostModalButton.addEventListener("click", closePostModal);
