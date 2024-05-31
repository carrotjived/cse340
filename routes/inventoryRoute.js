const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invControllers");
const Util = require("../utilities");
const validate = require("../utilities/inventory-validation");

//Build Classification View
router.get(
  "/type/:classificationId",
  Util.checkJWToken,
  Util.handleErrors(invController.buildByClassificationId)
);

//Build Inventory View
router.get(
  "/detail/:inventoryId",
  Util.checkJWToken,
  Util.handleErrors(invController.buildByInventoryId)
);

//Build Add Classification View
router.get(
  "/add-classification",
  Util.checkJWToken,
  Util.handleErrors(invController.buildAddClassification)
);

//Build Add Inventory View
router.get(
  "/add-inventory",
  Util.checkJWToken,
  Util.handleErrors(invController.buildAddInventory)
);

//Build Modify Inventory View from Management View
router.get(
  "/edit/:inventory_id",
  Util.checkJWToken,
  Util.handleErrors(invController.modifyInventory)
);

router.get(
  "/getInventory/:classification_id",
  Util.checkJWToken,
  Util.handleErrors(invController.getInventoryJSON)
);

//Build Delete View From Management View
router.get(
  "/delete/:inventory_id",
  Util.checkJWToken,
  Util.handleErrors(invController.deleteView)
);

//Add New Classification
router.post(
  "/add-classification",
  validate.addClassificationRules(),
  validate.checkRegData,
  Util.checkJWToken,
  Util.handleErrors(invController.addClassification)
);

//Add New Inventory
router.post(
  "/add-inventory",
  validate.addInventoryRules(),
  validate.checkInvData,
  Util.checkJWToken,
  Util.handleErrors(invController.addInventoryData)
);

//Update Inventory
router.post(
  "/update/",
  validate.addInventoryRules(),
  validate.checkUpdateData,
  Util.checkJWToken,
  Util.handleErrors(invController.updateInventory)
);

//Delete Inventory
router.post(
  "/delete/",
  Util.checkJWToken,
  Util.handleErrors(invController.deleteInventory)
);

//Add new Review
router.post(
  "/addReview",
  Util.checkLogin,
  validate.reviewRule(),
  validate.checkReview,
  Util.handleErrors(invController.addNewReview)
);

module.exports = router;
