const express = require("express");
const productController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

// authentication
router.use(authenticationV2);

// create new
router.post("", asyncHandler(productController.createProduct));

module.exports = router;
