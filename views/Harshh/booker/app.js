import axios from 'axios'
console.log("script running");
let book = document.querySelectorAll('.book')//btn to add a pizza into a cart defiend in home.ejs
book.forEach((btn) => {//looping from array of add to btn
    btn.addEventListener('click', (e) => { //this will give us the one  btn on user have clickded
        let vehicle = JSON.parse(btn.dataset.vehicle)//dataset will give the detals of particular pizza user have clicked ob
            console.log("making post request")
        
            axios.post('/order',vehicle).them(res =>{
                console.log('succsess')
            }).catch(err=>{
                console.log(err)
            })
    })
})