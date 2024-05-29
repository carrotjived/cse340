const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );
  const className = data[0].classification_name;
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    header,
    grid,
  });
};

/* ***************************
 *  Build inventory by specific view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inventory_id = req.params.inventoryId;
  const data = await invModel.getInventoryByInventoryId(inventory_id);
  const details = await utilities.buildItemInventoryGrid(data);
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );
  const carYear = data[0].inv_year;
  const carMake = data[0].inv_make;
  const carModel = data[0].inv_model;
  res.render("inventory/inventory-details", {
    title: carYear + " " + carMake + " " + carModel,
    nav,
    header,
    details,
  });
};

/* ***************************
 *  Build Vehicle Management View
 * ************************** */
invCont.buildManagement = async function (req, res) {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );
  const classificationSelect = await utilities.buildClassificationList();
  if (
    res.locals.account_type == "Employee" ||
    res.locals.account_type == "Admin"
  ) {
    res.render("inventory/management", {
      title: "Vehicle Management",
      nav,
      header,
      classificationSelect,
      errors: null,
    });
  } else {
    req.flash("notice", "Access Denied. Please Log-in the right credentials");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      header,
      errors: null,
    });
  }
};

/* ***************************
 *  Build Add Classification View
 * ************************** */
invCont.buildAddClassification = async function (req, res) {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    header,
    errors: null,
  });
};

invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;
  console.log(classification_name);
  const addData = await invModel.addClassification(classification_name);
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );

  if (addData) {
    req.flash("notice", "Classification added.");
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      header,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, cannot add classification.");
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      header,
    });
  }
};

/* ***************************
 *  Build Add Inventory View
 * ************************** */
invCont.buildAddInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const classification_id = req.params.classification_id;
  console.log(classification_id);
  const classificationSelect = await utilities.buildClassificationList();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );
  res.render("inventory/add-inventory", {
    title: "Add New Vehicles",
    nav,
    header,
    classificationSelect,
  });
};

/* ***************************
 *  Add Classificaiton to Database
 * ************************** */

invCont.addInventoryData = async function (req, res) {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );

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
  const classificationSelect = await utilities.buildClassificationList();
  const addInventoryData = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (addInventoryData) {
    req.flash("notice", "New Car Added");
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      header,
      errors: null,
      classificationSelect,
    });
  } else {
    req.flash("notice", "Sorry, cannot add vehicle.");
    res.status(501).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      header,
      classificationSelect,
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 * Build  Modify Inventory View
 * ************************** */
invCont.modifyInventory = async function (req, res) {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );
  const inventory_id = parseInt(req.params.inventory_id);
  const invData = await invModel.getInventoryByInventoryId(inventory_id);
  const classificationSelect = await utilities.buildClassificationList(
    invData[0].classification_id
  );

  const name = `${invData[0].inv_make} ${invData[0].inv_model}`;

  res.render("inventory/modify-inventory", {
    title: "Edit " + name,
    nav,
    header,
    invData,
    classificationSelect,
    errors: null,
    inv_id: invData[0].inv_id,
    inv_make: invData[0].inv_make,
    inv_model: invData[0].inv_model,
    inv_year: invData[0].inv_year,
    inv_description: invData[0].inv_description,
    inv_image: invData[0].inv_image,
    inv_thumbnail: invData[0].inv_thumbnail,
    inv_price: invData[0].inv_price,
    inv_miles: invData[0].inv_miles,
    inv_color: invData[0].inv_color,
    classification_id: invData[0].classification_id,
  });
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );

  const {
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
    inv_id,
  } = req.body;

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationnSecret = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the insert failed");
    res.status(501).render("inventory/modify-inventory", {
      title: "Edit " + itemName,
      nav,
      header,
      classificationnSecret,
      errors: null,
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
      inv_id,
    });
  }
};

/* ***************************
 * Build Delete View
 * ************************** */

invCont.deleteView = async function (req, res) {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );
  const inventory_id = parseInt(req.params.inventory_id);
  const invData = await invModel.getInventoryByInventoryId(inventory_id);

  const name = `${invData[0].inv_make} ${invData[0].inv_model}`;

  res.render("inventory/delete-confirm", {
    title: "Delete " + name,
    nav,
    header,
    invData,
    errors: null,
    inv_id: invData[0].inv_id,
    inv_make: invData[0].inv_make,
    inv_model: invData[0].inv_model,
    inv_year: invData[0].inv_year,
    inv_price: invData[0].inv_price,
  });
};

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );

  const { inv_id } = req.body;
  console.log(inv_id);

  const deleteResult = await invModel.deleteInventory(inv_id);

  if (deleteResult) {
    req.flash("notice", `The vehicle was successfully deleted.`);
    res.redirect("/inv/");
  } else {
    const itemName = `${deleteResult.inv_make} ${deleteResult.inv_model}`;
    req.flash("notice", "Sorry, delete failed");
    res.status(501).render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      header,
      errors: null,
    });
  }
};

module.exports = invCont;
