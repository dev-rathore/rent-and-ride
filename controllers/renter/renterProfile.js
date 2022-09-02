const getRenterProfile =
  (VehicleModel, UserModel, OrderModel) => async (req, res) => {
    // var owners = [];
    // var duration = [];
    let vehicleList = await VehicleModel.find({ renterId: req.session.userId });
    // let id = String(req.session.userId);
    // let ownerOrder = await OrderModel.find({ renterId: id });
    // for (let i = 0; i < ownerOrder.length; i++) {
    //   let data = await UserModel.findOne({ _id: ownerOrder[i].riderId });
    //   // console.log(data)
    //   owners[i] = data.username;
    //   duration[i] = ownerOrder[i].time;
    // }

    // await VehicleModel.findByIdAndUpdate(
    //   vehicle._id,
    //   { booked: true },
    //   (err, docs) => {
    //     if (docs) {
    //     } else {
    //       res.send("Error");
    //     }
    //   }
    // );

    res.render("renter/renter-profile", {
      title: "Renter Profile",
      data: vehicleList,
      // owners: owners,
      // duration: duration,
    });
  };

module.exports = {
  getRenterProfile,
};
