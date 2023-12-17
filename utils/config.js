require("dotenv").config();

const PORT = process.env.PORT;
const USER_URI = process.env.USER_URI;
const PORTFOLIO_URI = process.env.PORTFOLIO_URI;

module.exports = {
  USER_URI,
  PORT,
  PORTFOLIO_URI,
};