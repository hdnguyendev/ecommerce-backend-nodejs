"use strict";

const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
  CLIENT_ID: "x-client-id",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // access token
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });
    // refresh token
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });
    JWT.verify(accessToken, publicKey, (err, decode) => {
        if (err) {
            console.log(`error verify::`,err);
        } else {
            console.log(`decode verify::`,decode);
        
        }
    });
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    return error;
  }
};


const authentication = asyncHandler(async (req, res, next) => {
  /* 
    1 - check userId missing ?
    2 - get AccessToken from header
    3 - verify AccessToken
    4 - check if user is valid
    5 - check keyStore in db
    6 - Ok all => return next()
  */

  // 1
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    throw new AuthFailureError('Invalid Request');
  }
  // 2
  const keyStore  = await findByUserId(userId);
  if (!keyStore) {
    throw new NotFoundError('Not found keyStore');
  }
  // 3
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) {
    throw new AuthFailureError('Invalid Request');
  }
  // 4
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId != decodeUser.userId) {
      throw new AuthFailureError('Invalid Userid');
    }
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error
  }
})

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret)
}

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT

};
