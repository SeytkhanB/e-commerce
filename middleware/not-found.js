const notFoundMiddleware = (req, res) => {
  res.status(404).json({ success: false, msg: "Route doesn't exits" });
};

export default notFoundMiddleware;
