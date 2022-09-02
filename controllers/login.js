const postLogin = (passport, _getRedirect) => (req, res) => {
  const { email, password } = req.body;
  // Validate request
  if (!email || !password) {
    req.flash("error", "All Fields are required");
    return res.redirect("/login");
  }
  passport.authenticate(
    "local",
    (
      err,
      user,
      info //this will call the init function in passport js
    ) => {
      if (err) {
        req.flash("error", info.message);
        return next(err);
      }
      if (!user) {
        req.flash("error", info.message);

        return res.redirect("/login");
      }
      req.login(user, (err) => {
        //deserialixeing user here
        if (err) {
          req.flash("error", info.message);
          console.log("errore");
          return next(err);
        }

        return res.redirect(_getRedirect(req)); //calling function to check the role
      });
    }
  )(req, res);
};

module.exports = {
  postLogin,
};
