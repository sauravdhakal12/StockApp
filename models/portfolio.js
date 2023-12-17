const mongoose = require("mongoose");

const portSchema = new mongoose.Schema({
  userId: mongoose.Schema.ObjectId,
  cmpSymbol: String,
  buyPrice: Number,
});

module.exports = portSchema;