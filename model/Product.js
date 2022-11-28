import mongoose from "mongoose";
const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name must be provided"],
      trim: true,
      maxlength: [100, "Name can't be more that 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price must be provided"],
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Product description must be provided"],
      maxlength: [
        1000,
        "Product description can't be more than 1000 characters",
      ],
    },
    image: {
      type: String,
      default: "/uploads/example.jpeg",
    },
    category: {
      type: String,
      required: [true, "Product category must be provided"],
      enum: ["office", "kitchen", "bedroom"],
    },
    company: {
      type: String,
      required: [true, "Product company must be provided"],
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
    },
    colors: {
      type: [String],
      default: ["#008080"],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    inventory: {
      type: Number,
      required: true,
      default: 21,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// be able to use ".populate("reviews")" in "getSingleProduct"
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

// delete all reviews associate with exactly product
ProductSchema.pre("remove", async function () {
  await this.model("Review").deleteMany({ product: this._id });
});

export default mongoose.model("Product", ProductSchema);
