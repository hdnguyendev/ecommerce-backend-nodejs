"use strict";

const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.v2");

const { SuccessResponse } = require("../core/success.response");
class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Create New Product Successfully",
      metadata: await ProductServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  updateProduct = async (req, res, next) => { 
    new SuccessResponse({
      message: "Update Product Successfully",
      metadata: await ProductServiceV2.updateProduct(req.body.product_type, req.params.productId ,{
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  }

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish Product Successfully",
      metadata: await ProductServiceV2.publishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };
  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Unpublish Product Successfully",
      metadata: await ProductServiceV2.unPublishProductByShop({
        product_shop: req.user.userId,
        product_id: req.params.id,
      }),
    }).send(res);
  };

  // QUERY //
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get All Drafts For Shop Successfully",
      metadata: await ProductServiceV2.findAllDrafsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };
  
  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get All Publish For Shop Successfully",
      metadata: await ProductServiceV2.findAllPublishForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  searchProductsByUser = async (req, res, next) => {
    new SuccessResponse({
      message: "Search Products By User Successfully",
      metadata: await ProductServiceV2.searchProducts(req.params),
    }).send(res);
  };

  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get All Products Successfully",
      metadata: await ProductServiceV2.findAllProducts(req.query),
    }).send(res);
  }

  findProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get Product Successfully",
      metadata: await ProductServiceV2.findProduct({
        product_id: req.params.product_id
      }),

    }).send(res);
  }
  // END QUERY //
}

module.exports = new ProductController();
