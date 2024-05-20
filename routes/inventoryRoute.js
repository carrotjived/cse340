const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invControllers");

router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:inventoryId", invController.buildByInventoryId);


module.exports = router;
