const utilities = require("../utilities/");
const baseController = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav();
  console.log(res.locals);
  const header = utilities.showHeader(res.locals.loggedin);
  res.render("index", {
    title: "Home",
    nav,
    header,
  });
};

baseController.throwError = function () {
  throw new Error("Server Error");
};

module.exports = baseController;
