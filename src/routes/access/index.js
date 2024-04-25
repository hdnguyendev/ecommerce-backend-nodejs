"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const router = express.Router();
const { asyncHandler} = require("../../auth/checkAuth");

// handle error



// signUp
router.post("/shop/signup", asyncHandler(accessController.signUp));
// login
router.post("/shop/login", asyncHandler(accessController.login));

module.exports = router;
