const postConfirmOrder = (UserModel) => async (req, res) => {
  let vehicleInfo = req.body.vehicle;
  var vehicle = JSON.parse(vehicleInfo);
  let vehicleOwner = await UserModel.findOne({ _id: vehicle.renterId });

  var totalTime;
  var bill;
  if (req.body.start && req.body.end) {
    let date1 = new Date(req.body.start);
    let date2 = new Date(req.body.end);
    var today = new Date().getDate();

    if (
      date1.getMonth() < new Date().getMonth() + 1 ||
      date1.getDate() < today
    ) {
      req.flash("error", "Please Enter Valid Date");
      return res.render("rider/place-order", {
        title: "Place Order",
        data: vehicle,
        vehicleOwner,
      });
    }

    let difference = date2.getTime() - date1.getTime();
    totalTime = Math.ceil(difference / (1000 * 3600 * 24));
    if (totalTime < 0) {
      // return res.render("./rider/err", { title: "Err" });
      req.flash("error", "Please Enter Correct Dates");
      return res.render("rider/place-order", {
        title: "Place Order",
        data: vehicle,
        vehicleOwner,
      });
    }
    if (vehicle.type == 2) {
      bill = totalTime * 200;
    } else {
      bill = totalTime * 600;
    }
  }

  let location = req.body.location;
  let mobile = req.body.mobile;

  res.render("rider/confirm-order", {
    title: "Payment",
    data: vehicle,
    bill: bill,
    location: location,
    mobile: mobile,
    totalDays: totalTime,
  });
};

module.exports = {
  postConfirmOrder,
};
