import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} from "../controllers/productController.js";
import { getSingleProductReviews } from "../controllers/reviewController.js";
import express from "express";
import {
  authorizePermissions,
  authenticateUser,
} from "../middleware/authentication.js";
const router = express.Router();

router
  .route("/")
  .post([authenticateUser, authorizePermissions("admin")], createProduct)
  .get(getAllProducts);

router
  .route("/uploadImage")
  .post([authenticateUser, authorizePermissions("admin")], uploadImage);

router
  .route("/:id")
  .get(getSingleProduct)
  .patch([authenticateUser, authorizePermissions("admin")], updateProduct)
  .delete([authenticateUser, authorizePermissions("admin")], deleteProduct);

router.route("/:id/reviews").get(getSingleProductReviews);

export default router;
