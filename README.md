# magmag-pWA

This project implements a Progressive Web App (PWA) named MagMag(💁‍♀️), designed for sharing photos and videos.  It utilizes Firebase for backend services, including storage, real-time database, and Cloud Functions.  The frontend uses Material Design Lite and Tailwind CSS for styling.

## Features and Functionality

* **Post Creation:** Users can create posts, including images or videos, along with titles and locations.  Location can be obtained automatically using **geolocation** or manually entered.
* **Offline Functionality:**  The app works **offline**, caching posts and enabling **background synchronization** of new posts.
* **Push Notifications:** Users can **subscribe** to receive **push notifications** when new posts are added.
* **Background Synchronization:** Posts created offline are synchronized with the server when the device regains network connectivity.

## Technology Stack

* **Frontend:** HTML, JavaScript, Material Design Lite, Tailwind CSS ( Proper design was not the scope of this project )
* **Backend:** Firebase (Firestore, Firebase Storage, Cloud Functions)
* **Service Worker:** **Workbox** (for caching and background sync)

## Prerequisites

* Node.js, npm, and yarn
* Firebase CLI ( `npm install -g firebase-tools` )
* A Firebase emulator suite with the necessary services enabled (Firestore, Storage, Cloud Functions).
* A **VAPID key** pair for web push notifications.  This will be configured as **Firebase secrets**. 

## Front-End Installation Instructions

1. Clone the repository: `git clone https://github.com/magmagmary/magmag-pwa.git`
2. Navigate to the project directory: `cd magmag-pwa`
3. Install dependencies: `yarn install`
4. Run `yarn start`

## Back-End Installation Instructions

1. Create a Firebase project (The **pay as go plan** should be used to utilize the storage)
2. Configure the **bucket name**, **credentials**, and **real-time database address** based on the new project.
3. Navigate to the functions directory: `cd functions`
4. Install dependencies: `npm install`
5. Run `firebase emulators:start --import=./emulator-data` to establish the emulator with some seed.

## Usage Guide

1.  Open `index.html` in your browser.
2.  To create a post, click the "+" button ( `#share-image-button` in `index.html` ).
3.  Capture a video or select an image, then add a title and location.
4.  Click "Post!" to share.
5.  Enable push notifications to receive alerts for new posts.

## API Documentation

The backend API uses Firebase Cloud Functions.  The relevant functions are defined in `functions/index.js`:

* **`getPosts`:** (HTTP GET request to `/getPosts`) Retrieves all posts from the "posts" node in the Firebase Realtime Database.
* **`storePost`:** (HTTP POST request to `/storePost`) Stores a new post, including image upload to Firebase Storage and update of the Realtime Database.  Requires `title`, `location`, `image` (file), and location coordinates (`rawLocationLat`, `rawLocationLng`) as form data.
* **`storeSubscription`:** (HTTP POST request to `/storeSubscription`) Stores a push notification subscription in the "subscriptions" node of the Realtime Database.

## License Information

License information not specified.
