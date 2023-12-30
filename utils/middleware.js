const logger = require("./logger");

// Ensure user is logged in 
const checkLoggedIn = (req, res, next) => {
  if (
    !(req.path === "/api/auth/login" ||
      req.path === "/api/auth/signup"
    )
  ) {
    const t = req.headers.authorization;
    if (!t)

      // return res.redirect(302, "/api/auth/login");
      return res.status(200).json({
        "success": false,
        "message": "User not logged in",
      });

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
    return res.status(200).json({
      "success": false,
      "message": "Invalid Token"
    });

  else if (error.name === "TokenExpiredError")
    return res.status(401).json({
      "success": false,
      "message": "Token Expired. Login-in again"
    });

  else {
    logger.error(error);
    return res.status(401).json({
      "success": false,
      "message": "Unknown error occured"
    });
  }

};

// At the end, route dosen't match any in controller
const unknownEndPoint = (req, res) => {
  logger.info(req.path);
  return res.status(404).send("404 not found");
};

module.exports = { checkLoggedIn, errorHandler, unknownEndPoint };