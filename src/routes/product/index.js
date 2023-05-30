const express = require("express");
const productController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2 } = require("../../auth/authUtils");
const router = express.Router();

// search product by user
router.get(
    "/search/:keySearch",
    asyncHandler(productController.getListSearchProduct)
);
router.get("", asyncHandler(productController.findAllProducts));
router.get("/:id", asyncHandler(productController.findProduct));

// authentication
router.use(authenticationV2);

// create new
router.post("", asyncHandler(productController.createProduct));
router.patch("/:productId", asyncHandler(productController.updateProduct));

router.post(
    "/publish/:id",
    asyncHandler(productController.publishProductByShop)
);
router.post(
    "/unpublish/:id",
    asyncHandler(productController.unPublishProductByShop)
);

// query
router.get("/draft/all", asyncHandler(productController.findAllDraftsForShop));
router.get(
    "/publish/all",
    asyncHandler(productController.findAllPublishForShop)
);

module.exports = router;
