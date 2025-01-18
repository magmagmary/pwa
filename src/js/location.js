const locationPicker = document.getElementById("get-location");
const spinner = document.getElementById("location-loader");
const locationInput = document.querySelector("#location");

let fetchedLocation = { lat: 0, lng: 0 };

const resetLocationStyles = () => {
  locationPicker.classList.remove("hidden");
  spinner.classList.add("hidden");
};

const initializeLocation = () => {
  if (!("geolocation" in navigator)) {
    locationPicker.classList.add("hidden");
  }
};

const getUserLocation = () => {
  locationPicker.classList.add("hidden");
  spinner.classList.remove("hidden");

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      fetchedLocation = {
        lat: coords.latitude,
        lng: coords.longitude,
      };
      resetLocationStyles();
      locationInput.value = `San Francisco - ${fetchedLocation.lat}`;
    },
    (error) => {
      fetchedLocation = { lat: 0, lng: 0 };
      console.log(error);
      resetLocationStyles();
    },
    {
      timeout: 10000,
    }
  );
};

locationPicker.addEventListener("click", getUserLocation);
