/* 
  INFO:
  - Event Handelers on routers are commonly referred to as CONTROLLERS.
  - A router object can be created for each seperate route and handeled seperately on individual file.
*/

const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

// A router object to handle routes on Home Page.
const stockRouter = require("express").Router()

// Import schema for Portfolio and connection object for both DB 
const conn = require("../utils/dbConn");

const userLoggedIn = (req) => {
  const auth = req.headers.authorization;
  return auth ? auth.replace("Bearer ", "") : null;
}

// TODO: Implement decorator
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

    // Decode the payload
    const userInfo = jwt.decode(user);

    // DEMO: TO TEST
    const portDbModel = conn.portDbConn.model(userInfo.id, conn.portSchema);
    portDbModel.find({}).then((d) => {
      return res.json(d ?? {});
    })

  }

  // If token couldn't be verified,  
  // "JsonWebTokenError" exception
  // "TokenExpiredError" exception
  catch (exception) {
    logger.error(exception.name);

    if (exception.name === "JsonWebTokenError")
      return res.status(401).json({ "error": "Invalid Token" });
    else if (exception.name === "TokenExpiredError")
      return res.status(401).json({ "error": "Token Expired. Login-in again" });
  }
});


// Add new stock to portfolio
stockRouter.post("/", async (req, res) => {
  const user = userLoggedIn(req);

  // Check to see if user is logged in or not
  if (!user) {
    return res.status(401).json({ "error": "User is not logged in" });
  }

  try {
    jwt.verify(user, process.env.SECRET);

    const body = req.body;
    const userInfo = jwt.decode(user);

    const portDbModel = conn.portDbConn.model(userInfo.id, conn.portSchema);
    const stockData = new portDbModel({ ...body, "userId": userInfo.id, "timestamp": Date.now() })

    await stockData.save();
    return res.status(200).json({ "success": "true" });
  }

  catch (exception) {
    logger.error(exception.message);
    return res.status(400).json({ "success": "false", "message": exception.message });
  }

})

module.exports = stockRouter;