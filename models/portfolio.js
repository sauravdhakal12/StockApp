const mongoose = require("mongoose");

// Todo: Add bought date 
const portSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },

  cmpSymbol: {
    type: String,
    required: true,
  },

  buyPrice: {
    type: Number,
    required: true,
    min: [0, "Enter positive number for buy price"],
  },

  quantity: {
    type: Number,
    required: true,
    min: [0, "Enter positive number for quantity"],
  },

  // Added date
  timestamp: {
    type: Number,
    required: true,
  },
});

portSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    //Todo: similarly later
    returnedObject.date = Date(returnedObject.timestamp).substring(4, 15);
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = portSchema;