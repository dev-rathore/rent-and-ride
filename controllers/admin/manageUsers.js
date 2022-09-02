const getManageUsers = (UserModel) => async (req, res) => {
  let data = await UserModel.find();
  res.render("admin/users", { title: "Manage Users", data: data });
};

const deleteUser = (UserModel) => async (req, res) => {
  await UserModel.findByIdAndDelete({ _id: req.params.id });
  res.redirect("/admin/dashboard/manage-users");
};

module.exports = {
  getManageUsers,
  deleteUser,
};
