"use strict";

const keyTokenModel = require("../models/keyToken.model");
// const { Types } = require("mongoose");

class KeyTokenService {
    static createKeyToken = async ({
        userId,
        publicKey,
        privateKey,
        refreshToken,
    }) => {
        try {
            // level 0
            // const tokens = await keyTokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey,
            // });

            // return tokens ? tokens.publicKey : null;

            // level xx
            const filter = { user: userId },
                update = {
                    publicKey,
                    privateKey,
                    refreshTokensUsed: [],
                    refreshToken,
                },
                options = { upsert: true, new: true };
            const tokens = await keyTokenModel.findOneAndUpdate(
                filter,
                update,
                options
            );
            return tokens ? tokens.publicKey : null;
        } catch (error) {
            return error;
        }
    };

    static findByUserId = async (userId) => {
        // return await keyTokenModel
        //     .findOne({ user: Types.ObjectId(userId) })
        //     .lean();
        return await keyTokenModel.findOne({ user: userId }).lean();
    };

    static removeKeyById = async (id) => {
        // return await keyTokenModel.remove(id);
        return await keyTokenModel.deleteOne(id);
    };
}

module.exports = KeyTokenService;
