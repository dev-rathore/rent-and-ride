require("dotenv").config(); //this will inject .env variable into this file

const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbSession = require("connect-mongodb-session")(session);

// Models
const UserModel = require("./models/user");
const OrderModel = require("./models/rider/order");
const VehicleModel = require("./models/renter/vehicle");
// const Income = require("./models/renter/income");

const passport = require("passport");
const flash = require("express-flash");

const { init } = require("./auth/auth");
const { islogin, isrenter, isadmin, isrider } = require("./auth/auth");

const multer = require("multer");

const bcrypt = require("bcrypt");

var validator = require("validator");

// Node JS Built-In Module events
const Emitter = require("events"); // Used to emit events

const moment = require("moment");
const { json } = require("express");
//const fast2sms = require('fast-two-sms')

const app = express();
const publicDir = path.join(__dirname, "/public");
app.use(express.static(publicDir));
// app.use(express.static(__dirname + '/public'))
// app.use('public', express.static)//setting public folder as static which means compiler will look all the js and front end fiels in public folder by default
//app.set('views', path.join(__dirname, '/views'))//setting up all the frontend file
app.use(express.urlencoded({ extended: true })); //so we can accces the form input values
app.use(express.json());

app.use(expressLayouts);
app.set("layout", "./pages/layout.ejs");
app.set("view engine", "ejs");

mongoose
  .connect(process.env.MONGO_CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("data base is connected"))
  .catch((err) => console.log(err + "ererer"));

const store = new MongoDbSession({
  uri: process.env.MONGO_CONNECTION_URL,
  collection: "authSession",
});

// Event Emitter
const eventEmitter = new Emitter(); // Setting up the event emiter
app.set("eventEmitter", eventEmitter);

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use((req, res, next) => {
  res.locals.session = req.session; //by req .session we will get the running  session
  res.locals.user = req.user;
  next(); //must to call to get next step of execution
});
init(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// require('./')

var fileStorage = multer.diskStorage({
  destination: "./public/images/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({
  storage: fileStorage,
}).single("image");

// Home Route

app.get("/", (req, res) => {
  res.render("home", { title: "Rent & Ride" });
});

// Login | Register | Logout

const login = require("./controllers/login");
const registeration = require("./controllers/register");

// Get Redirect
const _getRedirect = (req) => {
  if (req.user.role == "admin") {
    req.session.role = "admin";

    return "/admin/dashboard";
  } else if (req.user.role == "renter") {
    req.session.role = "renter";
    return "/renter-profile";
  } else {
    req.session.role = "rider";
    return "/rider-profile";
  }
};

app.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

app.post("/login", login.postLogin(passport, _getRedirect));

// Register
app.get("/register/:role", (req, res) => {
  let role = req.params.role;
  res.render("register", { title: "Register", role: role });
});

app.post("/register", registeration.postRegister(validator, bcrypt, UserModel));

// Logout
app.post("/logout", (req, res) => {
  req.logout();
  delete req.session.role;
  res.redirect("/");
});

// Renter Routes

const renterProfile = require("./controllers/renter/renterProfile");
const addVehicle = require("./controllers/renter/addVehicle");
const updateVehicle = require("./controllers/renter/updateVehicle");
const deleteVehicle = require("./controllers/renter/deleteVehicle");

app.get(
  "/renter-profile",
  islogin,
  isrenter,
  renterProfile.getRenterProfile(VehicleModel, UserModel, OrderModel)
);

app.get("/renter-profile/add-vehicle", islogin, isrenter, (req, res) => {
  addVehicle.getAddVehicle(req, res);
});

app.post(
  "/renter-profile/add-vehicle",
  islogin,
  isrenter,
  upload,
  addVehicle.postAddVehicle(VehicleModel, UserModel)
);

app.get(
  "/renter-profile/update/:id",
  islogin,
  isrenter,
  updateVehicle.getUpdateVehicle(VehicleModel)
);

app.post(
  "/renter-profile/update/:user_id",
  islogin,
  isrenter,
  upload,
  updateVehicle.postUpdateVehicle(VehicleModel)
);

// app.get(
//   "/renter-profile/delete/:id",
//   islogin,
//   isrenter,
//   deleteVehicle.delVehicle(VehicleModel)
// );

app.get("/renter-profile/delete/:id", islogin, isrenter, async (req, res) => {
  let data = await VehicleModel.findById({ _id: req.params.id });
  if (data.bookingStatus.isBooked == true) {
    res.send("You can not Delete A Booked Vehicle");
  } else {
    await VehicleModel.findByIdAndDelete({ _id: req.params.id });
    res.redirect("/renter-profile");
  }
});

// Rider Routes

const riderProfile = require("./controllers/rider/riderProfile");
const placeOrder = require("./controllers/rider/placeOrder");
const confirmPayment = require("./controllers/rider/confirmPayment");
const allOrders = require("./controllers/rider/allOrders");
const singleOrder = require("./controllers/rider/singleOrder");

app.get(
  "/rider-profile",
  islogin,
  isrider,
  riderProfile.getRiderProfile(VehicleModel)
);

app.get(
  "/rider-profile/place-order/:vehicleId",
  islogin,
  placeOrder.getPlaceOrder(VehicleModel, UserModel)
);

app.post(
  "/rider-profile/place-order",
  islogin,
  placeOrder.postPlaceOrder(UserModel)
);

app.post(
  "/rider-profile/confirm-payment",
  //   islogin,
  confirmPayment.postConfirmPayment(
    UserModel,
    VehicleModel,
    OrderModel,
    eventEmitter
  )
);

app.get(
  "/rider-profile/all-orders",
  islogin,
  isrider,
  allOrders.getAllOrders(moment, UserModel, OrderModel)
);

app.get(
  "/rider-profile/all-orders/single-order/:id",
  singleOrder.getSingleOrder(OrderModel)
);

// Admin Routes

const manageVehicles = require("./controllers/admin/manageVehicles");
const manageOrders = require("./controllers/admin/manageOrders");
const manageUsers = require("./controllers/admin/manageUsers");

app.get("/admin/dashboard", isadmin, (req, res) => {
  res.render("admin/dashboard", { title: "Admin Dashboard" });
});

// Manage Orders

app.get(
  "/admin/dashboard/manage-orders",
  isadmin,
  manageOrders.getManageOrders(OrderModel, moment)
);

app.post(
  "/admin/dashboard/manage-orders/update-order-status",
  isadmin,
  manageOrders.updateOrderStatus(VehicleModel, OrderModel, eventEmitter)
);

// Manage Vehicles

app.get(
  "/admin/dashboard/manage-vehicles",
  isadmin,
  manageVehicles.getManageVehicles(VehicleModel)
);

app.get(
  "/admin/dashboard/manage-vehicles/delete-vehicle/:id",
  isadmin,
  manageVehicles.deleteVehicle(VehicleModel)
);

// Manage Users

app.get(
  "/admin/dashboard/manage-users",
  isadmin,
  manageUsers.getManageUsers(UserModel)
);

app.get(
  "/admin/dashboard/manage-users/delete-user/:id",
  isadmin,
  manageUsers.deleteUser(UserModel)
);

// app.get("/profile", islogin, (req, res) => {
//   res.send("you are logged in");
// });

const server = app.listen(80, () => {
  console.log("Server is listening on port 80");
});

// Socket

const io = require("socket.io")(server);

io.on("connection", (socket) => {
  // Private Room
  // Join
  // console.log(socket.id);
  socket.on("join", (orderId) => {
    socket.join(orderId);
    // orderId is a Unique Name receiving from client side file single-order.ejs
    // This .join() is an event emitted from the client
    // Room created with name orderId and joined
  });
});

eventEmitter.on("orderUpdated", (data) => {
  io.to(`order_${data.id}`).emit("orderUpdated", data);
});

eventEmitter.on("orderPlaced", (data) => {
  io.to("adminRoom").emit("orderPlaced", data);
});
