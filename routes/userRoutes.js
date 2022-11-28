import {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} from "../controllers/userController.js";
import express from "express";
import { authorizePermissions } from "../middleware/authentication.js";

const router = express.Router();

router.get("/", authorizePermissions("admin"), getAllUsers);
router.get("/currUser", showCurrentUser);
router.patch("/updateUser", updateUser);
router.patch("/updateUserPassword", updateUserPassword);
router.get("/:id", getSingleUser); // should be under all of others. order matters

export default router;
