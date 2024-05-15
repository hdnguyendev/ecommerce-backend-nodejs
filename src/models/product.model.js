"use strict";

const { model, Schema } = require("mongoose");
const slugify = require("slugify")

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

const productSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_thumb: {
      type: String,
      required: true,
    },
    product_description: {
      type: String,
    },
    product_slug: {
      type: String,
    },
    product_price: {
      type: Number,
      required: true,
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Furniture", "Books", "Others"],
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    product_attributes: {
      type: Schema.Types.Mixed,
      required: true,
    },
    //
    product_ratingsAvg: {
      type: Number,
      default: 4.5,
      min: [1.0, "Rating must be at least 1.0"],
      max: [5.0, "Rating must be at most 5.0"],
      set: (v) => Math.round(v * 10) / 10, // round to 1 decimal
    }, // average rating

    product_variations: {
      type: Array,
      default: [],
    },
    isDraft: {
      type: Boolean,
      default: true,
      index: true,
      select: false
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
      select: false
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);
// Create index for searching
productSchema.index({ product_name: "text", product_description: "text" });


// Document middleware: RUN BEFORE .save() and .create()
productSchema.pre("save", function (next) {
  this.product_slug = slugify(this.product_name, { lower: true });
  next();
});

// define the product type = clothing

const clothingSchema = new Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    size: {
      type: String,
    },
    material: {
      type: String,
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    collection: "clothes",
    timestamps: true,
  }
);

// define the product type = ElectronicsSchema

const electronicSchema = new Schema(
  {
    manufacturer: {
      type: String,
      required: true,
    },
    model: {
      type: String,
    },
    color: {
      type: String,
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    collection: "electronics",
    timestamps: true,
  }
);

// define the product type = FurnitureSchema

const furnitureSchema = new Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    size: {
      type: String,
    },
    material: {
      type: String,
    },
    product_shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
  },
  {
    collection: "furnitures",
    timestamps: true,
  }
);

module.exports = {
  ProductModel: model(DOCUMENT_NAME, productSchema),
  ClothingModel: model("Clothing", clothingSchema),
  ElectronicsModel: model("Electronics", electronicSchema),
  FurnitureModel: model("Furniture", furnitureSchema),
};
