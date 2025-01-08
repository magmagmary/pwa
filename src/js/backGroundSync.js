const form = document.querySelector("form");
const titleInput = document.querySelector("#title");
const locationInput = document.querySelector("#location");
const closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
const shareImageButton = document.querySelector("#share-image-button");
const createPostArea = document.querySelector("#create-post");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!titleInput.value.trim() || !locationInput.value.trim()) {
    return alert("Please enter valid data!");
  }
});

const openCreatePostModal = () => {
  createPostArea.classList.remove("hidden");
};

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", () => {
  createPostArea.classList.add("hidden");
});
