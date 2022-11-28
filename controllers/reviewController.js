import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import Product from "../model/Product.js";
import Review from "../model/Review.js";
import { checkPermissions } from "../utils/index.js";

// ------------------------------------------------------------
const createReview = async (req, res) => {
  const {
    body: { product: productId },
    user: { userId },
  } = req;

  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new NotFoundError(`No product with id: ${productId}`);
  }

  // checking, whether user has submitted a comment
  // users can leave one review only
  const alreadyReviewed = await Review.findOne({
    product: productId,
    createdBy: userId,
  });
  if (alreadyReviewed) {
    throw new BadRequestError("Already submitted review for this product!");
  }

  req.body.createdBy = userId;

  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ success: true, review });
};

// ------------------------------------------------------------
const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
    .populate({
      path: "product",
      select: "name company price",
    })
    .populate({
      path: "createdBy",
      select: "name",
    });
  res
    .status(StatusCodes.OK)
    .json({ success: true, reviews, count: reviews.length });
};

// ------------------------------------------------------------
const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findById({ _id: reviewId })
    .populate({
      path: "product",
      select: "name company price",
    })
    .populate({
      path: "createdBy",
      select: "name",
    });
  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ success: true, review });
};

// ------------------------------------------------------------
const updateReview = async (req, res) => {
  const {
    params: { id: reviewId },
    body: { rating, title, comment },
  } = req;

  if (!rating || !title || !comment) {
    throw new BadRequestError("Please provide all values");
  }

  const review = await Review.findById({ _id: reviewId });
  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  checkPermissions(req.user, review.createdBy);

  (review.rating = rating), (review.title = title), (review.comment = comment);

  await review.save();

  res.status(StatusCodes.OK).json({ success: true, review });
};

// ------------------------------------------------------------
const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;

  const review = await Review.findById({ _id: reviewId });
  if (!review) {
    throw new NotFoundError(`No review with id: ${reviewId}`);
  }

  checkPermissions(req.user, review.createdBy);

  await review.remove();

  res.status(StatusCodes.OK).json({ success: true, msg: "review deleted" });
};

const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res
    .status(StatusCodes.OK)
    .json({ success: true, reviews, count: reviews.length });
};

export {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
