const router = require("express").Router();
const { google } = require("googleapis");
const withAuth = require("../middleware/auth");
const User = require("../models/user");
const axios = require("axios");
const SCOPES = ["https://mail.google.com/"];
const keys = require("../config/keys");

const {
  client_secret,
  client_id,
  redirect_uris,
} = require("../config/keys").web;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

router.get("/", (req, res) => {
  // Check if we have previously stored a token.
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  res.redirect(authUrl);
});
router.get("/api/google/callback", withAuth, (req, resp) => {
  // const code = req.url.split("code")[1].split("&")[0].substr(1);
  const email = req.email;
  const { code } = req.query;

  oAuth2Client.getToken(code, (err, token) => {
    try {
      if (err) {
        console.error("Error retrieving access token");
        return resp.send({ message: "nahi ho paya" });
      }
      // Store the token to disk for later program executions
      User.findOne({ email }, async function (err, user) {
        user.gmailToken = token;
        console.log(token);
        console.log(user);
        await user.save();
        oAuth2Client.setCredentials(token);
        resp.cookie("token", token).send(`
              <html>
                <body>
                  <button onclick="window.close()"> Service Authenticated close window </button>
                </body>
              </html>
              `);
      });
    } catch (error) {
      console.log(error);
    }
  });
});

router.get(
  "/gmail/list",
  withAuth,
  (req, resp) => {
    const { email } = req;
    User.findOne({ email }, async function (err, user) {
      const token = user.gmailToken;
      if (!token || err) resp.send("Auth error");

      oAuth2Client.setCredentials(token);
      const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
      gmail.users.getProfile({ userId: "me" }, (err, res) => {
        if (err) {
          return resp.send("The API returned an error: " + err);
        }
        resp.send(res.data.emailAddress);
      });
      gmail.users.watch(
        {
          userId: "me",
          resource: {
            topicName: keys.topicName,
          },
        },
        function (err, response) {
          if (err) {
            console.log("setWatch", err);
            return;
          }
          console.log(response);
        }
      );
    });
  }
  // authUrl
);

const { PubSub } = require("@google-cloud/pubsub");

// Creates a client; cache this for further use
const pubSubClient = new PubSub();

async function listAllTopics() {
  // Lists all topics in the current project
  const [topics] = await pubSubClient.getTopics();
  const [subcriptions] = await pubSubClient.getSubscriptions();
  // console.log("Subs:");
  subcriptions.forEach((topic) => console.log(topic.name));
  const topic = topics[0];
  console.log(`Topic ${topic.name} created.`);

  // Creates a subscription on that new topic
  const subscription = subcriptions[0];

  // Receive callbacks for new messages on the subscription
  subscription.on("message", (message) => {
    console.log("Received message:", message.data.toString());
    axios
      .get("http://localhost:4000/api/slack/send")
      .then((res) => {
        console.log(res.status);
      })
      .catch((err) => console.error(err));
    message.ack();
  });

  subscription.on("error", (error) => {
    console.error("Received error:", error);
  });
}

listAllTopics().catch(console.error);

module.exports = router;
