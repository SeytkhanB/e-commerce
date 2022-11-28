import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnAuthenticatedError } from "../errors/index.js";
import User from "../model/User.js";
import { attachCookiesToResponse, createTokenUser } from "../utils/index.js";

// ------------------------------------------------------------
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new BadRequestError("Please provide all values");
  }

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new BadRequestError("Email already exists!");
  }

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  const tokenUser = createTokenUser(user);

  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({
    success: true,
    user: tokenUser,
  });
};

// ------------------------------------------------------------
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnAuthenticatedError("Unauthorized! User not found");
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new UnAuthenticatedError("Unauthorized! Incorrect password");
  }

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.OK).json({ success: true, user: tokenUser });
};

// ------------------------------------------------------------
const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ success: true, msg: "Logged out!" });
};

export { register, login, logout };
