const router = require("express").Router();
const { google } = require("googleapis");
const withAuth = require("../middleware/auth");
const User = require("../models/user");
const axios = require("axios");
const SCOPES = [
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/drive",
];
const keys = require("../config/keys");
const Aup = require("../models/aup");
const Enum = require("enum");
var base64 = require("js-base64").Base64;

// const { base64encode, base64decode } = require("nodejs-base64");
// console.log(base64decode("PGRpdiBkaXI9ImF1dG8iPlRlc3Q8L2Rpdj4NCg=="));
// const simpleParser = require("mailparser").simpleParser;

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
      console.log(token);
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
    console.log(labelIds);
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

function makeBody(
  to,
  from,
  subject,
  message,
  threadId = "175a6f0070c76cc1",
  messageID
) {
  var str = [
    'Content-Type: text/plain; charset="UTF-8"\n',
    "MIME-Version: 1.0\n",
    "Content-Transfer-Encoding: 7bit\n",
    "to: ",
    to,
    "\n",
    "from: ",
    from,
    "\n",
    `In-Reply-To: ${messageID}`,
    "\n",
    `References: ${messageID}`,
    "\n",
    "subject: ",
    subject,
    "\n\n",
    "\n\n",
    message,
  ].join("");

  var encodedMail = new Buffer(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return encodedMail;
}
router.get("/gmail/send", async (req, res) => {
  const token = {
    access_token:
      "ya29.A0AfH6SMCgEPjbZEs0xm55cAB-U2MBcyBrA1Xndb2Z4hieqxpaGnbFL5RdBrwFsVISUz6ZqNqamMpzzNWLyHkkNiSMaxRx5pktGHmfjgT2g6_qqI-U6NCjp8XZvCafx0ZVHojpe8a5skm20DE1SPDBb7XpDHJtwKl6O2e9G7XGVfg",
    refresh_token:
      "1//0gmENeQltHvjXCgYIARAAGBASNwF-L9IrKkNa4ctEP4Uk7dxUpPZ58jW7JMkDU_wZy9P2LfeOAwUXYHY7vh82o1zWyM4vyn_U0ic",
    scope: "https://mail.google.com/ https://www.googleapis.com/auth/drive",
    token_type: "Bearer",
    expiry_date: 1604785838707,
  };
  oAuth2Client.setCredentials(token);
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  gmail.users.messages.get(
    { userId: "me", id: "175a6f0070c76cc1" },
    (err, respo) => {
      const headers = {};
      respo.data.payload.headers.map(
        (item, i) => (headers[item.name] = item.value)
      );
      console.log(headers.Subject);
      var raw = makeBody(
        headers.To,
        headers.From,
        headers.Subject,
        "PLMS SEMD",
        respo.threadId,
        headers["Message-ID"]
      );
      gmail.users.messages.send(
        {
          userId: "me",
          resource: {
            raw: raw,
          },
        },
        function (err, response) {
          res.send(err || response);
        }
      );
    }
  );
});
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

// router.get("/drive/upload", async (req, res) => {
//   // const { gmailToken } = req.body;
//   const gmailToken = {
//     access_token:
//       "ya29.A0AfH6SMCgEPjbZEs0xm55cAB-U2MBcyBrA1Xndb2Z4hieqxpaGnbFL5RdBrwFsVISUz6ZqNqamMpzzNWLyHkkNiSMaxRx5pktGHmfjgT2g6_qqI-U6NCjp8XZvCafx0ZVHojpe8a5skm20DE1SPDBb7XpDHJtwKl6O2e9G7XGVfg",
//     refresh_token:
//       "1//0gmENeQltHvjXCgYIARAAGBASNwF-L9IrKkNa4ctEP4Uk7dxUpPZ58jW7JMkDU_wZy9P2LfeOAwUXYHY7vh82o1zWyM4vyn_U0ic",
//     scope: "https://mail.google.com/ https://www.googleapis.com/auth/drive",
//     token_type: "Bearer",
//     expiry_date: 1604785838707,
//   };
//   // oAuth2Client.setCredentials(gmailToken);
//   const drive = google.drive({ version: "v3", auth: gmailToken });
//   var fileMetadata = {
//     name: "Invoice xyz",
//     mimeType: "application/pdf",
//   };
//   var media = {
//     mimeType: "application/pdf",
//     body: require("./data").data,
//   };
//   drive.files.create(
//     {
//       resource: fileMetadata,
//       media: media,
//       fields: "id",
//     },
//     function (err, file) {
//       if (err) {
//         // Handle error
//         console.error(err);
//       } else {
//         console.log("File Id:", file.id);
//       }
//     }
//   );
// });

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
  //  console.log(`Topic ${topic.name} created.`);

  // Creates a subscription on that new topic
  const subscription = subcriptions[0];

  // Receive callbacks for new messages on the subscription
  subscription.on("message", async (message) => {
    try {
      message.ack();
      console.log("Received message:", message.data.toString());
      // console.log(JSON.parse(message.data));
      const gID = JSON.parse(message.data).emailAddress;
      const workflows = await Aup.find({ gmailID: gID });
      workflows.forEach(async (workflow) => {
        // workflow.forEach(async ())
        oAuth2Client.setCredentials(workflow.gmailToken);
        const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
        if (workflow.gmail_trigger_content === "STAR")
          gmail.users.history.list(
            {
              userId: "me",
              historyTypes: new Enum(["LABEL_ADDED"]),
              labelId: "STARRED",
              startHistoryId: workflow.historyID,
            },
            async (err, response) => {
              if (err || response.status !== 200) {
                console.log(err);
                return;
              }
              console.log("STAR KE ANDAR");
              if (
                response.data.history &&
                workflow.historyID < response.data.historyId
              )
                response.data.history.map((hist) => {
                  gmail.users.messages.get(
                    { userId: "me", id: hist.messages[0].id },
                    (err, rep) => {
                      if (err) console.log(err);
                      console.log(workflow.historyID);
                      const body = rep.data.payload.parts[0].body.data; // rep.threadId
                      var parent_internalDate = "";
                      const internalDate = rep.data.internalDate;
                      gmail.users.threads.get(
                        { userId: "me", id: rep.data.threadId },
                        (err, res) => {
                          //     console.log("ooo");
                          if (res.data.messages.length > 1) {
                            parent_internalDate =
                              res.data.messages[0].internalDate;
                          }
                          console.log(parent_internalDate);
                          var htmlBody = "";
                          if (body) {
                            htmlBody = base64.decode(
                              body.replace(/-/g, "+").replace(/_/g, "/")
                            );
                            //        console.log(htmlBody);
                          }
                          const headers = {};
                          rep.data.payload.headers.map(
                            (item, i) => (headers[item.name] = item.value)
                          );
                          headers.From = headers.From.match(/<.*>/)[0]
                            .replace(/</, "")
                            .replace(/>/, "");
                          let cc = [];
                          //   console.log(headers.Cc);
                          if (headers.Cc)
                            cc = headers.Cc.match(
                              /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
                            );
                          axios
                            .post("http://localhost:4000/api/slack/send", {
                              internalDate,
                              parent_internalDate,
                              aupId: workflow._id,
                              From: headers.From,
                              subject: headers.Subject,
                              cc,
                              msgBody: htmlBody,
                            })
                            .then((res) => {
                              if (res.status == 200)
                                console.log("message sent succesfully");
                            })
                            .catch((err) => {
                              // console.log(err);
                            });
                        }
                      );
                    }
                  );
                });
              workflow.historyID = response.data.historyId;
              await workflow.save();
            }
          );
        if (workflow.gmail_trigger_content === "NEW_MESSAGES")
          gmail.users.history.list(
            {
              userId: "me",
              historyTypes: new Enum(["MESSAGE_ADDED"]),
              // labelId: "STARRED",
              startHistoryId: workflow.historyID,
            },
            async (err, response) => {
              if (err || response.status !== 200) {
                console.log(err);
                return;
              }
              // console.log(response);
              // console.log( response.data.historyId);

              if (
                response.data.history &&
                workflow.historyID < response.data.historyId
              )
                response.data.history.map((hist, index) => {
                  if (index == 0)
                    gmail.users.messages.get(
                      { userId: "me", id: hist.messages[0].id },
                      (err, rep) => {
                        // if (hist.messages[0].historyId >= workflow.historyID) {
                        if (err) console.log(err);
                        //  if (!rep.data.labelIds.includes("UNREAD")) return;
                        // console.log(rep.data.labelIds.includes("UNREAD"), index);
                        const body = rep.data.payload.parts[0].body.data; // rep.threadId
                        var parent_internalDate = "";
                        const internalDate = rep.data.internalDate;
                        gmail.users.threads.get(
                          { userId: "me", id: rep.data.threadId },
                          (err, res) => {
                            //     console.log("ooo");
                            if (res.data.messages.length > 1) {
                              parent_internalDate =
                                res.data.messages[0].internalDate;
                            }
                            console.log(parent_internalDate);
                            var htmlBody = "";
                            if (body) {
                              htmlBody = base64.decode(
                                body.replace(/-/g, "+").replace(/_/g, "/")
                              );
                              //        console.log(htmlBody);
                            }
                            const headers = {};
                            rep.data.payload.headers.map(
                              (item, i) => (headers[item.name] = item.value)
                            );
                            headers.From = headers.From.match(/<.*>/)[0]
                              .replace(/</, "")
                              .replace(/>/, "");
                            let cc = [];
                            //   console.log(headers.Cc);
                            if (headers.Cc)
                              cc = headers.Cc.match(
                                /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
                              );
                            axios
                              .post("http://localhost:4000/api/slack/send", {
                                threadId : rep.data.threadId,
                                internalDate,
                                parent_internalDate,
                                aupId: workflow._id,
                                From: headers.From,
                                subject: headers.Subject,
                                cc,
                                msgBody: htmlBody,
                              })
                              .then((res) => {
                                if (res.status == 200)
                                  console.log("message sent succesfully");
                              })
                              .catch((err) => {
                                // console.log(err);
                              });
                          }
                        );
                        // }
                      }
                    );
                });
              workflow.historyID = response.data.historyId;
              await workflow.save();
            }
          );

        console.log(workflow._id, workflow.historyID);
      });
    } catch (error) {
      console.log(error.message);
    }
  });

  subscription.on("error", (error) => {
    console.error("Received error:", error);
  });
}

listAllTopics().catch(console.error);

module.exports = router;
