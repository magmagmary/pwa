const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

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
