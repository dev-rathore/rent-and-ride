const getPlaceOrder = (VehicleModel, UserModel) => async (req, res) => {
  let data = await VehicleModel.findById({ _id: req.params.vehicleId });
  res.render("rider/place-order", {
    title: "Place Order",
    data: data,
  });
};

const postPlaceOrder = (UserModel) => async (req, res) => {
  var vehicle = JSON.parse(req.body.vehicle);

  var totalTime;
  var bill;
  if (req.body.start && req.body.end) {
    let date1 = new Date(req.body.start);
    let date2 = new Date(req.body.end);
    var today = new Date().getDate();

    let difference = date2.getTime() - date1.getTime();
    totalTime = Math.ceil(difference / (1000 * 3600 * 24));

    // More correct validation has to be done
    // Mobile number validation has to be done

    if (date1.getMonth() + 1 < new Date().getMonth() + 1) {
      req.flash("error", "Please Enter Valid Date");
      return res.redirect(`/rider-profile/place-order/${vehicle._id}`);
    } else if (totalTime < 0) {
      // return res.render("./rider/err", { title: "Err" });
      req.flash("error", "Please Enter Correct Dates");
      return res.redirect(`/rider-profile/place-order/${vehicle._id}`);
    }

    if (vehicle.type == 2) {
      bill = totalTime * 200;
    } else {
      bill = totalTime * 600;
    }
  }

  let location = req.body.location;
  let mobile = req.body.mobile;

  res.render("rider/confirm-payment", {
    title: "Payment",
    data: vehicle,
    bill: bill,
    location: location,
    mobile: mobile,
    totalDays: totalTime,
  });
};

module.exports = {
  getPlaceOrder,
  postPlaceOrder,
};
