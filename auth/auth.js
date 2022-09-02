const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
// const bcrypt = require("bcryptjs");
const bcrypt = require("bcrypt");

exports.init = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        //defing the srategy and usernameField('emAIL) and getting all email and passwod from form
        //check if email exits

        const user = await User.findOne({ email: email }); //finding user with given email
        if (!user) {
          return done(null, false, { message: "No user with this email" }); //theer is no user returning message will print on front end
        }

        bcrypt.compare(password, user.password).then(
          (
            match //comparing password
          ) => {
            if (match) {
              return done(null, user, { message: "logged in sucessfully" });
              //and this return will go too the authCon.js and postlogin method
            }
            return done(null, false, { message: "Wrong Password" });
            //and this return will go too the authCon.js and postlogin method
          }
        );
      }
    )
  );

  passport.serializeUser(
    (
      user,
      done // Storing the whole user object in session
    ) => {
      done(null, user._id);
      // Saving the user details into session through user._id
    }
  );

  passport.deserializeUser((id, done) => {
    // Getting all the user information from user id
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};

exports.islogin = (req, res, next) => {
  if (req.user) {
    return next();
  } else {
    res.redirect("/login");
  }
};

exports.isrenter = (req, res, next) => {
  if (req.user.role) {
    let session = req.session;
    session.userId = req.user._id;
    if (req.user.role == "renter") {
      return next();
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/login");
  }
};

exports.isrider = (req, res, next) => {
  if (req.user.role) {
    let session = req.session;
    session.userId = req.user._id;
    if (req.user.role == "rider") {
      return next();
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/login");
  }
};

exports.isadmin = (req, res, next) => {
  if (req.user.role) {
    let session = req.session;
    session.userId = req.user._id;
    if (req.user.role == "admin") {
      next();
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/login");
  }
};
