const mongoose = require("mongoose");

// User will have a display name, email and password
const userSchema = new mongoose.Schema({

  displayName: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 16,
  },

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 8,
  },
});

// Remove id, version and password from returned object
userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password;
  }
});

module.exports = userSchema;