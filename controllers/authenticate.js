const jwt = require("jsonwebtoken");
const authRouter = require("express").Router();
const bcrypt = require("bcrypt");
const conn = require("../utils/dbConn");

// Check if user with given email exists
const userExists = async (email, next) => {
  try {
    const res = conn.usersDbMod.findOne({ "email": email });
    return res;
  }
  catch (exception) {
    next(exception);
  }
};


/**************** 
  LOGIN
*****************/
authRouter.post("/login", async (req, res) => {
  const body = req.body;

  // Make sure no fields are empty
  if (!body.email || !body.password) {
    return res.status(200).json({
      "success": false,
      "message": "All fields are required"
    });
  }

  // Check to see if user already exists
  const user = await userExists(body.email);
  const passswordCorrect = user === null
    ? false
    : await bcrypt.compare(body.password, user.password);

  if (!(user && passswordCorrect)) {
    return res.status(200).json({
      "success": false,
      "message": "Invalid email or password"
    });
  }

  // Create and sign token
  const userJWT = {
    email: user.email,
    id: user.id,
  };

  // TODO: User 'remember me' & Set-up an expiry time for tokens 
  const token = jwt.sign(userJWT, process.env.SECRET);

  // TODO: res.cookie.redirect
  res.cookie("token", token, {
    maxAge: (1000 * 60 * 60 * 24 * 7),
  });

  return res.send(
    {
      "success": true,
      "message": "",
      "displayName": user.displayName
    });
});


/**************** 
  SIGNUP
*****************/
authRouter.post("/signup", async (req, res, next) => {
  const body = req.body;

  // Make sure no fields are empty
  if (!body.displayName || !body.email || !body.password) {
    return res.status(200).json({
      "success": false,
      "message": "All fields are required",
    });
  }

  // Check to see if user already exists
  const emailExists = await userExists(body.email);
  if (emailExists) {
    return res.status(200).json({
      "success": false,
      "message": "User with this email already exists",
    });
  }

  // Hash the password
  const saltRound = 10;  // Hashing happends 2^10 times
  const passwordHash = await bcrypt.hash(body.password, saltRound);

  // Create a new user
  const newUser = new conn.usersDbMod({
    displayName: body.displayName,
    email: body.email,
    password: passwordHash,
  });


  try {

    // Create new user
    const newUserData = await newUser.save();

    // Create and sign token
    const userJWT = {
      email: newUserData.email,
      id: newUserData.id,
    };

    // TODO: User 'remember me' & Set-up an expiry time for tokens 
    const token = jwt.sign(userJWT, process.env.SECRET);

    res.cookie("token", token, {
      maxAge: (1000 * 60 * 60 * 24 * 7),
    });

    return res.send(
      {
        "success": true,
        "message": "",
        "token": token,
        "displayName": newUserData.displayName
      });
  }
  catch (error) {
    next(error);
  }
});

module.exports = authRouter;