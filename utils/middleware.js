const logger = require("./logger");

// Ensure user is logged in 
const checkLoggedIn = (req, res, next) => {
  if (
    !(req.path === "/api/auth/login" || req.path === "/api/auth/signup")
  ) {
    const t = req.headers.authorization;
    if (!t)
      return res.status(400).json({ "error": "Not logged in" });

    /*
      NOTE: State of 'res.locals' will be hold until the req is fulfilled
    */

    // Extract token and place it in res.locals
    else res.locals.token = t.replace("Bearer ", "");
  }

  // If logged in, continue
  next();
};


/*
  NOTE: A custom error handeling middleware needs 4 arguments, (error, req, res, next).
  That is the defination of a error handeling middleware.
*/
const errorHandler = (error, req, res, next) => {

  // If token couldn't be verified,    
  if (error.name === "JsonWebTokenError")
    return res.status(401).json({ "error": "Invalid Token" });
  else if (error.name === "TokenExpiredError")
    return res.status(401).json({ "error": "Token Expired. Login-in again" });

  else {
    logger.error(error);
    return res.status(401).json({ "error": "Unknown error occured" });
  }

};

// At the end, route dosen't match any in controller
const unknownEndPoint = (req, res) => {
  return res.status(404).json({ "error": "404 not found" });
};

module.exports = { checkLoggedIn, errorHandler, unknownEndPoint };