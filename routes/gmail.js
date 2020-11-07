const router = require("express").Router();
const { google } = require("googleapis");
const withAuth = require("../middleware/auth");
const User = require("../models/user");
const axios = require("axios");
const SCOPES = ["https://mail.google.com/"];
const keys = require("../config/keys");
const Aup = require("../models/aup");
const Enum = require("enum");
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
router.get("/callback", withAuth, async (req, resp) => {
  // const code = req.url.split("code")[1].split("&")[0].substr(1);
  const email = req.email;
  const { code } = req.query;

  oAuth2Client.getToken(code, async (err, token) => {
    try {
      if (err) {
        console.error("Error retrieving access token");
        return resp.send({ message: "nahi ho paya" });
      }
      const _id = req.cookies.currentaup;
      const getAup = await Aup.findById({ _id });
      if (!getAup) {
        return res.status(500).send("Not valid id");
      }
      getAup.gmailToken = token;
      oAuth2Client.setCredentials(token);
      const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
      gmail.users.getProfile({ userId: "me" }, async (err, res) => {
        getAup.gmailID = res.data.emailAddress;
        getAup.historyID = res.data.historyId;
        await getAup.save();
        resp.send(`
        <html>
        <body>
        <button onclick="window.close()"> Service Authenticated close window </button>
        </body>
        </html>`);
        console.log("G Auth Complete");
      });
    } catch (error) {
      console.log(error);
    }
  });
});

router.post(
  "/gmail/watch",
  withAuth,
  async (req, resp) => {
    const { email } = req;
    const { watch_param } = req.body;
    const _id = req.cookies.currentaup;
    const getAup = await Aup.findById({ _id });
    if (!getAup) {
      return res.status(500).send("Not valid id");
    }

    const token = getAup.gmailToken;
    oAuth2Client.setCredentials(token);
    getAup.gmail_trigger_content = watch_param;

    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
    // gmail.users.getProfile({ userId: "me" }, (err, res) => {
    //   if (err) {
    //     return resp.send("The API returned an error: " + err);
    //   }
    //   resp.send(res.data.emailAddress);
    // });
    let labelIds = [];
    if (watch_param == "NEW_MESSAGES") labelIds = ["UNREAD"];
    else if (watch_param == "STAR") labelIds = ["STARRED"];
    else if (watch_param == "FROM_ONLY") labelIds = ["UNREAD"];
    gmail.users.watch(
      {
        userId: "me",
        resource: {
          topicName: keys.topicName,
          labelIds,
        },
      },
      async function (err, response) {
        if (err) {
          console.log("setWatch", err);
          return;
        }
        getAup.historyID = response.data.historyId;
        await getAup.save();
        // console.log(response);
        resp.send(response);
      }
    );
  }
  // authUrl
);
router.post("/gmail/watch/stop", withAuth, async (req, res) => {
  const _id = req.cookies.currentaup;
  const getAup = await Aup.findById({ _id });
  const token = getAup.gmailToken;
  oAuth2Client.setCredentials(token);
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  gmail.users.stop(
    {
      userId: "me",
    },
    async function (err, response) {
      if (err) {
        console.log("stoppppppppppppp", err);
        return;
      }
      await getAup.save();
      res.send(response);
    }
  );
});
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
  subscription.on("message", async (message) => {
    console.log("Received message:", message.data.toString());
    console.log(JSON.parse(message.data));
    const gID = JSON.parse(message.data).emailAddress;
    const workflows = await Aup.find({ gmailID: gID });
    workflows.forEach(async (workflow) => {
      // workflow.forEach(async ())
      oAuth2Client.setCredentials(workflow.gmailToken);
      const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
      gmail.users.history.list(
        {
          userId: "me",
          historyTypes: new Enum(["LABEL_ADDED"]),
          labelId: "STARRED",
          startHistoryId: workflow.historyID,
        },
        async (err, response) => {
          if (err) console.log(err);
          console.log(response.data.history.length, response.data.historyId);
          response.data.history.map((hist) => {
            gmail.users.messages.get(
              { userId: "me", id: hist.messages[0].id },
              (err, rep) => {
                if (err) console.log(err);
                const sub = rep.data.payload.headers[23]
                console.log(sub, rep.data.payload.headers[18]);
              }
            );
          });
          workflow.historyID = response.data.historyId;
          await workflow.save();
          message.ack();
        }
      );
      console.log(workflow._id, workflow.historyID);
    });
  });

  subscription.on("error", (error) => {
    console.error("Received error:", error);
  });
}

listAllTopics().catch(console.error);

module.exports = router;
