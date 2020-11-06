const router = require("express").Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");

router.post("/register", (req, res) => {
  const { email, password } = req.body;
  try {
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
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", function (req, res) {
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

module.exports = router;
