const player = document.getElementById("player");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture-btn");
const imagePicker = document.getElementById("image-picker");
const imagePickerArea = document.getElementById("pick-image");

// write the polyfill for getUserMedia
const initializeMedia = () => {
  if (!("mediaDevices" in navigator)) {
    navigator.mediaDevices = {};
  }
  if (!("getUserMedia" in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = (constraints) => {
      const getUserMedia = webkitGetUserMedia || mozGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error("getUserMedia is not implemented"));
      }

      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      player.srcObject = stream;
      player.classList.remove("hidden");
      captureBtn.classList.remove("hidden");
    })
    .catch(() => {
      imagePickerArea.classList.remove("hidden");
    });
};

const resetStyles = () => {
  imagePickerArea.classList.add("hidden");
  player.classList.add("hidden");
  canvas.classList.add("hidden");
  captureBtn.classList.add("hidden");
};
