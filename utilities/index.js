const { header } = require("express-validator");
const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();
const accountModel = require("../models/account-model");

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
        res.locals.account_firstname = accountData.account_firstname;
        res.locals.account_lastname = accountData.account_lastname;
        res.locals.account_email = accountData.account_email;
        res.locals.account_type = accountData.account_type;
        res.locals.account_id = accountData.account_id;

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

Util.showHeader = async function (loggedin, accountId) {
  if (loggedin) {
    let accountData = await accountModel.getAccountById(accountId);
    let firstName = accountData.account_firstname;

    let header =
      '<h2><a title="Logout" href="/account/logout" id="logout">Logout</a></h2>';
    header += `<h2><a title="Management View" href="/account/" id="welcomeBasic">Welcome ${firstName}</a></h2>`;
    return header;
  } else {
    let header =
      '<a title="Click to log in" href="/account/login" id="myAccount"><h2>My Account</h2></a>';
    return header;
  }
};

/* ****************************************
 *Welcome Message
 **************************************** */
Util.welcomeMessage = async function (accountType, account_id) {
  let accountData = await accountModel.getAccountById(account_id);
  if (accountType == "Employee" || accountType == "Admin") {
    let welcome = `<h2 id="welcomeName">Welcome ${accountData.account_firstname}!`;
    welcome +=
      '<p><a href="/account/update" id="updateButton">Update Contact Information</a></p>';
    welcome += "<h3>Manage Inventory</h3>";
    welcome +=
      "<p><a href='/inv/' title='See Inventory Management View' id='viewInventory'>View</a></p>";

    return welcome;
  } else {
    let welcome = `<h2>Welcome ${accountData.account_firstname}!`;
    welcome +=
      '<p><a href="/account/update" id="updateButton">Update Contact Information</a></p>';
    return welcome;
  }
};

/* **************************************
 *Validate Email
 * ************************************ */
Util.findEmail = (account_email, emailArray) => {
  return emailArray.find((email) => email.account_email === account_email);
};

/* **************************************
 * Build the inventory review view
 * ************************************ */
Util.buildReview = (reviewData) => {
  let reviews = "<ul id='reviewsData'>";
  if (reviewData.length > 0) {
    reviewData.forEach((review) => {
      let reviewDate = new Date(review.review_date);
      const options = { year: "numeric", month: "long", day: "numeric" };
      let displayDate = reviewDate.toLocaleDateString("en-US", options);

      reviews += `<li><span class="review-accountName">${review.account_firstname.slice(
        0,
        1
      )}${review.account_lastname}</span> wrote on ${displayDate}: <br>`;
      reviews += `${review.review_text}`;
      reviews += "</li>";
    });
    reviews += "</ul>";
  } else {
    reviews = "<p>Be the first to post a review</p>";
  }

  return reviews;
};

/* **************************************
 * Build the inventory review view
 * ************************************ */
Util.displayReview = async function (reviewData) {
  let reviews = "<ul id='reviewsData'>";
  let count = 1;
  if (reviewData.length > 0) {
    reviewData.forEach((review) => {
      let reviewDate = new Date(review.review_date);
      const options = { year: "numeric", month: "long", day: "numeric" };
      let displayDate = reviewDate.toLocaleDateString("en-US", options);

      reviews += `<li>${count}. Reviewed the <span>${review.inv_make} ${review.inv_model}</span> on ${displayDate}: "`;
      reviews += `${review.review_text}"`;
      reviews += `| <a href='/account/edit/${review.review_id}'>Edit </a> | <a href='/account/delete/${review.review_id}'> Delete</a>`;
      reviews += "</li>";
      count++;
    });

    reviews += "</ul>";
  } else {
    reviews = "No Reviews found";
  }

  return reviews;
};

module.exports = Util;
