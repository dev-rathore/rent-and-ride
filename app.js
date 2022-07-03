const express = require('express'); 
const expressLayouts = require('express-ejs-layouts');

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));

app.use(expressLayouts);
app.set('layout', './pages/layout.ejs');
app.set('view engine', 'ejs');

let vehicles = [
  {
    name: 'Audi',
    model: 'Audi A6',
    wheels: 4,
    gear: 'Automatic',
    fuel: 'Diesel',
    travelled: 12_000,
    mileage: 50,
    image: 'audi-a6.jpg',
    isRented: true
  },
  {
    name: 'Hero',
    model: 'Hero Impulse',
    wheels: 2,
    gear: 'Manual',
    fuel: 'Petrol',
    travelled: 10_000,
    mileage: 60,
    image: 'hero-impulse.jpg',
    isRented: false
  },
  {
    name: 'Pulsar',
    model: 'Pulsar 150',
    wheels: 2,
    gear: 'Manual',
    fuel: 'Petrol',
    travelled: 15_000,
    mileage: 55,
    image: 'pulsar-150.png',
    isRented: false
  },
  {
    name: 'Honda',
    model: 'Honda Activa 6G',
    wheels: 2,
    gear: 'Automatic',
    fuel: 'Petrol',
    travelled: 9_000,
    mileage: 50,
    image: 'honda-activa.jpg',
    isRented: true
  }
]

app.get("/", function(req, res){
  res.render('home', {title: 'Rent & Ride'});
});

app.get("/login", function(req, res){
  res.render('login', {title: 'Login'});
});

app.get("/register", function(req, res){
  res.render('register', {title: 'Register'});
});

app.get("/vehicles-list", function(req, res){
  res.render('vehicles-list', {title : 'Vehicles List', vehicles: vehicles});
});

app.get("/vehicles-list/place-order", function(req, res){
  res.render('place-order', {title: 'Place Order'});
});

app.post("/vehicles-list/place-order", function(req, res){
  console.log(req.body);
  res.redirect('/vehicles-list/payment');
});

app.get("/vehicles-list/payment", function(req, res){
  res.render('payment', {title: 'Payment'});
});

app.post("/vehicles-list/payment", function(req, res){
  res.redirect('/vehicles-list/all-rides');
});

app.get("/vehicles-list/all-rides", function(req, res){
  res.render('all-rides', {title: 'All Rides', vehicles: vehicles});
});

app.get("/vehicles-list/all-rides/order-details", function(req, res){
  res.render('order-details', {title: 'Order Details'});
});


/****************** Renter Routes ********************/

app.get("/renter-profile", function(req, res){
  res.render('renter-profile', {title : 'Renter Profile', vehicles: vehicles});
});

app.get("/renter-profile/add-vehicle", function(req, res){
  res.render('add-vehicle', {title: 'Add Vehicle'});
});

app.post("/renter-profile/add-vehicle", function(req, res){
  console.log(req.body);
  res.redirect('/renter-profile');
});

app.listen(8080, function(){
  console.log("Server is listening on port 8080");
});