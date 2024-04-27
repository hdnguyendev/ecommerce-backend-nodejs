"use strict";
const AccessService = require("../services/access.service");

const { OK, CREATED, SuccessResponse } = require("../core/success.response");
class AccessController {
  handlerRefreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: "Get Token Successfully",
      metadata: await AccessService.handlerRefreshToken({
        refreshToken: req.body.refreshToken,
      }),
    }).send(res);
  };

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout Successfully",
      metadata: await AccessService.logout({ keyStore: req.keyStore }),
    }).send(res);
  };
  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  signUp = async (req, res, next) => {
    new CREATED({
      message: "Registered Successfully",
      metadata: await AccessService.signUp(req.body),
      // option: {
      //   limit: 10
      // }
    }).send(res);
  };
}

module.exports = new AccessController();
