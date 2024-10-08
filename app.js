const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const customCors = require("./utils/cors");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Import router objects
const stockRouter = require("./controllers/stock");
const authRouter = require("./controllers/authenticate");

const { errorHandler, checkLoggedIn, unknownEndPoint } = require("./utils/middleware");

app.use(customCors({
  withCredentials: true,
  origin: "https://stock-app-frontend-pi.vercel.app",
  maxAge: 86400
}));
app.use(cookieParser());
app.use(express.json());


// app.use for routes, works as middleware
app.use(checkLoggedIn);
app.use("/api/auth", authRouter); // Login, SignUp
app.use("/", stockRouter);  // Home Page

app.use(unknownEndPoint);
app.use(errorHandler);

// Export app for index.js file
module.exports = app;
