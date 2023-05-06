const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const app = express();

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

// init db
require("./dbs/init.mongodb");
// const { checkOverload } = require("./helpers/check.connect");
// checkOverload();

// init routes
app.get("/", (req, res, next) => {
    return res.status(200).json({
        message: "Well well well",
    });
});

// handling error

module.exports = app;
