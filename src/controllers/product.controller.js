"use strict";

// const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.lv2");
const { SuccessResponse } = require("../core/success.response");

class ProductController {
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Create new Product success!",
            metadata: await ProductServiceV2.createProduct(
                req.body.product_type,
                {
                    ...req.body,
                    product_shop: req.user.userId,
                }
            ),
        }).send(res);
    };

    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Update Product success!",
            metadata: await ProductServiceV2.updateProduct(
                req.body.product_type,
                req.params.productId,
                {
                    ...req.body,
                    product_shop: req.user.userId,
                }
            ),
        }).send(res);
    };

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Publish Product success by Shop!",
            metadata: await ProductServiceV2.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Unpublish Product success by Shop!",
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    // QUERY
    /**
     * @desc Get all Draft for shop
     * @param {Number} limit
     * @param {Number} skip
     * @return { JSON }
     */
    findAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list Draft success!",
            metadata: await ProductServiceV2.findAllDraftsForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    findAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list Publish success!",
            metadata: await ProductServiceV2.findAllPublishForShop({
                product_shop: req.user.userId,
            }),
        }).send(res);
    };

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list Search Product success!",
            metadata: await ProductServiceV2.searchProductByUser(req.params),
        }).send(res);
    };

    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: "Get list Products success!",
            metadata: await ProductServiceV2.findAllProducts(req.query),
        }).send(res);
    };

    findProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Get Product success!",
            metadata: await ProductServiceV2.findProduct({
                product_id: req.params.id,
            }),
        }).send(res);
    };
}

module.exports = new ProductController();
