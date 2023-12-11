const authRouter = require("express").Router();

// TODO: add package for rendering files.
// TODO: signup routes handles post method 

authRouter.get("/login", (req, res) => {
  return res.send("Login");
});

authRouter.get("/signup", (req, res) => {
  return res.send("SignUp");
});

module.exports = authRouter;