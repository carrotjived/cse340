const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

router.get(
  "/login",
  utilities.checkJWToken,
  utilities.handleErrors(accountController.buildLogin)
);
router.get(
  "/register",
  utilities.checkJWToken,
  utilities.handleErrors(accountController.buildRegister)
);
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.checkJWToken,
  utilities.handleErrors(accountController.registerAccount)
);

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLogin,
  utilities.checkJWToken,
  utilities.handleErrors(accountController.accountLogin)
);

router.get(
  "/",
  utilities.checkJWToken,
  utilities.handleErrors(accountController.buildDefault)
);

router.get(
  "/update",
  utilities.checkJWToken,
  utilities.handleErrors(accountController.buildUpdate)
);

router.post(
  "/update-account",
  regValidate.registrationRules(),
  utilities.checkJWToken,
  utilities.handleErrors(accountController.updateAccount)
);

router.post(
  "/update-password",
  utilities.checkJWToken,
  regValidate.registrationRules(),
  utilities.handleErrors(accountController.updatePassword)
);

router.get("/edit/:review_id", utilities.handleErrors(accountController.buildEdit))

router.get("/logout", utilities.handleErrors(accountController.logout));
module.exports = router;
