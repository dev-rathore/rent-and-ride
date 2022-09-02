const getSingleOrder = (OrderModel) => async (req, res) => {
  let data = await OrderModel.findById({ _id: req.params.id });

  // Authorize?

  res.render("rider/single-order", { title: "Order Details", order: data });
};

module.exports = {
  getSingleOrder,
};
