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
// const getCompanyInfo = require("../api/nepse");

const nepseApi = require("../utils/nepse");


/**************** 
  Return a Users Portfolio
*****************/
stockRouter.get("/", async (req, res, next) => {

  const token = res.locals.token;

  try {

    // Verify and decode happens at once
    const userInfo = jwt.verify(token, process.env.SECRET);

    // Create a seperate db connection for each user
    const portDbModel = conn.portDbConn.model(userInfo.id, conn.portSchema);

    const userData = {};
    // Find portfolio data for each user
    userData["portfolio"] = await portDbModel.find({});

    // Make a list of stock symbols already fetched
    const fetchedSymbols = new Set();

    // Counter, counts the number or stocks fetched.
    let c = 0;

    let netInvestment = 0;
    let netPorL = 0;
    let totalStocks = 0;

    // Start fetching all required symbol's datas
    while (c !== userData.portfolio.length) {

      // Socket error occurs after 7+ simultaneous request
      try {
        let stockData;

        /*
          When a symbol is fetched, LTP is saved within the response object.
          This way, no subsequent request to the API for same symbol needs to be made.
          Same LTP cam be used.
          TODO: Implement a Redis server as a tmp cache
        */
        if (fetchedSymbols.has(userData.portfolio[c].cmpSymbol)) {

          // Extract LTP from already fetched symbol
          userData.portfolio[c]._doc.ltp = userData.portfolio.find((stock) =>
            stock.cmpSymbol === userData.portfolio[c].cmpSymbol
          )._doc.ltp;
        }

        // If symbol not already fetched, do it.
        else {

          // Fetch and save LTP in the response object.
          // Also update fetchedSymbols SET.
          stockData = await nepseApi.getCompanyInfo(userData.portfolio[c].cmpSymbol);
          userData.portfolio[c]._doc.ltp = stockData.securityDailyTradeDto.lastTradedPrice;
          fetchedSymbols.add(userData.portfolio[c].cmpSymbol);
        }

        // Calculate Net Investment and Total Stocks
        netInvestment = netInvestment + (userData.portfolio[c].buyPrice * userData.portfolio[c].quantity);
        totalStocks = totalStocks + (userData.portfolio[c].quantity);

        // Calculate Profit/Loss and save it
        userData.portfolio[c]._doc.porl = (userData.portfolio[c]._doc.ltp - userData.portfolio[c].buyPrice);
        console.log(userData.portfolio[c]._doc.porl * userData.portfolio[c].quantity);
        netPorL = netPorL + (userData.portfolio[c]._doc.porl * userData.portfolio[c].quantity);


        // Update the counter
        c++;
      }


      // If socket error encountered, sleep for 300ms.
      catch (error) {
        const n = Date.now();
        let i = 0;
        while (Date.now() < (n + 300)) {
          i = i + 0;
        }
      }

      /*
      NOTE: 
        d._doc contains value from documents
        Other metadata are also there in d
      */

    }

    // Save other info relevent to this request 
    userData.marketOpen = nepseApi.open.isOpen === "OPEN";
    userData.summary = { netInvestment, netPorL, totalStocks };
    userData.email = userInfo.email;

    return res.json(userData);
  }

  // Cannot verify or DB error
  catch (exception) {
    next(exception);
  }
});


/**************** 
  Add a Stock into Users Portfolio
*****************/
stockRouter.post("/", async (req, res, next) => {

  const token = res.locals.token;

  try {

    // Verify and Decode token
    const userInfo = jwt.verify(token, process.env.SECRET);

    // Convert symbol into uppercase
    const body = req.body;
    body.cmpSymbol = (body.cmpSymbol).toUpperCase();

    // Check to make sure the symbol is valid
    if (!nepseApi.idFromSymbol(body.cmpSymbol)) {
      return res.json({ "success": false, message: "Invalid symbol" });
    }

    // Create model out of SCHEMA
    const portDbModel = conn.portDbConn.model(userInfo.id, conn.portSchema);
    const stockData = new portDbModel({ ...body, "userId": userInfo.id, "timestamp": Date.now() });

    // Add new stock to portfolio
    await stockData.save();

    // Return response
    return res.status(200).json({ "success": true });
  }

  // Cannot verify or DB error 
  catch (exception) {
    next(exception);
  }

});


/**************** 
  Remove a Stock from Users Portfolio
*****************/
stockRouter.delete("/:id", async (req, res, next) => {

  // Get the stocks id from parameter
  const id = req.params.id;
  const token = res.locals.token;

  try {

    // Verify and Decode token
    const userInfo = jwt.verify(token, process.env.SECRET);

    // Create model out of SCHEMA
    const portDbModel = conn.portDbConn.model(userInfo.id, conn.portSchema);

    // Try to delete symbol
    const r = await portDbModel.findByIdAndDelete(id);

    // Return response
    if (r) {
      return res.status(200).json({ "success": true, "message": "Delete success" });
    }
    else {
      return res.status(200).json({ "success": false, "message": "Requested symbol dosen't exist" });
    }

  }

  // Cannot verify or DB error
  catch (exception) {
    next(exception);
  }
});

module.exports = stockRouter;