const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const webPush = require("web-push");
const formidable = require("formidable-serverless");
const { defineSecret } = require("firebase-functions/params");

const BUCKET_NAME = "mgm-pwa.firebasestorage.app";

// the config file is not included in the repo. You should create your own if you need production deployment
const serviceAccount = require("./mgm-pwa-firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "http://127.0.0.1:5002?ns=mgm-pwa-default-rtdb",
});

const uuidv4 = () => {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  );
};

exports.getPosts = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    admin
      .database()
      .ref("posts")
      .once("value")
      .then((snapshot) => {
        const posts = snapshot.val();

        response.status(200).json(posts);
      })
      .catch((error) => {
        response.status(500).json(error);
      });
  });
});

exports.storePost = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    const form = formidable.IncomingForm();
    form.parse(request, (err, fields, files) => {
      const file = files.image;

      if (!file) {
        return response.status(400).json({
          message: "No image provided",
        });
      }

      const bucket = admin.storage().bucket(BUCKET_NAME);
      const destination = `posts/${fields.title}.jpeg`;

      bucket
        .upload(file.path, {
          destination,
          metadata: {
            uploadType: "media",
            metadata: {
              contentType: "image/jpeg",
              firebaseStorageDownloadTokens: uuidv4(),
            },
          },
        })
        .then(() =>
          admin
            .database()
            .ref("posts")
            .push({
              id: fields.id,
              title: fields.title,
              location: fields.location,
              image: `http://localhost:9199/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(
                destination
              )}?alt=media`,
              rawLocation: {
                lat: fields.rawLocationLat,
                lng: fields.rawLocationLng,
              },
            })
        )
        .then(() => {
          const VAPID_PUBLIC_KEY = defineSecret("VAPID_PUBLIC_KEY").value();
          const VAPID_PRIVATE_KEY = defineSecret("VAPID_PRIVATE_KEY").value();

          webPush.setVapidDetails(
            "mailto:magmagmary70@gmail.com",
            VAPID_PUBLIC_KEY,
            VAPID_PRIVATE_KEY
          );

          return admin.database().ref("subscriptions").once("value");
        })
        .then((subscriptions) => {
          // biome-ignore lint/complexity/noForEach: <explanation>
          subscriptions.forEach((sub) => {
            const { endpoint, keys } = sub.val();
            const pushConfig = {
              endpoint,
              keys,
            };

            webPush
              .sendNotification(
                pushConfig,
                JSON.stringify({
                  title: "New Post",
                  content: "New post added!",
                  openUrl: "/help",
                })
              )
              .catch((err) => logger.error(err));
          });
          response.status(201).json({
            message: "post created successfully",
            id: request.body.id,
          });
        })
        .catch((err) =>
          response.status(500).json({
            err,
          })
        );
    });
  });
});

exports.storeSubscription = functions.https.onRequest((request, response) => {
  cors(request, response, () => {
    admin
      .database()
      .ref("subscriptions")
      .push(request.body)
      .then(() => {
        response.status(201).json({
          message: "subscription created successfully",
        });
      })
      .catch((err) =>
        response.status(500).json({
          err,
        })
      );
  });
});
