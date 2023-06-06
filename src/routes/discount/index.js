const express = require("express");
const discountController = require("../../controllers/discount.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

router.post("/amount", asyncHandler(discountController.getAllDiscountAmount));
router.get(
    "/list_product_code",
    asyncHandler(discountController.getAllDiscountCodesWithProduct)
);

router.use(authenticationV2);

router.post("", asyncHandler(discountController.createDiscountCode));
router.get("", asyncHandler(discountController.getAllDiscountCodes));
router.delete("", asyncHandler(discountController.deleteDiscountCodeByShop));

module.exports = router;
