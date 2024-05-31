const utilities = require("./index");
const { body, validationResult } = require("express-validator");
const inventoryModel = require("../models/inventory-model");
const validate = {};

/*  **********************************
 * Add Classification Data Validation Rules
 * ********************************* */
validate.addClassificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification."),
  ];
};

validate.addInventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide make."),

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide model"),

    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ max: 4 })
      .withMessage("Please provide year."),

    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide description"),

    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Please provide price"),

    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide miles"),
  ];
};

/* ******************************
 * Check data and return errors or continue to classification
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name,
    });
    return;
  }
  next();
};

validate.checkInvData = async (req, res, next) => {
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );

  const classificationSelect = await utilities.buildClassificationList();
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  console.log(req.body);
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    req.flash("notice", "Invalid Parameters");
    res.render("./inventory/add-inventory", {
      errors,
      title: "Add New Vehicle",
      nav,
      header,
      classificationSelect,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
    return;
  }
  next();
};

validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_data,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("./inventory/modify-inventory", {
      errors,
      title: `Update ${inv_make} ${inv_model}`,
      nav,
      inv_data,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
    return;
  }
  next();
};

validate.checkReview = async (req, res, next) => {
  const { inv_id } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash(
      "message warning",
      "Provide review text of at least 10 characters."
    );
    res.redirect(`/inv/detail/${inv_id}`);
    return;
  }
  next();
};

validate.reviewRule = () => {
  return [
    body("review_text")
      .trim()
      .notEmpty()
      .escape()
      .isLength({ min: 5 })
      .isString()
      .withMessage("Provide review text of at least 5 characters."),
  ];
};
module.exports = validate;
