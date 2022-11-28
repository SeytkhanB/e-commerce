import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";

import dotenv from "dotenv";
import "express-async-errors";

import express from "express";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import notFoundMiddleware from "./middleware/not-found.js";
import connectDB from "./db/connect.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import productRouter from "./routes/productRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import { authenticateUser } from "./middleware/authentication.js";
import fileUpload from "express-fileupload";
dotenv.config();

const app = express();

app.set("trust proxy", 1);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(cors());
app.use(xss());
app.use(helmet());
app.use(mongoSanitize());
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET)); // the "token" is now available from "signedCookies"
app.use(express.static("./public"));
app.use(fileUpload());
app.use(cors());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", authenticateUser, userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", authenticateUser, orderRouter);

app.use(notFoundMiddleware); // order matters
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(port, console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
