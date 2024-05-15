"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const router = express.Router();
const { asyncHandler} = require("../../helpers/asyncHandler");
const { authenticationV2 } = require("../../auth/authUtils");

router.get('/search/:keySearch', asyncHandler(productController.searchProductsByUser));

// authentication
router.use(authenticationV2)
// 
router.post("", asyncHandler(productController.createProduct));

router.post("/publish/:id", asyncHandler(productController.publishProductByShop));
router.post("/unpublish/:id", asyncHandler(productController.unPublishProductByShop));


// QUERY //
router.get("/drafts", asyncHandler(productController.getAllDraftsForShop));
router.get("/publishes", asyncHandler(productController.getAllPublishForShop));


// END QUERY //

module.exports = router;
