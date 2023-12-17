/* 
  INFO:
  - Event Handelers on routers are commonly referred to as CONTROLLERS.
  - A router object can be created for each seperate route and handeled seperately on individual file.
*/

const jwt = require("jsonwebtoken");

// A router object to handle routes on Home Page.
const stockRouter = require("express").Router()

// Import schema for Portfolio and connection object for both DB 
const portSchema = require("../models/portfolio");
const conn = require("../utils/dbConn");

const userLoggedIn = (req) => {
  const auth = req.headers.authorization;
  return auth ? auth.replace("Bearer ", "") : null;
}

stockRouter.get("/", (req, res) => {
  const user = userLoggedIn(req);

  // Check to see if user is logged in or not
  if (!user) {
    return res.status(401).json({ "error": "User is not logged in" });
  }

  try {

    // Try to verify jwt token
    const verify = jwt.verify(user, process.env.SECRET);

    // Never reaches here  
    if (!(verify)) {
      return res.status(401).json({ "error": "Tampering with token detected" });
    }

    // Decode the payload and return
    const userInfo = jwt.decode(user);

    // DEMO: TO TEST
    const portfolioModel = conn.portDbConn.model(userInfo.id, portSchema);
    portfolioModel.find({}).then((res) => {
      console.log(res);
    })

    return res.send(`Hello ${userInfo.email}`);
  }

  // If token couldn't be verified,  
  // "JsonWebTokenError" exception
  // "TokenExpiredError" exception
  catch (exception) {
    console.log(exception.name);

    if (exception.name === "JsonWebTokenError")
      return res.status(401).json({ "error": "Invalid Token" });
    else if (exception.name === "TokenExpiredError")
      return res.status(401).json({ "error": "Token Expired. Login-in again" });
  }
})

module.exports = stockRouter;