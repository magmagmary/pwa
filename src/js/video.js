const player = document.getElementById("player");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture-btn");
const imagePicker = document.getElementById("image-picker");
const imagePickerArea = document.getElementById("pick-image");

let picture;

const dataUrlToBlob = (dataUrl) => {
  const byteString = atob(dataUrl.split(",")[1]);
  const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([ab], { type: mimeString });
  return blob;
};

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

const resetVideoStyles = () => {
  imagePickerArea.classList.add("hidden");
  player.classList.add("hidden");
  canvas.classList.add("hidden");
  captureBtn.classList.add("hidden");
};

const takeSnapshot = () => {
  canvas.classList.remove("hidden");
  player.classList.add("hidden");
  captureBtn.classList.add("hidden");

  const context = canvas.getContext("2d");
  context.drawImage(
    player,
    0,
    0,
    canvas.width,
    player.videoHeight / (player.videoWidth / canvas.width)
  );

  for (const track of player.srcObject.getVideoTracks()) {
    track.stop();
  }

  picture = dataUrlToBlob(canvas.toDataURL());
};

const pickImage = (event) => {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  picture = file;
};

captureBtn.addEventListener("click", takeSnapshot);

imagePicker.addEventListener("change", pickImage);
