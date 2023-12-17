const mongoose = require("mongoose");
const config = require("./config");

// Import userSchema 
const userSchema = require("../models/users");

// Create seperate connection object for Databases
const usersDbConn = mongoose.createConnection(config.USER_URI);
const portDbConn = mongoose.createConnection(config.PORTFOLIO_URI);

// Create model out of userSchema
usersDbConn.model('User', userSchema);

module.exports = {
  usersDbConn,
  portDbConn,
};