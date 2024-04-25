"use strict";

const { findById } = require("../services/apikey.service");

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

const apiKey = async (req, res, next) => {
  try {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      return res.status(403).json({ message: "Forbideen Error" });
    }
    // check objKey
    const objKey = await findById(key);
    if (!objKey) {
      return res.status(403).json({ message: "Forbideen Error" });
    }

    req.objKey = objKey;

    return next();
  } catch (error) {}
};

const permission = ( permission ) => {
    return (req, res, next) => {
        if (!req.objKey.permissions) {
            return res.status(403).json({ message: "Permission Denined" });
        }

        console.log(`permission::`,req.objKey.permissions);

        const validPermission = req.objKey.permissions.includes(permission);

        if (!validPermission) {
            return res.status(403).json({ message: "Permission Denined" });
        }

        return next();

    }
}
const asyncHandler = fn => {
    return (req, res, next) => {
      // Make sure to `.catch()` any errors and pass them along to the `next()`
        fn(req, res, next).catch(next);
    }
}

module.exports = {
    apiKey,
    permission,
    asyncHandler
};
