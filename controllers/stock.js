/* 
  INFO:
  - Event Handelers on routers are commonly referred to as CONTROLLERS.
  - A router object can be created for each seperate route and handeled seperately on individual file.
*/

const jwt = require("jsonwebtoken");

// A router object to handle routes on Home Page.
const stockRouter = require("express").Router();

// Import schema for Portfolio and connection object for both DB 
const conn = require("../utils/dbConn");


// TODO: Implement decorator
stockRouter.get("/", (req, res, next) => {
  const token = res.locals.token;

  try {

    // Verify and decode happens at once
    const userInfo = jwt.verify(token, process.env.SECRET);

    // DEMO: TO TEST
    const portDbModel = conn.portDbConn.model(userInfo.id, conn.portSchema);
    portDbModel.find({}).then((d) => {
      return res.json(d ?? {});
    });

  }

  // Cannot verify or DB error
  catch (exception) {
    next(exception);
  }
});


// Add new stock to portfolio
stockRouter.post("/", async (req, res, next) => {
  const token = res.locals.token;

  try {

    // Verify and Decode token
    const userInfo = jwt.verify(token, process.env.SECRET);

    const body = req.body;

    // Create model out of SCHEMA
    const portDbModel = conn.portDbConn.model(userInfo.id, conn.portSchema);
    const stockData = new portDbModel({ ...body, "userId": userInfo.id, "timestamp": Date.now() });

    // Add new stock to portfolio
    await stockData.save();

    return res.status(200).json({ "success": "true" });
  }

  // Cannot verify or DB error 
  catch (exception) {
    next(exception);
  }

});

module.exports = stockRouter;