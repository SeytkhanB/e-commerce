import {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { authenticateUser } from "../middleware/authentication.js";
import express from "express";
const router = express.Router();

router.route("/").get(getAllReviews).post(authenticateUser, createReview);

router
  .route("/:id")
  .get(getSingleReview)
  .patch(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReview);

export default router;
