"use strict";

// !dmbg

const { model, Schema } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "Discounts";

// Declare the Schema of the Mongo model
var discountSchema = new Schema(
    {
        discount_name: {
            type: String,
            required: true,
        },
        discount_description: {
            type: String,
            required: true,
        },
        discount_type: {
            type: String,
            default: "fixed_amount", //percentage
        },
        discount_value: {
            type: Number, // 10000(vnd) , 10(%)
            required: true,
        },
        discount_max_value: {
            type: Number, // 10000(vnd) , 10(%)
            required: true,
        },
        discount_code: {
            type: String,
            required: true,
        },
        discount_start_date: {
            type: Date,
            required: true,
        },
        discount_end_date: {
            type: Date,
            required: true,
        },
        discount_max_uses: {
            type: Number, // Số lượng discount shop cung cấp
            required: true,
        },
        discount_uses_count: {
            type: Number, // Số lượng discount đã được sử dụng
            required: true,
        },
        discount_users_used: {
            type: Array, // Những user nào đã sử dụng code
            default: [],
        },
        discount_max_uses_per_user: {
            type: Number, // Số lượng code được phép sử dụng tối đa cho mỗi user
            required: true,
        },
        discount_min_order_value: {
            type: Number,
            required: true,
        },
        discount_shopId: {
            type: Schema.Types.ObjectId,
            ref: "Shop",
        },
        discount_is_active: {
            type: Boolean,
            default: true,
        },
        discount_applies_to: {
            type: String,
            required: true,
            enum: ["all", "specific"],
        },
        discount_product_ids: {
            type: Array,
            default: [],
        },
    },
    {
        collection: COLLECTION_NAME,
        timestamps: true,
    }
);

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema);
