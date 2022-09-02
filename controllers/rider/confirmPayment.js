const postConfirmPayment =
  (UserModel, VehicleModel, OrderModel, eventEmitter) => async (req, res) => {
    var vehicle = JSON.parse(req.body.vehicle);
    var vehicleBookingStatus = {};

    // Fetching Rider Name
    await UserModel.findOne({ _id: req.user._id }, (err, foundUser) => {
      if (foundUser) {
        vehicleBookingStatus = {
          isBooked: true,
          riderName: foundUser.username,
          bookingDuration: Number(req.body.totalDays),
        };
      } else {
        console.log(err + "Error Getting User (Rider)");
      }
    });

    await VehicleModel.findByIdAndUpdate(
      vehicle._id,
      { bookingStatus: vehicleBookingStatus },
      (err, doc) => {
        if (doc) {
          // console.log(vehicleBookingStatus);
          // console.log(doc);
          // console.log(vehicle);

          let newOrder = new OrderModel({
            riderId: req.user._id,
            // bookedVehicle: vehicle,
            bookedVehicle: doc,
            bookingDuration: req.body.totalDays,
            bill: req.body.bill,
            mobile: req.body.mobile,
            deliveryAddress: req.body.location,
          });
          newOrder
            .save()
            .then((result) => {
              req.flash("success", "order placed succsesfully");
              // Use req.app.get('eventEmitter') if moving routes
              // const eventEmitter = req.app.get("eventEmitter");
              eventEmitter.emit("orderPlaced", result);
              res.redirect("/rider-profile/all-orders");
            })
            .catch((err) => console.log(err));
        } else {
          res.send("Error occured while confirming order");
        }
      }
    );
  };

module.exports = {
  postConfirmPayment,
};
