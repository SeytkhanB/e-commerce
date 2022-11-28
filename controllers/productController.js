import { StatusCodes } from "http-status-codes";
import { NotFoundError, BadRequestError } from "../errors/index.js";
import Product from "../model/Product.js";
import path from "path";
// import * as Cloudinary from "cloudinary";
// import fs from "fs";
const __dirname = path.resolve();

// ------------------------------------------------------------
const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res
    .status(StatusCodes.OK)
    .json({ success: true, products, count: products.length });
};

// ------------------------------------------------------------
const createProduct = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const product = await Product.create(req.body);

  res.status(StatusCodes.CREATED).json({ success: true, product });
};

// ------------------------------------------------------------
const getSingleProduct = async (req, res) => {
  const {
    params: { id: productId },
  } = req;

  const product = await Product.findOne({ _id: productId }).populate("reviews");

  if (!product) {
    throw new NotFoundError(`No product with id: ${id}`);
  }
  res.status(StatusCodes.OK).json({ success: true, product });
};

// ------------------------------------------------------------
const updateProduct = async (req, res) => {
  const {
    user: { userId },
    params: { id: productId },
  } = req;

  const product = await Product.findOneAndUpdate(
    { _id: productId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  res.status(StatusCodes.OK).json({ success: true, msg: "product updated" });
};

// ------------------------------------------------------------
const deleteProduct = async (req, res) => {
  const {
    params: { id: productId },
  } = req;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  await product.remove();

  res.status(StatusCodes.OK).json({ success: true, product: null });
};

// const result = await Cloudinary.v2.uploader.upload(
//   req.files.image.tempFilePath,
//   {
//     use_filename: true,
//     folder: "file-upload",
//   }
// );
//
// // delete image from "tmp" file, in orde not to keep them there
// fs.unlinkSync(req.files.image.tempFilePath);
//
// res
//   .status(StatusCodes.OK)
//   .json({ success: true, image: { src: result.secure_url } });

// ------------------------------------------------------------
const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new BadRequestError("No file to upload");
  }

  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image")) {
    throw new BadRequestError("Please upload the image");
  }

  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new BadRequestError("Please upload image smaller than 1MB");
  }

  const imagePath = path.join(
    __dirname,
    `./public/uploads/${productImage.name}`
  );
  await productImage.mv(imagePath);

  res
    .status(StatusCodes.OK)
    .json({ success: true, image: `/uploads/${productImage.name}` });
};

export {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
