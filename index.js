const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const withAuth = require("./middleware/auth");
const app = express();
var qs = require('querystring')
const bp = require('body-parser');
app.use(express.json());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
const axios = require("axios");

const port = 4000;
require("./db/mongoose");
app.use("/api/user", require("./routes/user"));
app.use("/api/google", require("./routes/gmail"));
app.use("/api/slack", require("./routes/slack"));
app.use("/api/aup", require("./routes/aup"));
app.use(bp.urlencoded({ extended: true }));


app.get("/api/checktoken", withAuth, function (req, res) {
  console.log(req.email);
  res.send(req.email);
});


app.post("/", (req,res)=>{
   const data = (req.body);
 //  console.log(data);
   axios.post("http://localhost:4000/api/slack/sendgmailemail",{
      data
   }).then((re)=>{
     
     console.log("sent");
   }). catch ((err) => {
     console.log(err);
   });
   res.send(200);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
