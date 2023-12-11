const express = require("express");
const app = express();

// Import router objects
const stockRouter = require("./controllers/stock");
const authRouter = require("./controllers/authenticate");

// app.use for routes, works as middleware
app.use("/", stockRouter);  // Home Page
app.use("/api/auth", authRouter); // Login, SignUp

// Export app for index.js file
module.exports = app;