import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import User from "../model/User.js";
import {
  attachCookiesToResponse,
  createTokenUser,
  checkPermissions,
} from "../utils/index.js";

// ------------------------------------------------------------
const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  if (!users) {
    throw new NotFoundError("Users not found");
  }

  res.status(StatusCodes.OK).json({ success: true, users });
};

// ------------------------------------------------------------
const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;

  const user = await User.findById({ _id: userId }).select("-password");
  if (!user) {
    throw new NotFoundError(`No user with id: ${userId}`);
  }

  checkPermissions(req.user, user._id); // checking for admin or users themselves
  res.status(StatusCodes.OK).json({ success: true, user });
};

// ------------------------------------------------------------
const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ success: true, user: req.user });
};

// ------------------------------------------------------------
const updateUser = async (req, res) => {
  const {
    body: { name, email },
    user: { userId },
  } = req;

  if (!name || !email) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ _id: userId });
  user.email = email;
  user.name = name;
  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ success: true, user: tokenUser });
};

// ------------------------------------------------------------
const updateUserPassword = async (req, res) => {
  const {
    body: { oldPassword, newPassword },
    user: { userId },
  } = req;

  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ _id: userId });

  const isPasswordMatches = await user.comparePassword(oldPassword);
  if (!isPasswordMatches) {
    throw new BadRequestError("Incorrect password");
  }

  user.password = newPassword;
  await user.save(); // this will also hash password

  res
    .status(StatusCodes.OK)
    .json({ success: true, msg: "User password has been updated!" });
};

export {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
