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

const sendData = () => {
  const post = {
    id: new Date().toISOString(),
    image: "https://picsum.photos/200/300",
    title: titleInput.value,
    location: locationInput.value,
  };
  fetch(
    "https://mgm-pwa-default-rtdb.europe-west1.firebasedatabase.app/posts.json",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(post),
    }
  ).then(() => {
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
        id: new Date().toISOString(),
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
