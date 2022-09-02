const getRiderProfile = (VehicleModel) => async (req, res) => {
  let vehicles = await VehicleModel.find({
    bookingStatus: { isBooked: false },
  });
  res.render("rider/rider-profile", { title: "Rider Profile", data: vehicles });
};

module.exports = {
  getRiderProfile,
};
