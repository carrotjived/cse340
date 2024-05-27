const { header } = require("express-validator");
const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the inventory item view HTML
 * ************************************ */

Util.buildItemInventoryGrid = async function (data) {
  let item;

  if (data.length > 0) {
    item = '<section id="item-display">';
    data.forEach((vehicle) => {
      item +=
        '<title = "View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"></title>';
      item +=
        '<img src = "' +
        vehicle.inv_image +
        '" alt = "Image of ' +
        vehicle.inv_year +
        " " +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        '"/>';
      item +=
        '<div class="car-details"><h3>' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        " Details</h3>";
      item +=
        "<p class='grey'><span class='details'>Price</span>: <span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span></p>";
      item +=
        "<p><span class='details'>Description</span>: " +
        vehicle.inv_description +
        "</p>";
      item +=
        "<p class='grey'><span class='details'>Color</span>: " +
        vehicle.inv_color +
        "</p>";
      item +=
        "<p><span class='details'>Miles</span>: " + vehicle.inv_miles + "</p>";
      item += "</div></div>";
    });
    item += "</section>";
  } else {
    item += '<p class=notice">Sorry, no matching vehicle found. </p>';
  }
  return item;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* **************************************
 * Build classification list
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        res.locals.firstName = accountData.account_firstname;
        res.locals.accountType = accountData.account_type;
        res.locals.accountID = accountData.account_id;

        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 *Hide My Account and show Logout
 **************************************** */

Util.showHeader = (loggedin) => {
  if (loggedin) {
    let header =
      '<a title="Logout" href="/account/logout" id="logout"><h2>Logout</h2></a>';
    header +=
      '<a title="Management View" href="/account/" id="welcomeBasic"><h2>Welcome Basic</h2></a>';
    return header;
  } else {
    let header =
      '<a title="Click to log in" href="/account/login" id="myAccount"><h2>My Account</h2></a>';
    return header;
  }
};

/* ****************************************
 *Hide My Account and show Logout
 **************************************** */

module.exports = Util;
