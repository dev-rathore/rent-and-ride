
var days = document.querySelector("#days");
var hours = document.querySelector("#hours");
var daysDiv = document.querySelector(".days");
var hoursDiv = document.querySelector(".hours");

days.onclick = () => {
  if(days.checked){
    daysDiv.style.display = 'block';
    hoursDiv.style.display = 'none';
    document.querySelectorAll(".time")[0].value = '';
    document.querySelectorAll(".time")[1].value = '';
  }
}

hours.onclick = () => {
  if(hours.checked){
    daysDiv.style.display = 'none';
    hoursDiv.style.display = 'block';
    document.querySelectorAll(".date")[0].value = '';
    document.querySelectorAll(".date")[1].value = '';
  }
}

