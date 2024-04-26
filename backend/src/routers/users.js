import express from "express";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Auth from "../middleware/auth.js";
import validator from "validator";
const router = express.Router();

// sign up
router.post("/user/signup", async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password)
    return res.status(404).send({
      msg: "Please fill all the fields",
    });

  try {
    if (!validator.isEmail(email)) {
      res.status(400).send({ msg: "Please enter a valid email format!!" });
    }
    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      return res.status(400).send({ msg: "This email is already exist!!" });
    }
    const checkUsername = await User.findOne({ username });
    if (checkUsername) {
      return res.status(400).send({ msg: "This username is already exist!!" });
    }
    if (password.length < 7) {
      return res
        .status(401)
        .send({ msg: "Password must be at least 7 characters long" });
    }
    const user = new User(req.body);
    await user.save();

    const token = await user.generateAuthToken();

    // res.setHeader("Authorization", `Bearer ${token}`);
    res
      .status(200)
      .send({ msg: "Signed up Successfully", token: `Bearer ${token}` });
  } catch (e) {
    console.log(e);
    res.status(500).send({ msg: `error just occured : ${e}` });
  }
});

// signin
router.post("/user/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(404).send({ msg: "Please fill all the fields" });

  try {
    if (!validator.isEmail(email)) {
      res.status(400).send({ msg: "Please enter a valid email format!!" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ msg: "This email is not existing !!" });
    }
    if (user.password !== password) {
      return res.status(400).send({ msg: "The password is not correct!!" });
    }
    const token = await user.generateAuthToken();
    // res.setHeader("Authorization", `Bearer ${token}`);
    res
      .status(200)
      .send({ msg: "Signed in Successfully", token: `Bearer ${token}` });
  } catch (e) {
    console.log(e);
    res.status(500).send({ msg: `error just occured : ${e}` });
  }
});

//signout
router.post("/user/signout", Auth, async (req, res) => {
  try {
    req.user.token = "";
    await req.user.save();
    res.status(200).send({ msg: "signed out successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).send({ msg: `error just occured : ${e}` });
  }
});

// send feedback
router.post("/user/feedback", Auth, async (req, res) => {
  const feedback = req.body.feedback;
  if (!feedback) {
    return res.status(404).send({ msg: "Please fill the feedback field" });
  }

  try {
    const username = req.user.username;
    const receivedFeedback = { username, feedback };

    const admin = await Admin.findOne({ email: "admin@gmail.com" });
    admin.feedbacks.push(receivedFeedback);

    await admin.save();
    res.status(200).send({ msg: "Feedback sent successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).send({ msg: `error just occured : ${e}` });
  }
});

export default router;
