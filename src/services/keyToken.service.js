"use strict";

const keytokenModel = require("../models/keytoken.model");
const { Types } = require("mongoose");
class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      // level 0
      /*  const tokens = await keytokenModel.create({
        user: userId,
        publicKey: publicKey,
        privateKey: privateKey
      })

      return tokens ? tokens.publicKey : null; */
      // level xxx
      const filter = { user: userId },
        update = {
          publicKey,
          privateKey,
          refreshTokensUsed: [],
          refreshToken,
        },
        options = { upsert: true, new: true };
      const tokens = await keytokenModel.findOneAndUpdate(
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
    return await keytokenModel.findOne({ user: new Types.ObjectId(userId) });
  };
  static removeKeyById = async ({ id }) => {
    return await keytokenModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
  };

  static findByRefreshTokenUsed = async ({ refreshToken }) => {
    return await keytokenModel
      .findOne({
        refreshTokensUsed: refreshToken,
      })
      .lean();
  };
  static deleteKeyById = async ({ userId }) => {
    return await keytokenModel.deleteOne({ user: new Types.ObjectId(userId) });
  };

  static findByRefreshToken = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshToken });
  };
}

module.exports = KeyTokenService;
