const mongoose = require("mongoose");
const Sc = mongoose.Schema({
  renter_id: { type: Object, required: true },
  totalIncome: { type: Number, default: 0 },
});
const Income = mongoose.model("income", Sc);
module.exports = Income;
