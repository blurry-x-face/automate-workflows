const router = require("express").Router();
const withAuth = require("../middleware/auth");
const User = require("../models/user");
const axios = require("axios");
const keys = require("../config/keys");
const AUP = require("../models/aup");

router.post("/create", withAuth, (req, res) => {
  console.log("inn");
  console.log(req);
  const aupName = req.body.aup;
  const createdBy = req.email;
  const aup = new AUP({ aupName, createdBy });
  aup.save(function (err, doc) {
    if (err) {
      //   console.log(err);
      res.status(500).send({ message: err });
    } else {
      res.send({ id: doc._id });
    }
  });
});

router.get("/get/:id", withAuth, async (req, res) => {
  const id = req.params.id;
  const aup = await AUP.findById(id);
  //   console.log(aup);
  res.send(aup);
});

router.get("/currentaup/:id", withAuth, async (req, res) => {
  console.log("INN");
  const id = req.params.id;
  try {
    const aup = await AUP.findById(id);
    res.cookie("currentaup", id).send(id);
  } catch (error) {
    res.cookie("currentaup", "").send(500);
  }
});

module.exports = router;
