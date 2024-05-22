"use strict";

const {
  ProductModel,
  ClothingModel,
  ElectronicsModel,
  FurnitureModel,
} = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");
const {
  findAllDrafsForShop,
  findAllPublishForShop,
  publishProductByShop,
  unPublishProductByShop,
  searchProductsByUser,
  findAllProducts,
  findProduct,
  updateProductById,
} = require("../models/repositories/product.repo");
const {
  removeUndefinedObject,
  updateNestedObjectParser,
} = require("../utils/");
const slugify = require("slugify");
const { model } = require("mongoose");
const { insertInventory } = require("../models/repositories/inventory.repo");

// Define Factory class to create product
class ProductFactory {
  /* 
    type: "Clothing" | "Electronics,
    payload: {}
*/
  static productRegistry = {}; // key-class

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];

    if (!productClass) {
      throw new BadRequestError(`Invalid product type ${type}`);
    }

    return new productClass(payload).createProduct();
  }
  static async updateProduct(type, product_id, payload) {
    const productClass = ProductFactory.productRegistry[type];

    if (!productClass) {
      throw new BadRequestError(`Invalid product type ${type}`);
    }

    return new productClass(payload).updateProduct(product_id);
  }

  // PUT //
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShop({ product_shop, product_id });
  }

  static async unPublishProductByShop({ product_shop, product_id }) {
    return await unPublishProductByShop({ product_shop, product_id });
  }
  // END PUT //

  // QUERY //
  static async findAllDrafsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };

    return await findAllDrafsForShop({ query, limit, skip });
  }
  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };

    return await findAllPublishForShop({ query, limit, skip });
  }

  static async searchProducts({ keySearch }) {
    return await searchProductsByUser({ keySearch });
  }
  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await findAllProducts({
      limit,
      sort,
      page,
      filter,
      select: ["product_name", "product_price", "product_thumb"],
    });
  }
  static async findProduct({ product_id }) {
    return await findProduct({ product_id, unSelect: ["__v"] });
  }
  // END QUERY //
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
  async createProduct(product_id) {
    const newProduct =  await ProductModel.create({ ...this, _id: product_id });

    await insertInventory({
      productId: newProduct._id,
      shopId: this.product_shop,
      stock: this.product_quantity,
    })


    return newProduct;
  }

  // update product
  async updateProduct(product_id, payload) {
    return await updateProductById({
      product_id,
      payload,
      model: ProductModel,
    });
  }
}

// Define sub-class for different product types: Clothing
class Clothing extends Product {
  // create new clothing product
  async createProduct() {
    const newClothing = await ClothingModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });

    if (!newClothing) {
      throw new BadRequestError("Failed to create clothing product");
    }

    const newProduct = await super.createProduct(newClothing._id);

    if (!newProduct) {
      throw new BadRequestError("Failed to create product");
    }

    return newProduct;
  }

  async updateProduct(product_id) {
    const objectParams = removeUndefinedObject(this);

    if (objectParams.product_attributes) {
      await updateProductById({
        product_id,
        payload: updateNestedObjectParser(objectParams.product_attributes),
        model: ClothingModel,
      });
    }
    if (objectParams.product_name) { 
      objectParams.product_slug =  slugify(objectParams.product_name, { lower: true });
    }

    const updateProduct = await super.updateProduct(product_id, updateNestedObjectParser(objectParams));

    return updateProduct;
  }
}

// Define sub-class for different product types: Electronics
class Electronics extends Product {
  // create new electronics product
  async createProduct() {
    const newElectronics = await ElectronicsModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });

    if (!newElectronics) {
      throw new BadRequestError("Failed to create electronics product");
    }

    const newProduct = await super.createProduct(newElectronics._id);

    if (!newProduct) {
      throw new BadRequestError("Failed to create product");
    }

    return newProduct;
  }
}

// Define sub-class for different product types: Furniture
class Furniture extends Product {
  // create new electronics product
  async createProduct() {
    const newFurniture = await FurnitureModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });

    if (!newFurniture) {
      throw new BadRequestError("Failed to create furniture product");
    }

    const newProduct = await super.createProduct(newFurniture._id);

    if (!newProduct) {
      throw new BadRequestError("Failed to create product");
    }

    return newProduct;
  }
}

// register product types
ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
