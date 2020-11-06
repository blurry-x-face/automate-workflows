const express = require("express");
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const withAuth = require("./middleware/auth");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
// const { OAuth2Client } = require("google-auth-library");

const app = express();

app.use(express.json());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());

const port = 4000;
const TOKEN_PATH = "token.json";
const SCOPES = ["https://mail.google.com/"];
require("./db/mongoose");

const {
  client_secret,
  client_id,
  redirect_uris,
} = require("./config/keys").web;
const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

app.post("/api/user/register", (req, res) => {
  const { email, password } = req.body;
  const user = new User({ email, password });
  user.save(function (err, doc) {
    if (err) {
      res.status(500).send({ message: err });
    } else {
      const payload = { email };
      const token = jwt.sign(payload, "secret", {
        expiresIn: "1d",
      });
      res.cookie("token", token).json({ token, user });
    }
  });
});

app.post("/api/user/login", function (req, res) {
  const { email, password } = req.body;
  User.findOne({ email }, function (err, user) {
    if (err) {
      console.error(err);
      res.status(500).json({
        error: "Internal error please try again",
      });
    } else if (!user) {
      res.status(401).json({
        error: "Incorrect email or password",
      });
    } else {
      user.isCorrectPassword(password, function (err, same) {
        if (err) {
          res.status(500).json({
            error: "Internal error please try again",
          });
        } else if (!same) {
          res.status(401).json({
            error: "Incorrect email or password",
          });
        } else {
          // Issue token
          const payload = { email };
          const token = jwt.sign(payload, "secret", {
            expiresIn: "1d",
          });
          res.cookie("token", token).json({ token, user });
        }
      });
    }
  });
});

app.get("/api/checktoken", withAuth, function (req, res) {
  console.log(req.email);
  res.send(req.email);
});

app.get("/google", withAuth, (req, res) => {
  // Check if we have previously stored a token.
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

app.get("/google/callback", withAuth, (req, resp) => {
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

app.get("/list", withAuth, (req, resp) => {
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
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
