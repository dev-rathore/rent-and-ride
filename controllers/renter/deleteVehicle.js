const delVehicle = (VehicleModel) => async (req, res) => {
  let data = await VehicleModel.findById({ _id: req.params.id });
  if (data.bookingStatus.isBooked === true) {
    res.send("You can not Delete A Booked Vehicle");
  } else {
    await VehicleModel.findByIdAndDelete({ _id: req.params.id });
    res.redirect("/renter-profile");
  }
};

module.exports = {
  delVehicle,
};
