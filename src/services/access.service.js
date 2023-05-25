"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
    BadRequestError,
    AuthFailureError,
    ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};

class AccessService {
    static handlerRefreshTokenV2 = async ({ keyStore, user, refreshToken }) => {
        const { userId, email } = user;
        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            // delete all token belong to this user
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError("Something went wrong! Please re-login!");
        }

        if (keyStore.refreshToken !== refreshToken)
            throw new AuthFailureError("Shop not registered!");

        const foundShop = await findByEmail({ email });

        if (!foundShop) throw new AuthFailureError("Shop not registered!");

        // create 1 new pair
        const tokens = await createTokenPair(
            { userId, email },
            keyStore.publicKey,
            keyStore.privateKey
        );

        // update token
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken, // da duoc su dung de lay token moi roi
            },
        });

        return {
            user,
            tokens,
        };
    };

    /**
     * Check token used?
     */
    static handlerRefreshToken = async (refreshToken) => {
        // check this token used or not
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(
            refreshToken
        );
        // if yes, maybe this user has been hacked by a hacker ?
        if (foundToken) {
            // decode who is this
            const { userId, email } = await verifyJWT(
                refreshToken,
                foundToken.privateKey
            );
            console.log({ userId, email });
            // delete all token belong to this user
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError("Something went wrong! Please re-login!");
        }

        // if no, this user is safe
        const holderToken = await KeyTokenService.findByRefreshToken(
            refreshToken
        );
        if (!holderToken) throw new AuthFailureError("Shop not registered!");
        // verify token
        const { userId, email } = await verifyJWT(
            refreshToken,
            holderToken.privateKey
        );
        console.log("[2]--", { userId, email });
        // check userId
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new AuthFailureError("Shop not registered!");

        // create 1 new pair
        const tokens = await createTokenPair(
            { userId, email },
            holderToken.publicKey,
            holderToken.privateKey
        );

        // update token
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken, // da duoc su dung de lay token moi roi
            },
        });

        return {
            user: { userId, email },
            tokens,
        };
    };

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        console.log({ delKey });
        return delKey;
    };

    /**
     * 1 - Check email in dbs
     * 2 - Match password
     * 3 - Create AT and RT and save
     * 4 - Generate tokens
     * 5 - get data return login
     */
    static login = async ({ email, password, refreshToken = null }) => {
        // 1. Check email in dbs
        const foundShop = await findByEmail({ email });
        if (!foundShop) throw new BadRequestError("Shop not registered!");

        // 2. Match password
        const match = bcrypt.compare(password, foundShop.password);
        if (!match) throw new AuthFailureError("Authentication error");

        // 3. Create AT and RT and save
        // Create privateKey, publicKey
        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        // 4. Generate tokens
        // create token pair
        const { _id: userId } = foundShop;
        const tokens = await createTokenPair(
            { userId, email },
            publicKey,
            privateKey
        );
        await KeyTokenService.createKeyToken({
            userId,
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey,
        });

        // 5.
        return {
            shop: getInfoData({
                fields: ["_id", "name", "email"],
                object: foundShop,
            }),
            tokens,
        };
    };

    static signUp = async ({ name, email, password }) => {
        // check email exists?
        const holderShop = await shopModel.findOne({ email }).lean();

        if (holderShop) {
            throw new BadRequestError("Error: Shop already registered!");
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            roles: [RoleShop.SHOP],
        });
        if (newShop) {
            // Create privateKey, publicKey
            const privateKey = crypto.randomBytes(64).toString("hex");
            const publicKey = crypto.randomBytes(64).toString("hex");

            console.log({ privateKey, publicKey }); // save collection KeyStore

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey,
            });

            if (!keyStore) {
                return {
                    code: "xxxx",
                    message: "keyStore error",
                };
            }

            // create token pair
            const tokens = await createTokenPair(
                { userId: newShop._id, email },
                publicKey,
                privateKey
            );
            console.log(`Create Token Success::`, tokens);

            return {
                code: 201,
                metadata: {
                    shop: getInfoData({
                        fields: ["_id", "name", "email"],
                        object: newShop,
                    }),
                    tokens,
                },
            };
        }
        return {
            code: 200,
            metadata: null,
        };
    };
}

module.exports = AccessService;
