const authRouter = require("express").Router();
const userSchema = require("../models/users");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");
const userExists = require("./helper/authenticate")

// TODO: add package for rendering files.
// TODO: signup routes handles post method 

authRouter.get("/login", (req, res) => {
  return res.send("Login");
});


authRouter.post("/signup", async (req, res) => {
  const body = req.body;

  // Make sure no fields are empty
  if (!body.displayName || !body.email || !body.password) {
    return res.status(400).json({ "error": "All fields are required" });
  }

  // Check to see if user already exists
  const emailExists = await userExists(body.email);
  if (emailExists) {
    return res.status(400).json({ "error": "User with this email already exists" });
  }

  // Hash the password
  const saltRound = 10;  // Hashing happends 2^10 times
  const passwordHash = await bcrypt.hash(body.password, saltRound);

  // Else, create a new user
  const newUser = new userSchema({
    displayName: body.displayName,
    email: body.email,
    password: passwordHash,
  });

  // Create new user
  newUser.save()
    .then((savedUser) => {
      return res.json(savedUser);
    })
    .catch((err) => {
      logger.error(err);
      return res.status(400).json({ "error": "Something went wrong. Try again later" });
    })
});

module.exports = authRouter;