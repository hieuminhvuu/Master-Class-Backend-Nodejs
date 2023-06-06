"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discount = require("../models/discount.model");
const { convertToObjectIdMongodb } = require("../utils");
const { findAllProducts } = require("../models/repositories/product.repo");
const {
    findAllDiscountCodeUnSelect,
    checkDiscountExists,
} = require("../models/repositories/discount.repo");

/**
 * 1. Generator Discount code [Shop|Admin]
 * 2. Get discount amount [User]
 * 3. Get all discount codes [User|Shop]
 * 4. Verify discount code [User]
 * 5. Delete discount code [Shop|Admin]
 * 6. Cancel discount code [User]
 */

class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code,
            start_date,
            end_date,
            is_active,
            shopId,
            min_order_value,
            product_ids,
            applies_to,
            name,
            description,
            type,
            value,
            max_value,
            max_uses,
            uses_count,
            max_uses_per_user,
            users_used,
        } = payload;

        // if (
        //     new Date() > new Date(start_date) ||
        //     new Date() < new Date(end_date)
        // ) {
        //     throw new BadRequestError("Discount code has expired!");
        // }

        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError("start_date must be before end_date !");
        }

        // Create index for discount code
        const foundDiscount = await discount
            .findOne({
                discount_code: code,
                // discount_shopId : shopId
                discount_shopId: convertToObjectIdMongodb(shopId),
            })
            .lean();

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError("Discount exists!");
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === "all" ? [] : product_ids,
        });

        return newDiscount;
    }

    static async updateDiscount() {
        // ...
    }

    /**
     * Get all discount codes available with products
     */
    static async getAllDiscountCodesWithProduct({ code, shopId, limit, page }) {
        limit = limit || 50;
        page = page || 1;
        const foundDiscount = await discount
            .findOne({
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            })
            .lean();

        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError("Discount doesn't exists!");
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount;
        let products;
        if (discount_applies_to === "all") {
            // Get all product
            products = await findAllProducts({
                filter: {
                    // product_shop : shopId,
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ["product_name"],
            });
        }
        if (discount_applies_to === "specific") {
            // Get all the products ids
            products = await findAllProducts({
                filter: {
                    // product_shop : shopId,
                    _id: { $in: discount_product_ids },
                    isPublished: true,
                },
                limit: +limit,
                page: +page,
                sort: "ctime",
                select: ["product_name"],
            });
        }

        return products;
    }

    /**
     * get all discount codes of shop
     */
    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        limit = limit || 50;
        page = page || 1;
        const discounts = await findAllDiscountCodeUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true,
            },
            unSelect: ["__v"],
            model: discount,
        });

        return discounts;
    }

    static async getDiscountAmount({ codeId, userId, shopId, products }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId),
            },
        });

        if (!foundDiscount) throw new NotFoundError("Discount doesn't exists!");

        const {
            discount_is_active,
            discount_max_uses,
            discount_start_date,
            discount_end_date,
            discount_min_order_value,
            discount_max_uses_per_user,
            discount_users_used,
            discount_type,
            discount_value,
        } = foundDiscount;
        if (!discount_is_active) {
            throw new NotFoundError("Discount expired!");
        }
        if (!discount_max_uses) {
            throw new NotFoundError("Discount are out!");
        }
        // if (
        //     new Date() < new Date(discount_start_date) ||
        //     new Date() > new Date(discount_end_date)
        // ) {
        //     throw new NotFoundError("Discount expired!");
        // }

        // check xem co gia tri toi thieu hay ko
        let totalOrder = 0;
        if (discount_min_order_value > 0) {
            // get total
            totalOrder = products.reduce((acc, product) => {
                return acc + product.quantity * product.price;
            }, 0);
            console.log(totalOrder);
            if (totalOrder < discount_min_order_value) {
                throw new NotFoundError(
                    `Discount requires a minimum order value of ${discount_min_order_value}`
                );
            }
        }
        if (discount_max_uses_per_user > 0) {
            const userUserDiscount = discount_users_used.find(
                (user) => user.userId === userId
            );
            if (userUserDiscount) {
                // ....
            }
        }

        // Check xem discount fixed_amount hay la ...
        const amount =
            discount_type === "fixed_amount"
                ? discount_value
                : totalOrder * (discount_value / 100);

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount,
        };
    }

    static async deleteDiscountCode({ shopId, code }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: code,
                discount_shopId: convertToObjectIdMongodb(shopId),
            },
        });

        if (!foundDiscount) throw new NotFoundError("Discount doesn't exists!");

        // Do somethings before delete
        // Example : tìm xem mã có đang được dùng ở đâu không ?

        const deleted = await discount.deleteOne({
            discount_code: foundDiscount.discount_code,
            discount_shopId: foundDiscount.discount_shopId,
        });

        return deleted;
    }

    /**
     *
     */
    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId),
            },
        });

        if (!foundDiscount) throw new NotFoundError("Discount doesn't exists!");

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1,
            },
        });

        return result;
    }
}

module.exports = DiscountService;
