const getManageVehicles = (VehicleModel) => async (req, res) => {
  let data = await VehicleModel.find();
  res.render("admin/vehicles", { title: "Manage Vehicles", data: data });
};

const deleteVehicle = (VehicleModel) => async (req, res) => {
  await VehicleModel.findByIdAndDelete({ _id: req.params.id });
  res.redirect("/admin/dashboard/manage-vehicles");
};

module.exports = {
  getManageVehicles,
  deleteVehicle,
};
