import {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} from "../controllers/orderController.js";
import express from "express";
import { authorizePermissions } from "../middleware/authentication.js";
const router = express.Router();

router
  .route("/")
  .get(authorizePermissions("admin"), getAllOrders)
  .post(createOrder);

router.route("/currUserOrders").get(getCurrentUserOrders);

router.route("/:id").get(getSingleOrder).patch(updateOrder);

export default router;
