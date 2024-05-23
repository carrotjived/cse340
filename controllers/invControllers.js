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
  const className = data[0].classification_name;
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
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
  const carYear = data[0].inv_year;
  const carMake = data[0].inv_make;
  const carModel = data[0].inv_model;
  res.render("inventory/inventory-details", {
    title: carYear + " " + carMake + " " + carModel,
    nav,
    details,
  });
};

/* ***************************
 *  Build Vehicle Management View
 * ************************** */
invCont.buildManagement = async function (req, res) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("inventory/management", {
    classificationSelect,
    title: "Vehicle Management",
    nav,
    errors: null,
  });
};

/* ***************************
 *  Build Add Classification View
 * ************************** */
invCont.buildAddClassification = async function (req, res) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
};

invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;
  console.log(classification_name);
  const addData = await invModel.addClassification(classification_name);
  let nav = await utilities.getNav();

  if (addData) {
    req.flash("notice", "Classification added.");
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, cannot add classification.");
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
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
  const classificationList = await utilities.buildClassificationList(
    classification_id
  );
  res.render("inventory/add-inventory", {
    title: "Add New Vehicles",
    nav,
    classificationList,
  });
};

/* ***************************
 *  Add Classificaiton to Database
 * ************************** */

invCont.addInventoryData = async function (req, res) {
  let nav = await utilities.getNav();
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
    res.status(201).render("./inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, cannot add vehicle.");
    res.status(501).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
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
 *  Modify Inventory
 * ************************** */
invCont.modifyInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const inventory_id = parseInt(req.params.inventory_id);
  const invData = await invModel.getInventoryByInventoryId(inventory_id);
  const classificationSelect = await utilities.buildClassificationList(
    invData.classification_id
  );

  const name = `${invData[0].inv_make} ${invData[0].inv_model}`;

  res.render("inventory/modify-inventory", {
    title: "Edit " + name,
    nav,
    invData,
    classificationList: classificationSelect,
    errors: null,
    inv_id: invData.inv_id,
    inv_make: invData.inv_make,
    inv_model: invData.inv_model,
    inv_year: invData.inv_year,
    inv_description: invData.inv_description,
    inv_image: invData.inv_image,
    inv_thumbnail: invData.inv_thumbnail,
    inv_price: invData.inv_price,
    inv_miles: invData.inv_miles,
    inv_color: invData.inv_color,
    classification_id: invData.classification_id,
  });
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
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
    inv_id
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
      classificationList: classificationnSecret,
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

module.exports = invCont;
