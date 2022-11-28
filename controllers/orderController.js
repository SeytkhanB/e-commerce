import { BadRequestError, NotFoundError } from "../errors/index.js";
import Product from "../model/Product.js";
import Order from "../model/Order.js";
import { StatusCodes } from "http-status-codes";
import { checkPermissions } from "../utils/index.js";

// ------------------------------------------------------------
const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};

// ------------------------------------------------------------
const createOrder = async (req, res) => {
  const {
    body: { items: cartItems, tax, shippingFee },
    user: { userId: createdBy },
  } = req;

  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError("No order items provided");
  }

  if (!tax || !shippingFee) {
    throw new BadRequestError("Please provide all values");
  }

  let orderItems = [];
  let subtotal = 0;

  for (let item of cartItems) {
    const dbProduct = await Product.findById({ _id: item.product });
    if (!dbProduct) {
      throw new NotFoundError(`No product with id: ${item.product}`);
    }

    const { _id: product, name, price, image } = dbProduct;

    const singleOrderItem = {
      amount: item.amount,
      name,
      image,
      price,
      product,
    };

    // add item to order
    orderItems = [...orderItems, singleOrderItem];

    // calculate subtotal
    subtotal += item.amount * price;
  }

  // calculate total
  const total = Number((tax + shippingFee + subtotal).toFixed(2));
  console.log("total is: ", total);

  // get fake client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    tax,
    shippingFee,
    subtotal,
    total,
    orderItems,
    createdBy,
    clientSecret: paymentIntent.client_secret,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ success: true, order, clientSecret: order.clientSecret });
};

// ------------------------------------------------------------
const getAllOrders = async (req, res) => {
  const orders = await Order.find({}).populate({
    path: "createdBy",
    select: "name",
  });
  res
    .status(StatusCodes.OK)
    .json({ success: true, orders, count: orders.length });
};

// ------------------------------------------------------------
const getSingleOrder = async (req, res) => {
  const {
    params: { id: orderId },
    user: user,
  } = req;

  const order = await Order.findById({ _id: orderId });
  if (!order) {
    throw new NotFoundError(`No order with id: ${orderId}`);
  }

  checkPermissions(user, order.createdBy);

  res.status(StatusCodes.OK).json({ success: true, order });
};

// ------------------------------------------------------------
const getCurrentUserOrders = async (req, res) => {
  const {
    user: { userId },
  } = req;

  const currentOrders = await Order.find({ createdBy: userId });

  res
    .status(StatusCodes.OK)
    .json({ success: true, currentOrders, count: currentOrders.length });
};

// ------------------------------------------------------------
const updateOrder = async (req, res) => {
  const {
    params: { id: orderId },
    body: { paymentIntentId },
    user: user,
  } = req;

  const order = await Order.findById({ _id: orderId }).populate({
    path: "createdBy",
    select: "name",
  });
  if (!order) {
    throw new NotFoundError(`No order with id: ${orderId}`);
  }

  checkPermissions(user, order.createdBy);

  order.paymentIntentId = paymentIntentId;
  order.status = "paid";

  await order.save();

  res.status(StatusCodes.OK).json({ success: true, order });
};

export {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
