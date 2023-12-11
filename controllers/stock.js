/* 
  INFO:
  - Event Handelers on routers are commonly referred to as CONTROLLERS.
  - A router object can be created for each seperate route and handeled seperately on individual file.
*/

// A router object to handle routes on Home Page.
const stockRouter = require("express").Router()

stockRouter.get("/", (req, res) => {
  return res.send("Hello from stockRouter object");
})

module.exports = stockRouter;