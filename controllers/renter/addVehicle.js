const getAddVehicle = (req, res) => {
  res.render("renter/add-vehicle", { title: "Add Vehicle", data: "hello" });
};

const postAddVehicle = (VehicleModel, UserModel) => async (req, res) => {
  const {
    vehicleName,
    type,
    gear,
    model,
    vehicleNumber,
    fuel,
    travelled,
    mileage,
  } = req.body;
  if (
    !vehicleName ||
    !type ||
    !vehicleNumber ||
    !gear | !model ||
    !fuel ||
    !travelled ||
    !mileage
  ) {
    req.flash("error", "All fields are required");
    return res.redirect("/renter-profile/add-vehicle");
  }
  let exist = await VehicleModel.findOne({ vehicleNumber });
  if (exist) {
    req.flash("error", "A Vehicle is already uploaded with this number");

    res.render("renter/add-vehicle", { title: "Add Vehicle" });
  } else {
    let renter = await UserModel.findOne({ _id: req.session.userId });

    let newVehicle = new VehicleModel({
      renterId: req.session.userId,
      renterName: renter.username,
      vehicleName: vehicleName,
      type,
      gear,
      model,
      fuel,
      travelled,
      mileage,
      vehicleNumber,
      image: req.file.filename,
    });
    newVehicle
      .save()
      .then(() => res.redirect("/renter-profile"))
      .catch((err) => console.log(err));
  }
};

module.exports = {
  getAddVehicle,
  postAddVehicle,
};
