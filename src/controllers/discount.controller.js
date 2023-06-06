"use strict";

const { SuccessResponse } = require("../core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
    /**
     * @description create discount shop
     */
    createDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: "Successful Code Generations",
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId,
            }),
        }).send(res);
    };

    /**
     * @description Get all discount code of 1 shop
     */
    getAllDiscountCodes = async (req, res, next) => {
        new SuccessResponse({
            message: "Successful Code Found",
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId,
            }),
        }).send(res);
    };

    /**
     * @description Input body productId, qunatity, price => Output totalOrder, discount, totalPrice
     */
    getAllDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: "Successful Code Found",
            metadata: await DiscountService.getDiscountAmount({
                ...req.body,
            }),
        }).send(res);
    };

    /**
     * @description Lấy danh sách tất cả các product thuộc về shop @shopId đang được sale bằng mã @code
     *              có thể chỉnh những thuộc tính cần lấy ra trong phần select service
     * @param {String} code
     * @param {String} shopId
     */
    getAllDiscountCodesWithProduct = async (req, res, next) => {
        new SuccessResponse({
            message: "Successful Code Found",
            metadata: await DiscountService.getAllDiscountCodesWithProduct({
                ...req.query,
            }),
        }).send(res);
    };

    deleteDiscountCodeByShop = async (req, res, next) => {
        console.log(req.query);
        new SuccessResponse({
            message: "Successful Delete code",
            metadata: await DiscountService.deleteDiscountCode({
                ...req.query,
            }),
        }).send(res);
    };
}

module.exports = new DiscountController();
