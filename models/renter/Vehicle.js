const mongoose = require("mongoose");
const sc = mongoose.Schema({
  renterId: { type: Object, required: true },
  renterName: { type: String, required: true },
  vehicleName: { type: String, required: true },
  type: { type: Number, required: true },
  gear: { type: String, required: true },
  model: { type: String, required: true },
  fuel: { type: String, required: true },
  travelled: { type: Number, required: true },
  mileage: { type: Number, required: true },
  vehicleNumber: { type: Number, required: true },
  image: { type: String, required: true },
  bookingStatus: { type: Object, default: { isBooked: false }, required: true },
});
const Model = mongoose.model("VehicleInfo", sc);
module.exports = Model;
