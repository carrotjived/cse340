const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invControllers");
const Util = require("../utilities");
const validate = require("../utilities/inventory-validation");

router.get(
  "/type/:classificationId",
  Util.handleErrors(invController.buildByClassificationId)
);
router.get(
  "/detail/:inventoryId",
  Util.handleErrors(invController.buildByInventoryId)
);
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

router.get(
  "/add-inventory",
  Util.handleErrors(invController.buildAddInventory)
);

router.post(
  "/add-inventory",
  validate.addInventoryRules(),
  validate.checkInvData,
  Util.handleErrors(invController.addInventoryData)
);


module.exports = router;
