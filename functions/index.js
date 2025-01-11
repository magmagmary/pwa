const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const webPush = require("web-push");
const dotenv = require("dotenv");

dotenv.config();

// the config file is not included in the repo. You should create your own
const serviceAccount = require("./mgm-pwa-firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mgm-pwa-default-rtdb.europe-west1.firebasedatabase.app",
});

exports.storePost = onRequest((request, response) => {
  cors(request, response, () => {
    admin
      .database()
      .ref("posts")
      .push(request.body)
      .then(() => {
        webPush.setVapidDetails(
          "mailto:magmagmary70@gmail.com",
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
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
