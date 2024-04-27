"use strict";

const shopModel = require("../models/shop.model");
const bycrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");
const keytokenModel = require("../models/keytoken.model");
const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  /* 
    check this token used?
  */
  static handlerRefreshToken = async ({ refreshToken }) => {
    const foundToken = await KeyTokenService.findByRefreshTokenUsed({
      refreshToken,
    });

    if (foundToken) {
      // decode token
      const { email, userId } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      console.log(`email::`, email);
      console.log(`userId::`, userId);

      // delete token in keyStore
      await KeyTokenService.deleteKeyById({ userId });

      throw new ForbiddenError("Something went wrong! Please login again!");
    }
    // OK
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);

    console.log(`holderToken::`, holderToken);
    if (!holderToken) {
      throw new AuthFailureError("Shop not registered! 1");
    }

    // verify token
    const { email, userId } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    // check userId
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new AuthFailureError("Shop not registered! 2");
    }

    // create new token pair
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
        refreshTokensUsed: refreshToken, // add token used
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  };

  static logout = async ({ keyStore }) => {
    return await KeyTokenService.removeKeyById({ id: keyStore._id });
  };

  /* 
    1 - check email exist?
    2 - check password correct?
    3 - create AccessToken, RefreshToken and save to KeyStore
    4 - generate token 
    5 - get data and return login success
  */
  static login = async ({ email, password, refreshToken = null }) => {
    const foundShop = await findByEmail({ email });
    // 1
    if (!foundShop) {
      throw new BadRequestError("Shop not registered");
    }
    // 2
    const match = bycrypt.compare(password, foundShop.password);
    if (!match) {
      throw new AuthFailureError("Authentication failed!");
    }
    // 3
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
    // 4
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId: foundShop._id, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
      userId,
    });
    return {
      shop: getInfoData({
        filed: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    // check email exist?
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError("Error: Shop already registered!");
    }

    // create new shop
    const passwordHash = await bycrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      console.log({ privateKey, publicKey }); // save collection KeyStore

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        // throw new BadRequestError("Error: KeyStore not created!");
        return {
          code: "xxx",
          message: "Create key token fail",
        };
      }
      // create token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );

      console.log(`Created Token Success::`, tokens);

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            filed: ["_id", "name", "email"],
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
