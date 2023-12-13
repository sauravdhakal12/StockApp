const logger = require("../../utils/logger");

const userExists = async (email) => {

  // Check if user with given email already exists
  try {
    const res = await userSchema.findOne({ "email": email })
    return (!(res === undefined || res === null));
  }
  catch (exception) {
    logger.error(exception);
    return true;
  }
}

module.exports = userExists;