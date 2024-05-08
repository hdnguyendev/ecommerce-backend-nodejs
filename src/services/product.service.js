"use strict";

const {
  ProductModel,
  ClothingModel,
  ElectronicsModel,
} = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");

// Define Factory class to create product
class ProductFactory {
  /* 
    type: "Clothing" | "Electronics,
    payload: {}
*/
  static async createProduct(type, payload) {
    switch (type) {
      case "Clothing":
        return await new Clothing(payload).createProduct();
      case "Electronics":
        return await new Electronics(payload).createProduct();
      default:
        throw new BadRequestError(`Invalid product type ${type}`);
    }
  }
}

// define basic product class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_type,
    product_shop,
    product_attributes,
    product_quantity,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
    this.product_quantity = product_quantity;
  }

  // create new product
  async createProduct() {
    return await ProductModel.create(this);
  }
}

// Define sub-class for different product types: Clothing
class Clothing extends Product {
  // create new clothing product
  async createProduct() {
    const newClothing = await ClothingModel.create(this.product_attributes);

    if (!newClothing) {
      throw new BadRequestError("Failed to create clothing product");
    }

    const newProduct = await super.createProduct();

    if (!newProduct) {
      throw new BadRequestError("Failed to create product");
    }

    return newProduct;
  }
}

// Define sub-class for different product types: Electronics
class Electronics extends Product {
  // create new electronics product
  async createProduct() {
    const newElectronics = await ElectronicsModel.create(
      this.product_attributes
    );

    if (!newElectronics) {
      throw new BadRequestError("Failed to create electronics product");
    }

    const newProduct = await super.createProduct();

    if (!newProduct) {
      throw new BadRequestError("Failed to create product");
    }

    return newProduct;
  }
}

module.exports = ProductFactory;
