const getUpdateVehicle = (VehicleModel) => async (req, res) => {
  let data = await VehicleModel.findOne({ _id: req.params.id });
  res.render("renter/update-vehicle", { title: "Update Vehicle", data: data });
};

const postUpdateVehicle = (VehicleModel) => async (req, res) => {
  var id = req.params.user_id;

  await VehicleModel.findByIdAndUpdate(
    { _id: id },
    { $set: req.body },
    { new: true },
    (err, updatedData) => {
      if (!err) {
        res.redirect("/renter-profile");
      } else {
        console.log("can not update data");
      }
    }
  );
};

module.exports = {
  getUpdateVehicle,
  postUpdateVehicle,
};
