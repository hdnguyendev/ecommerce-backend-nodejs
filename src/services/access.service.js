"use strict";

const shopModel = require("../models/shop.model");
const bycrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      // check email exist?
      const holderShop = await shopModel.findOne({ email }).lean();
      if (holderShop) {
        return {
          code: "xxx",
          message: "Email already exists",
          status: "error",
        };
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
        // create private key, public key

        // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        //   modulusLength: 4096,
        //   publicKeyEncoding: {
        //     // Public Key Cryptography Standards 1 (PKCS1)
        //     type: "pkcs1",
        //     format: "pem",
        //   },
        //   privateKeyEncoding: {
        //     type: "pkcs1",
        //     format: "pem",
        //   },
        // });
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
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
      };
    }
  };
}

module.exports = AccessService;
