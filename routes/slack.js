const router = require("express").Router();
const withAuth = require("../middleware/auth");
const User = require("../models/user");
var rp = require("request-promise");
var request = require("request");
const axios = require("axios");
const keys = require("../config/keys");

router.get("/:id", withAuth, (req, res) => {
  // Check if we have previously stored a token.
  const authUrl = keys.slackAuthURI;
  res.redirect(authUrl);
});

router.get("/callback", withAuth, (req, res) => {
  const { code } = req.query;
  const url = `https://slack.com/api/oauth.v2.access?client_id=${keys.slackClientID}&client_secret=${keys.slackClientSecret}&redirect_uri=http://localhost:4000/slack/callback&code=${code}`;
  var options = {
    method: "GET",
    uri: url,
    json: true,
  };

  rp(options)
    .then(function (body) {
      //console.log(body);
      const userid = body.authed_user.id;
      const user_access_token = body.authed_user.access_token;
      const user_workspace_id = body.team.id;
      console.log("cool");
      console.log(req.email);
      const curr_aup_id = req.cookies.currentaup;
      User.findOne({ email: req.email }, async function (err, user) {
        if (err) {
          console.error(err);
          return res.status(500).json({
            error: "Internal error please try again",
          });
        } else if (!user) {
          return res.send("Please auth gmail first");
        } else {
          try {
            const getuser = await User.findOne({ email: req.email });
            if (!getuser) {
              return res.status(400).send("some issue");
            }
            getuser.socket_info.push({
              userid,
              user_access_token,
              user_workspace_id,
            });
            await getuser.save();
            console.log(getuser);

            res.json("yaay");
          } catch (err) {
            console.log(err);
            res.send("trrrr");
          }
        }
      });
    })
    .catch(function (err) {
      console.log(err);
      res.status(400);
      res.send("bad request");
    });
});

router.get("/getChannelList", async function (req, res) {
  // Working code for getting channel list
  var options = {
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer xoxp-1433850641255-1461220488801-1498346307424-a9ff0d87fe67b729c730fa146d6ba110`,
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

router.get("/callback/:id", (req, res) => {
  console.log(req.params);
  res.send("ok");
});

module.exports = router;
