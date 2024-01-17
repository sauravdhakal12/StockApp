const NepseApi = require("../api/nepse");

// Create a object out of request
const nepseApi = new NepseApi();
nepseApi.initialize();
module.exports = nepseApi;