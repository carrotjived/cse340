const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const accountController = {};
const jwt = require("jsonwebtoken");
const { all } = require("../routes/static");
const validate = require("../utilities/account-validation");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
accountController.buildLogin = async function (req, res, next) {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );
  res.render("account/login", {
    title: "Login",
    nav,
    header,
    errors: null,
  });
};

/* ****************************************
 *  Deliver Registration view
 * *************************************** */

accountController.buildRegister = async function (req, res, next) {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );
  res.render("account/register", {
    title: "Register",
    nav,
    header,
    errors: null,
  });
};

/* ****************************************
 *  Process Registration
 * *************************************** */

accountController.registerAccount = async function (req, res) {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    req.status(500).render("account/register", {
      title: "Registration",
      nav,
      header,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      header,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      header,
    });
  }
};

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async function (req, res) {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      header,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    }
  } catch (error) {
    return new Error("Access Forbidden");
  }
};

/* *****************************
 * Build Management View
 * ***************************** */

accountController.buildDefault = async function (req, res, next) {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );
  let reviewData = await accountModel.getReviews(res.locals.account_id);
  let reviews = await utilities.displayReview(reviewData);

  if (res.locals.loggedin) {
    let welcome = await utilities.welcomeMessage(
      res.locals.account_type,
      res.locals.account_id
    );

    if (
      res.locals.account_type == "Employee" ||
      res.locals.account_type == "Admin"
    ) {
      res.render("account/management", {
        title: "Account Management",
        nav,
        header,
        welcome,
        reviews,
        errors: null,
      });
    } else {
      res.render("account/management", {
        title: "Account Management",
        nav,
        header,
        welcome,
        reviews,
        errors: null,
      });
    }
  } else {
    res.redirect("/account/login");
  }
};
/* *****************************
 * Build Update Account View
 * ***************************** */
accountController.buildUpdate = async function (req, res, next) {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );

  const allEmail = await accountModel.getAllEmail(res.locals.account_email);

  const accountData = await accountModel.getAccountById(res.locals.account_id);
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_type,
    account_id,
  } = accountData;
  res.render("account/update", {
    title: "Update Account",
    nav,
    header,
    errors: null,
    account_firstname,
    account_lastname,
    account_email,
    account_type,
    account_id,
  });
};

/* ****************************************
 *  Update Account
 * *************************************** */
accountController.updateAccount = async function (req, res, next) {
  let nav = await utilities.getNav();

  const { account_firstname, account_lastname, account_email, account_id } =
    req.body;

  console.log(res.locals.account_email);
  const allEmail = await accountModel.getAllEmail(res.locals.account_email);
  const validatedEmail = utilities.findEmail(account_email, allEmail);
  console.log(validatedEmail);

  let reviewData = await accountModel.getReviews(res.locals.account_id);
  let reviews = await utilities.displayReview(reviewData);

  const updatedAccount = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  );
  let welcome = await utilities.welcomeMessage(
    res.locals.account_type,
    res.locals.account_id
  );

  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );

  if (validatedEmail) {
    req.flash("notice", "Email already in use.");
    res.status(500).render("account/update", {
      title: "Update Account",
      header,
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
      reviews,
      errors: null,
    });
  } else {
    next();
  }

  if (updatedAccount) {
    req.flash("notice", "Account has been updated");
    res.status(201).render("account/management", {
      title: "Account Management",
      welcome,
      header,
      nav,
      reviews,
      errors: null,
    });
  } else {
    req.flash("notice", "Update failed");
    res.status(500).render("account/update", {
      title: "Update Account",
      header,
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
      errors: null,
    });
  }
};

/* ****************************************
 *  Update Password
 * *************************************** */
accountController.updatePassword = async function (req, res, next) {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );
  const { account_password } = req.body;

  let reviewData = await accountModel.getReviews(res.locals.account_id);
  let reviews = await utilities.displayReview(reviewData);

  let welcome = await utilities.welcomeMessage(
    res.locals.account_type,
    res.locals.account_id
  );
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the updating.");
    req.status(500).render("account/update", {
      title: "Update Account",
      nav,
      header,
      errors: null,
    });
  }
  const updatedPassword = await accountModel.updatePassword(hashedPassword);

  if (updatedPassword) {
    req.flash("notice", "Password has been updated");
    res.status(201).render("account/management", {
      title: "Account Management",
      welcome,
      header,
      nav,
      reviews,
      errors: null,
    });
  } else {
    req.flash("notice", "Update failed");
    res.status(501).render("account/update", {
      title: "Update Account",
      header,
      nav,
    });
  }
};

/* **************************************
 * Logout Account
 * ************************************ */
accountController.logout = async function (req, res, next) {
  res.clearCookie("jwt");
  res.locals.loggedin = "";
  return res.redirect("/");
};

/* **************************************
 * Build the edit review view
 * ************************************ */

accountController.buildEdit = async function (req, res, next) {
  if (res.locals.loggedin) {
    let nav = await utilities.getNav();
    let header = await utilities.showHeader(
      res.locals.loggedin,
      res.locals.account_id
    );
    const review_id = parseInt(req.params.review_id);
    let reviewData = await accountModel.getSpecificReview(review_id);
    console.log(reviewData);

    res.locals.review_text = reviewData.review_text;
    res.locals.review_id = reviewData.review_id;

    let reviewDate = new Date(reviewData.review_date);
    const options = { year: "numeric", month: "long", day: "numeric" };
    let displayDate = reviewDate.toLocaleDateString("en-US", options);

    res.locals.review_date_parsed = displayDate;
    res.locals.review_date = reviewData.review_date;

    console.log(res.locals);

    res.render("account/editReview", {
      title:
        "Edit Review for " +
        reviewData.inv_year +
        " " +
        reviewData.inv_make +
        " " +
        reviewData.inv_model,
      nav,
      header,
      errors: null,
    });
  } else {
    res.redirect("account/login");
  }
};

/* **************************************
 *  Edit the review
 * ************************************ */
accountController.editReview = async function (req, res, next) {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );

  const { review_id, review_text } = req.body;
  console.log(review_id, review_text);

  let reviewData = await accountModel.getSpecificReview(review_id);

  let welcome = await utilities.welcomeMessage(
    res.locals.account_type,
    res.locals.account_id
  );

  const updatedReview = await accountModel.updateReview(review_id, review_text);
  let reviewsData = await accountModel.getReviews(res.locals.account_id);
  let reviews = await utilities.displayReview(reviewsData);
  if (updatedReview) {
    req.flash("notice", "Review has been updated");
    res.render("account/management", {
      title: "Account Management",
      nav,
      header,
      welcome,
      reviews,
      errors: null,
    });
  } else {
    req.flash("notice", "Review update has failed");
    res.status(501).render("account/editReview", {
      title:
        "Edit Review for " +
        reviewData.inv_year +
        " " +
        reviewData.inv_make +
        " " +
        reviewData.inv_model,
      nav,
      header,
      review_id,
      review_text,
    });
  }
};

/* ****************************************
 *  Delete Review
 * *************************************** */

accountController.deleteReview = async function (req, res, next) {
  let welcome = await utilities.welcomeMessage(
    res.locals.account_type,
    res.locals.account_id
  );
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );

  const { review_id } = req.body;

  const reviewData = await accountModel.getSpecificReview(review_id);
  console.log(reviewData);

  const deletedReview = await accountModel.deleteReview(review_id);
  let reviewsData = await accountModel.getReviews(res.locals.account_id);
  let reviews = await utilities.displayReview(reviewsData);
  if (deletedReview) {
    req.flash("notice", "Review has been deleted.");
    res.render("account/management", {
      title: "Account Management",
      nav,
      header,
      welcome,
      reviews,
      errors: null,
    });
  } else {
    req.flash("notice", "Review deletion failed.");
    res.render("account/deleteReview", {
      title:
        "Delete Review for " +
        reviewData.inv_year +
        " " +
        reviewData.inv_make +
        " " +
        reviewData.inv_model,
      nav,
      header,
      review_id,
      review_text,
    });
  }
};

/* ****************************************
 *  Build Delete view
 * *************************************** */
accountController.buildDelete = async function (req, res, next) {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );
  let review_id = parseInt(req.params.review_id);
  let reviewData = await accountModel.getSpecificReview(review_id);

  let reviewDate = new Date(reviewData.review_date);
  const options = { year: "numeric", month: "long", day: "numeric" };
  let displayDate = reviewDate.toLocaleDateString("en-US", options);

  res.locals.review_text = reviewData.review_text;
  res.locals.review_id = reviewData.review_id;
  res.locals.review_date_parsed = displayDate;
  res.locals.review_date = reviewData.review_date;

  console.log(reviewData);

  if (reviewData) {
    res.render("account/deleteReview", {
      title:
        "Delete Review for " +
        reviewData.inv_year +
        " " +
        reviewData.inv_make +
        " " +
        reviewData.inv_model,
      nav,
      header,
      errors: null,
    });
  } else {
    res.redirect("account/management");
  }
};

module.exports = accountController;
