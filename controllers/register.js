const postRegister = (validator, bcrypt, UserModel) => async (req, res) => {
  const { username, email, password, role } = req.body;
  // Validate request
  if (!username || !email || !password) {
    req.flash("error", "All Fields are required");
    req.flash("username", username);
    req.flash("email", email);
    return res.redirect(`/register/${role}`);
  }
  var right = false;
  if (!right) {
    if (!validator.isAlpha(req.body.username)) {
      req.flash(
        "error",
        "Invalid Name, it should not contain a number or a symbol"
      );
      return res.redirect(`/register/${role}`);
    }
    if (!validator.isEmail(req.body.email)) {
      req.flash("error", "Invalid Email");
      return res.redirect(`/register/${role}`);
    }
    if (!validator.isStrongPassword(req.body.password)) {
      req.flash(
        "error",
        "Password must be of 8 characters and it must contain a capital letter, a number and a special character"
      );
      return res.redirect(`/register/${role}`);
    }
    right = true;
  }

  let user = await UserModel.findOne({ email });
  if (user) {
    req.flash("error", "Email already taken");

    res.render("register", { title: "Register", role: role });
  } else {
    const hashpw = await bcrypt.hash(req.body.password, 10);

    let newUser = new UserModel({
      username: username,
      email: email,
      password: hashpw,
      role: role,
    });

    newUser
      .save()
      .then(() => {
        res.redirect("/login");
      })
      .catch((err) => console.log(err));

    // For Income

    //   .then(async (user) => {
    //     if (user) {
    //       if (role == "renter") {
    //         await UserModel.findOne({ email: req.body.email }, (err, doc) => {
    //           let newRenter = new Income({
    //             r_id: doc._id,
    //             Income: 0,
    //           });
    //           newRenter
    //             .save()
    //             .then()
    //             .catch((err) => console.log(err));
    //         });
    //       }
    //     }
    //     res.redirect("/login");
    //   })
    // .catch((err) => console.log(err));
  }
};

module.exports = {
  postRegister,
};
