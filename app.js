const express = require("express");
const app = express();
const config = require("./utils/config");
const mongoose = require("mongoose");

// Import router objects
const stockRouter = require("./controllers/stock");
const authRouter = require("./controllers/authenticate");

// Connect to DB
mongoose.connect(config.MONGODB_URI)
  .then((res) => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

// app.use for routes, works as middleware
app.use("/", stockRouter);  // Home Page
app.use("/api/auth", authRouter); // Login, SignUp

// Export app for index.js file
module.exports = app;