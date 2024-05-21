const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invControllers");
const Util = require("../utilities");
const validate = require("../utilities/inventory-validation");

router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:inventoryId", invController.buildByInventoryId);
router.get(
  "/add-classification",
  Util.handleErrors(invController.buildAddClassification)
);
router.post(
  "/add-classification",
  validate.addClassificationRules(),
  validate.checkRegData,
  Util.handleErrors(invController.addClassification)
);

router.get("/add-inventory", Util.handleErrors(invController.buildAddInventory))

module.exports = router;
