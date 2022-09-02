const getManageOrders = (OrderModel, moment) => async (req, res) => {
  var orders = await OrderModel.find({ status: { $ne: "Completed" } }, null, {
    sort: { createdAt: -1 },
  });

  res.render("admin/orders", {
    title: "Manage Orders",
    order: orders,
    moment: moment,
  });
};

const updateOrderStatus =
  (VehicleModel, OrderModel, eventEmitter) => async (req, res) => {
    let data = JSON.parse(req.body.id);
    let data2 = JSON.parse(req.body.Vehicle);
    // console.log(req.body.id);
    if (req.body.status == "Completed") {
      let doc = await VehicleModel.findByIdAndUpdate(
        { _id: data2 },
        { bookingStatus: { isBooked: false } }
      );
    }
    await OrderModel.findByIdAndUpdate(
      { _id: data },
      { status: req.body.status },
      (err, done) => {
        if (!err) {
          // No Error Occured
          // const eventEmitter = req.app.get("eventEmitter");
          eventEmitter.emit("orderUpdated", {
            id: data,
            // id: req.body.orderId,
            status: req.body.status,
          });
          res.redirect("/admin/dashboard/manage-orders");
        } else {
          console.log(err); // Handling Error
        }
      }
    );
  };

module.exports = {
  getManageOrders,
  updateOrderStatus,
};
