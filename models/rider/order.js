const mongoose = require("mongoose");
const sc = mongoose.Schema(
  {
    riderId: { type: Object, required: true },

    bookedVehicle: { type: Object, required: true },
    bookingDuration: { type: Number, required: true },
    bill: { type: Number, required: true },
    status: { type: String, required: true, default: "Pending" },
    deliveryAddress: { type: String, required: true },
    mobile: { type: Number, required: true },
  },
  { timestamps: true }
); //storing time;

const Order = mongoose.model("order", sc);
module.exports = Order;
