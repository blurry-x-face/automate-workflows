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
  // console.log(code);
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
      // console.log(_id);
      const getAup = await Aup.findById({ _id });
      if (!getAup) {
        return res.status(500).send("Not valid id");
      }
      getAup.slack_info.userid = userid;
      getAup.slack_info.user_access_token = user_access_token; // dekho scene yee h ki _id sahi h getAup par dabase se model bhi aa ja raha
      // 36 se 41 ki line ka code nai chal raha h vo chalana h optional tha toh ya toh uss waqt jab bana rahe obj dummy value daal dei
      getAup.slack_info.user_workspace_id = user_workspace_id;
      // console.log(getAup);
      await getAup.save();
      // console.log(getAup);
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


function getCCstring(access_token,useremail_array){
 
  return new Promise((res, rej)=> {
    if(useremail_array.length == 0)res("...");
    cc_array = new Array();
  
    axios
        .get(`https://slack.com/api/users.list?token=${access_token}&pretty=1`,{
        })
        .then((rest) => {
          const arr = (rest.data.members);
          arr.map((v,i) => {
            if(v.profile.email != undefined){
              const obj = {
                userid : v.id,
                useremail : v.profile.email
              }
              cc_array.push(obj);
            }
          });
  
              const string_array = new Array()
  
              useremail_array.map((v,i) => {
  
                let match1 = cc_array.find( item => {
                  if(item.useremail === v){
                   var temp =' <@'+item.userid +'> ';
                   //console.log(temp);
                     string_array.push(temp);
                    return true;
                  }
                }) ; 
  
              });
  
  
              const final = string_array.join("");
              res(final)

        })
        .catch((err) => {
          rej("...");
        });
  })
  };
function getParentTs(access_token,channelid,parent_internalDate){
   console.log("step3");
  return new Promise((res, rej)=> {
    axios
        .get(`https://slack.com/api/conversations.history?token=${access_token}&channel=${channelid}&pretty=1`,{
        })
        .then((rest) => {
        console.log("step4");
        const arr = (rest.data.messages);
       // console.log(arr);
       var se = "..."
        const n = arr.length ;
        for(var i = n-1 ; i>=0 ;i--){
          if(arr[i].blocks != undefined){
            if(arr[i].blocks.length > 2){
              if(arr[i].blocks[2].type == "section"){
                             console.log(parent_internalDate);
                             console.log(arr[i].blocks[2].text.text);
                             if(parent_internalDate == arr[i].blocks[2].text.text) se = parent_internalDate;
                }
              }
            }
          }
        
     //   console.log(n);

      
         res(se);
         // console.log(v.blocks[0].elements); // v - mesgs v.blocks-array-body  blocks[1].type == section blocks[1].text.text == 160 47 89 37 2000
        })
        .catch((err) => {
          rej("...");
        });
  })
};

async function sendwithParent(_id,internalDate,fromy,subject,msgBody,channel_id,access_token,parent_internalDate,cc_array,threadId){
 console.log("step2");
  try{
    const vr = await getParentTs(access_token,channel_id,parent_internalDate);
    if(vr != "..."){
     // console.log("vr : "+vr);
      const cc_list = await getCCstring(access_token,cc_array);

      channel_id.map(async (v, i) => {
       try {
            //  const slackToken = access_token;
        const url = "https://slack.com/api/chat.postMessage";
        const resp = await axios.post(
          url,
          {
            "channel": v,
            "thread_ts" : vr,
             "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": `${threadId}`
                }
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": `*${fromy} has sent a mail.*\n*Subject* : ${subject} \n`
                }
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": `${internalDate}`
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
                    "text": `*CC:* ${cc_list}`
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
                    "text": `${msgBody}`
                  }
                ]
              }
            /*  {
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
          } */
            ]
          },
          { headers: { authorization: `Bearer ${access_token}` } }
        );
        console.log("Done", resp.data);
       } catch (err) {
         console.log(err);
         res.sendStatus(400);
       }
     });
    }
  }catch(err)  {
       console.log(err);
  }
};


router.post("/send",  async (req, res) => {
  // temporary user email array
  //internalDate,   parent_internalDate,
 // const temp_useremail = ['mansisharma78562@gmail.com','lit2019023@iiitl.ac.in' ];
  // get aupid
 console.log("yaay start")
  
  const _id = (req.body.aupId);
  const internalDate = req.body.internalDate;
  const fromy = req.body.From;
  const subject = req.body.subject;
  const msgBody = req.body.msgBody;
 const threadId = req.body.threadId
  //const _id = req.cookies.currentaup;
 // find aup in database
    const getAup = await Aup.findById({ _id });
    if (!getAup) {
      return res.sendtatus(500);
    }
  

  const channel_id = getAup.slack_info.user_channel_id;
  // get access token and find string to be send in cc string in message body
  const access_token = getAup.slack_info.user_access_token;
  //const cc_list = "....";

  if(req.body.parent_internalDate != ""){
    console.log("step1");
    return sendwithParent(_id,internalDate,fromy,subject,msgBody,channel_id,access_token,req.body.parent_internalDate,req.body.cc,threadId);
  }

  const cc_list = await getCCstring(access_token,req.body.cc);
 console.log("idh")
     channel_id.map(async (v, i) => {
      try {
      //  const slackToken = access_token;
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
                  "text": `${threadId}`
                }
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": `*${fromy} has sent a mail.*\n*Subject* : ${subject} \n`
                }
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": `${internalDate}`
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
                    "text": `*CC:* ${cc_list}`
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
                    "text": `${msgBody}`
                  }
                ]
              }
            /*  {
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
          } */
            ]
          },
          { headers: { authorization: `Bearer ${access_token}` } }
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
 // console.log(channel_id);
  //console.log("yaay");
  try {
    const id = req.cookies.currentaup;
   // console.log(id);
    const getAup = await Aup.findById({ _id  : id});
    if (!getAup) {
      return res.send(500);
    }
    console.log(getAup);
    getAup.slack_info.user_channel_id = channel_id;
    await getAup.save();
    console.log(getAup);
    return res.status(200);
  } catch (err) {
    return res.status(500);
  }
});


router.post("/sendgmailemail",(req,res) => {
  console.log("aa gaye idhar");
  var str = (req.body.data.text);
  console.log(req.body.data);
  console.log(str);
  var threadId = "" ;
  var email_to = "";
  var text = "";
  var n = str.length;
  console.log(n);
  var j=0;count = 0;
  console.log("hb");
  while( j < n){
  if(count <= 1 && str[j] == " "){
    count = count +1;
    j++;
  }
  if(count == 0){
    threadId = threadId + str[j];
  }else if(count == 1){
    email_to = email_to + str[j];
  }else{
    text = text + str[j];
  }
  j++;
  }
  console.log(threadId);
  console.log(email_to);
  console.log(text);
  axios.post(".api/google/gmail/send",{
    threadId,
    email_from : email_to,
    text
  }).then((res) => {
    console.log("success");
  }).catch ((err) => {
    console.log(err);
  })
});

module.exports = router;
