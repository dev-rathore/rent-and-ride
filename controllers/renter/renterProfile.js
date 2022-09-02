const getRenterProfile =
  (VehicleModel, UserModel, OrderModel) => async (req, res) => {
    let vehicleList = await VehicleModel.find({ renterId: req.session.userId });
    let renter = await UserModel.findById({ _id: req.session.userId });

    res.render("renter/renter-profile", {
      title: "Renter Profile",
      data: vehicleList,
      renterName: renter.username,
    });
  };

module.exports = {
  getRenterProfile,
};
