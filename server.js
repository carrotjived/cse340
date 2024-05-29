/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/");
const invControllers = require("./controllers/invControllers");
const session = require("express-session");
const pool = require("./database/");
const accountRoute = require("./routes/accountRoute");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Middleware
 *************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(utilities.checkJWToken);

/* ***********************
 * Routes
 *************************/
app.use(static);
// Inventory routes
app.use("/inv", utilities.checkJWToken, inventoryRoute);
//Index Route
// app.get("/", utilities.handleErrors(baseController.buildHome));
app.get(
  "/",
  utilities.checkJWToken,
  utilities.handleErrors(baseController.buildHome)
);
app.get(
  "/inv/type/",
  utilities.checkJWToken,
  utilities.handleErrors(invControllers.buildByClassificationId)
);

//Inventory Route
app.get(
  "/inv/details/",
  utilities.checkJWToken,
  utilities.handleErrors(invControllers.buildByInventoryId)
);

//Error Route
app.get(
  "/error",
  utilities.checkJWToken,
  utilities.handleErrors(baseController.throwError)
);

//Account Route
app.use("/account", utilities.checkJWToken, accountRoute);

//Management Route
app.get(
  "/inv/",
  utilities.checkJWToken,
  utilities.handleErrors(invControllers.buildManagement)
);
//Add Classification Route
app.get(
  "/inv/add-classification/",
  utilities.checkJWToken,
  utilities.handleErrors(invControllers.buildAddClassification)
);

//Add Vehicle Route
app.get(
  "/inv/add-inventory/",
  utilities.checkJWToken,
  utilities.handleErrors(invControllers.buildAddInventory)
);

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

// ErrorHandling
/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  let header = await utilities.showHeader(
    res.locals.loggedin,
    res.locals.account_id
  );

  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  if (err.status == 404) {
    message = err.message;
  } else {
    message = "Oh no! There was a crash. Maybe try a different route?";
  }
  res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
    header,
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
