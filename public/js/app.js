// import Noty from 'noty'// Used to send notification

// const initAdmin=require('./admin');

// import moment from "moment";
// const moment = require("moment"); // Correct

let statuses = document.querySelectorAll(".status_line");
let hiddenInput = document.querySelector("#hiddenInput");
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
let time = document.createElement("small");

// Change Order Status

function updateStatus(order) {
  // Correct
  statuses.forEach((status) => {
    status.classList.remove("step-completed");
    status.classList.remove("current");
  });

  let stepCompleted = false;

  statuses.forEach((status) => {
    let dataProp = status.dataset.status;
    if (order.status === "Pending" && dataProp === "Confirmed") {
      status.classList.add("current");
      stepCompleted = true;
    }
    if (!stepCompleted) {
      status.classList.add("step-completed");
    }
    if (dataProp === order.status) {
      stepCompleted = true;

      // time.innerText = moment(order.updatedAt).format("hh:mm A");
      // status.appendChild(time);

      if (status.nextElementSibling) {
        // newElementSibling will return next element
        status.nextElementSibling.classList.add("current");
      }
    }
    // console.log(status);
  });
}
updateStatus(order);

// Socket Client Side
// Imported socket.io in layout.ejs file to access it on front end
// let socket = io(); // Initialized in layout.ejs

// Join customer with their order id
if (order) {
  socket.emit("join", `order_${order._id}`); // Sends a message named as join to the server with data order_uniqueId
}

socket.on("orderUpdated", (data) => {
  const updatedOrder = { ...order }; // Copying object using ...
  // upadatedOrder.updatedAT = moment().format();
  updatedOrder.status = data.status;
  updateStatus(updatedOrder);
  // new Noty({
  //     type: 'success',
  //     timeout: 1000,
  //     text: 'Order Updated',
  //     progressBar: false,
  // }).show();
});

// initAdmin(socket)

// /admin/dashboard/manage-orders/

let adminAreaPath = window.location.pathname;
if (adminAreaPath.includes("admin")) {
  // console.log("in admin path");
  socket.emit("join", "adminRoom"); // Creating room for admin as adminRoom
}
