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
    json: true
  };

  rp(options)
    .then(async function(body) {
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
    .catch(function(err) {
      console.log(err);
      res.status(400);
      res.send("bad request");
    });
});

router.get("/getChannelList", withAuth, async function(req, res) {
  // Working code for getting channel list
  //console.log("yaayy");
  const _id = req.cookies.currentaup;
  //console.log(_id);
  const getAup = await Aup.findById({ _id });
  if (!getAup) {
    return res.send(500);
  }
  const token = getAup.slack_info.user_access_token;
  var options = {
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`
    },
    uri: "https://slack.com/api/conversations.list",
    method: "GET"
  };

  request(options, function(error, response) {
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




router.get("/getcc", withAuth, (req, res) => {
  const { code } = req.query;
  console.log(code);
  const url = `https://slack.com/api/oauth.v2.access?client_id=${keys.slackClientID}&client_secret=${keys.slackClientSecret}&redirect_uri=http://localhost:4000/api/slack/callback&code=${code}`;
  var options = {
    method: "GET",
    uri: url,
    json: true
  };

  rp(options)
    .then(async function(body) {
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
    .catch(function(err) {
      console.log(err);
      res.status(400);
      res.send("bad request");
    });
});











router.get("/send", withAuth, async (req, res) => {
  console.log("yaay");
  const _id = req.cookies.currentaup;
  console.log(_id);
    const getAup = await Aup.findById({ _id });
    if (!getAup) {
      return res.sendtatus(500);
    }
  console.log(getAup);
  const channel_id = getAup.slack_info.user_channel_id;
  const access_token = getAup.slack_info.user_access_token;
  console.log(access_token);
  axios
      .get(`https://slack.com/api/users.list?token=${access_token}&pretty=1`,{
      })
      .then((rest) => {
        console.log(rest.data.members);
      })
      .catch((err) => {
        console.log(err);
      });
    console.log(channel_id);
    channel_id.map(async (v, i) => {
      try {
        const slackToken = access_token;
        const url = "https://slack.com/api/chat.postMessage";
        const resp = await axios.post(
          url,
          {
            channel: v,
            blocks: [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*XYZ has sent a mail.*\n*Subject* : Lorem Ipsum Donor \n *Sent at*: 11:07 P.M."
                }
              },
              {
                "type": "divider"
              },
              {
                "type": "context",
                "elements": [
                  {
                    "type": "mrkdwn",
                    "text": "*CC:* @XYZ,@ABC"
                  }
                ]
              },
              {
                "type": "divider"
              },
              {
                "type": "context",
                "elements": [
                  {
                    "type": "mrkdwn",
                    "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\nRegards \n XYZ"
                  }
                ]
              },
              {
                "type": "divider"
              },
            {
                "type": "image",
                "title": {
                  "type": "plain_text",
                  "text": "Attachment Name",
                  "emoji": true
                },
                "image_url": "https://assets3.thrillist.com/v1/image/1682388/size/tl-horizontal_main.jpg",
                "alt_text": "marg"
          } 
            ]
          },
          { headers: { authorization: `Bearer ${slackToken}` } }
        );
        console.log("Done", resp.data);
      } catch (err) {
        console.log(err);
        res.sendStatus(400);
      }
    });
});

router.post("/getchannelid", withAuth, async (req, res) => {
  const channel_id = req.body._id;
  //console.log("yaay");
  console.log(channel_id);
  try {
    const _id = req.cookies.currentaup;
    const getAup = await Aup.findById({ _id });
    if (!getAup) {
      return res.send(500);
    }
    getAup.slack_info.user_channel_id = channel_id;
    await getAup.save();
    res.send(200);
  } catch (err) {
    res.send(500);
  }
});




module.exports = router;
