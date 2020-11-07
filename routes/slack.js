const router = require("express").Router();
const withAuth = require("../middleware/auth");
const Aup = require("../models/aup");
var rp = require("request-promise");
var request = require("request");
const axios = require("axios");
const keys = require("../config/keys");
router.get("/", withAuth, (req, res) => {
  // Check if we have previously stored a token.
  const authUrl = keys.slackAuthURI;
  res.redirect(authUrl);
});

router.get("/callback", withAuth, (req, res) => {
  const { code } = req.query;
  console.log(code);
  const url = `https://slack.com/api/oauth.v2.access?client_id=${keys.slackClientID}&client_secret=${keys.slackClientSecret}&redirect_uri=http://localhost:4000/api/slack/callback&code=${code}`;
  var options = {
    method: "GET",
    uri: url,
    json: true,
  };

  rp(options)
    .then(async function (body) {
      //console.log(body);
      const userid = body.authed_user.id;
      const user_access_token = body.authed_user.access_token;
      const user_workspace_id = body.team.id;
      const _id = req.cookies.currentaup;
      console.log(_id);
      const getAup = await Aup.findById({ _id });
      if (!getAup) {
        return res.status(500).send("Not valid id");
      }
      getAup.slack_info.userid = userid;
      getAup.slack_info.user_access_token = user_access_token; // dekho scene yee h ki _id sahi h getAup par dabase se model bhi aa ja raha
      // 36 se 41 ki line ka code nai chal raha h vo chalana h optional tha toh ya toh uss waqt jab bana rahe obj dummy value daal dei
      getAup.slack_info.user_workspace_id = user_workspace_id;
      console.log(getAup);
      await getAup.save();
      console.log(getAup);
      res.status(200).send("yipes");
    })
    .catch(function (err) {
      console.log(err);
      res.status(400);
      res.send("bad request");
    });
});

router.get("/getChannelList", withAuth,async function (req, res) {
  // Working code for getting channel list
  console.log("yaayy");
  const _id = req.cookies.currentaup;
  console.log(_id);
  const getAup = await Aup.findById({ _id });
  if (!getAup) {
    return res.send(500);
  }
  const token = getAup.slack_info.user_access_token;
  var options = {
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    uri: "https://slack.com/api/conversations.list",
    method: "GET",
  };

  request(options, function (error, response) {
    if (error) {
      console.log(err);
    }
    if (!error && response.statusCode == 200) {
      //  res.status(200);
      console.log(response.body);
      res.send(response.body);
    }
  });
});

router.get("/send", async (req, res) => {
  const slackToken = keys.botToken;
  const url = "https://slack.com/api/chat.postMessage";
  const resp = await axios.post(
    url,
    {
      channel: "C01CRR0K72B",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              "From : jkdnjk@gmail.com \n Date : 19-10-2000 \n Time: 12:11:01",
          },
        },
        {
          type: "section",
          block_id: "section567",
          text: {
            type: "mrkdwn",
            text: "*CC to* \n : rishabh Shukla",
          },
        },
        {
          type: "section",
          block_id: "section789",
          fields: [
            {
              type: "mrkdwn",
              text: "*Subject* - Itti witty",
            },
          ],
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: "*Body* - Haunted hotel",
            },
          ],
        },
      ],
    },
    { headers: { authorization: `Bearer ${slackToken}` } }
  );

  console.log("Done", resp.data);
});

/*router.get("/callback/:id", (req, res) => {
  console.log(req.params);
  res.send("ok");
});
*/
module.exports = router;
