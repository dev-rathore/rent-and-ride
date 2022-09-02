const getAllOrders = (moment, UserModel, OrderModel) => async (req, res) => {
  await OrderModel.find({ riderId: req.user._id }, async (err, docs) => {
    if (docs) {
      res.render("rider/all-orders", {
        title: "All Orders",
        riderOrders: docs,
        moment: moment,
      });
    } else {
      console.log(err + "Error Fetching Rider Orders");
    }
  });
};

module.exports = {
  getAllOrders,
};
