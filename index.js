const axios = require('express')
const express = require('express')

const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session');
const MongoDbSession = require('connect-mongodb-session')(session)
const Model = require('./models/User')
const vehicleModel = require('./models/renter/Vehicle')
const Order = require('./models/booker/order')
const Income=require('./models/renter/income')
const passport = require('passport');
const flash = require('express-flash');
const { init } = require('./Authentication/passport');
const { islogin, isrenter, isadmin,isrider } = require('./Authentication/passport');
const multer = require('multer');
const bcrypt=require('bcrypt')//using to compare hashpw
var validator = require('validator');
const Emitter=require('events');//this is used to emit events
const moment=require('moment');
const { json } = require('express');
const app = express();
app.use(express.static(__dirname + '/public'))
mongoose.connect("mongodb://localhost:27017/college", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).then(() => console.log("data base is connected")).catch((err) => console.log(err + "ererer"))

app.use('public', express.static)//setting public folder as static which means compiler will look all the js and front end fiels in public folder by default
const store = new MongoDbSession({
    uri: 'mongodb://localhost:27017/college',
    collection: 'authSession'
})
const eventEmitter = new Emitter() //setting up the event emiter 
app.set('eventEmitter',eventEmitter)

app.use(session({
    secret: "my name is harsh roop rai",
    resave: false,
    saveUninitialized: false,
    store: store,
}))
init(passport)
app.use(passport.initialize())
app.use(passport.session())
app.use(flash());
app.set('views', path.join(__dirname, '/views'))//setting up all the frontend file
app.use(express.urlencoded({ extended: false }));//so we can accces the form input values
app.use(expressLayouts);
app.set('layout', './pages/layout.ejs');
app.set('view engine', 'ejs')
app.use(express.json())
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./images");
    },
    filename: (req, file, cb) => {
        cb(null, "/" + Date.now() + "---" + file.originalname)
    },
});
const upload = multer({ storage: fileStorage });


app.get('/dashboard', isadmin, (req, res) => {
    res.render('./admin/Dashboard')
})
app.get('/dashboard/manageorders', isadmin, async (req, res) => {
    var orders = await Order.find({ status: { $ne: 'Completed' } }, null, { sort: { 'createdAt': -1 }})

    res.render('./admin/Orders', { order: orders,moment:moment })
})
app.post('/updateStatus', isadmin,async (req, res) => {
    let data = JSON.parse(req.body.id)
   let data2= JSON.parse(req.body.Vehicle)

if(req.body.status == 'Completed'){
   let doc= await vehicleModel.findByIdAndUpdate({_id:data2},{booked:false})
}
    await Order.findByIdAndUpdate({ _id: data }, { status: req.body.status}, (err, done) => {
        if (!err) {
           eventEmitter.emit('orderUpdated',{id:data,status:req.body.status})

            res.redirect('/dashboard/manageorders')
        }
    })


})
app.get('/dashboard/managevehicles', isadmin, async (req, res) => {
let data = await vehicleModel.find()
    res.render('./admin/Vehicles', { data: data })
})
app.get('/dashboard/manageuser', isadmin, async (req, res) => {
    let data = await Model.find()

    res.render('./admin/User', { data: data })
})
app.get('/dashboard/delete/:id', isadmin, async (req, res) => {
    await vehicleModel.findByIdAndDelete({ _id: req.params.id })
    res.redirect('/dashboard/managevehicles')
})
app.get('/dashboard/delete/user/:id', isadmin, async (req, res) => {
    await Model.findByIdAndDelete({ _id: req.params.id })
    res.redirect('/dashboard/manageuser')
})

app.get('/profile', islogin, (req, res) => {
    res.send("you are logged in")
})

//renter routes
app.get('/Add', islogin, isrenter, (req, res) => {

    res.render('./renter/VehicleInfo', { data: "hello" })
})
app.post('/Add', islogin, isrenter, upload.single("image"), async (req, res) => {
    const { VehicleName, VehicleType, model, VehicleNumber,Fuel,Travelled,Mileage } = req.body
    if(!VehicleName || !VehicleType || !VehicleNumber || !model || !Fuel || !Travelled || !Mileage) {
        req.flash('error', 'All fields are required')
        return res.redirect('/Add')
    }
    let exits = await vehicleModel.findOne({ VehicleNumber })
    if (exits) {
        req.flash('error','A Vehicle is Already Rented with this number') 

        res.render('./renter/VehicleInfo')
    }
    else {
        let newVehicle = new vehicleModel({
            r_id: req.session.r_id,
            VehicleName: VehicleName,
            VehicleType: VehicleType,
            model:model,
            Fuel:Fuel,
            Travelled:Travelled,
            Mileage:Mileage,
            VehicleNumber: VehicleNumber,
            image: req.file.path
        })
        newVehicle.save().then(() => res.redirect('/my-vehicles')).catch((err) => console.log(err))

    }

})
app.get('/update/:id', islogin, isrenter, async (req, res) => {
    let data = await vehicleModel.findOne({ _id: req.params.id })
    res.render('./renter/Update', { data: data })
})
app.post('/update', islogin, isrenter, async (req, res) => {

    var id = JSON.parse(req.body.id)

    await vehicleModel.findByIdAndUpdate({ _id: id }, req.body, { new: true }, (err, doc) => {
        if (!err) {
            res.redirect('/my-vehicles');
        }
        else {
            console.log("can not update data");
        }
    })

})
app.get('/delete/:id', islogin, isrenter, async (req, res) => {
    let data = await vehicleModel.findById({ _id: req.params.id })
    if (data.booked == true) {

        res.send("You can not Delete A Boooked Vehicle")
    }
    else {

        await vehicleModel.findByIdAndDelete({ _id: req.params.id })
        res.redirect('/my-vehicles')
    }
})

app.get('/my-vehicles', islogin, isrenter, async (req, res) => {
var owners=[]
var duration=[]
    let list = await vehicleModel.find({ r_id: req.session.r_id })
   let id=String(req.session.r_id)
    let ownerOrder=await Order.find({r_id:id})
    for (let i = 0; i < ownerOrder.length; i++) {
        let data=await Model.findOne({_id:ownerOrder[i].user_id})
        console.log(data)
        owners[i]=data.username
        duration[i]=ownerOrder[i].time;
    }
    res.render('./renter/MyVehicles', { data: list,owners:owners,duration:duration})
    

});

const _getRedirect=(req)=>
  {
    if (req.user.role == 'admin') {
       
    
        return '/dashboard'
        }
        else if (req.user.role == 'renter') {
                return '/my-vehicles'
       
        }
        else {
    
            return '/vehicles'
        }
    
  }

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res) => 
{ 
    const { email, password }   = req.body
    // Validate request 
     if(!email || !password) {
         req.flash('error', 'All fields are required')
         return res.redirect('/login')
     } 
     passport.authenticate('local',(err,user,info)=>//this will calll the init function in passport js
       {

        if(err)
        {
          req.flash('error', info.message )
          return next(err) ;
        }
        if(!user)
        {
          req.flash('error', info.message )

          return res.redirect('/login')

        }
        req.login(user,(err)=>{//deserialixeing user here 
          if(err)
          {
            req.flash('error', info.message ) 
            console.log("errore")
            return next(err)

          }
          return res.redirect(_getRedirect(req))//caalling function to check the role
        })
       })(req,res)
})
app.get('/',(req,res)=>{
    res.render('Home')


})

app.get('/register/:role',(req,res)=>{
    let role=req.params.role
    res.render('index',{role:role})
})
app.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body
    // Validate request 
    if(!username || !email || !password) {
        req.flash('error', 'All fields are required')
        req.flash('username', username)
        req.flash('email', email)
       return res.redirect(`/register/${role}`)
    }
   var right=false;
   if(!right)
   {
    if(!validator.isAlpha(req.body.username)){
        req.flash('error','invalid name should not contain a number or symbol') 
       return  res.redirect(`/register/${role}`)

    } 
    if(!validator.isEmail(req.body.email)){
        req.flash('error','invalid email') 
        return  res.redirect(`/register/${role}`)
 
    }
    if(!validator.isStrongPassword(req.body.password)){
        req.flash('error','password must contain capital letter,a number,a special character') 
        return  res.redirect(`/register/${role}`)
    }
    right=true
   }
   
    let user = await Model.findOne({ email })
    if (user) {
        req.flash('error', 'Email already taken')
      
        res.render('index',{role:role})
    }
    else {
              const hashpw=await bcrypt.hash(req.body.password,10)
          
        let newUser = new Model({
            username: username,
            email: email,
            password: hashpw,
            role: role
        })
        newUser.save().then( async(user)=>{
                if(user)
            {
                if(role == 'renter'){
                    await Model.findOne({email:req.body.email},(err,doc)=>{
                        let newRenter=new Income({
                            r_id:doc._id,
                            Income:0
                        })
                        newRenter.save().then().catch((err) => console.log(err))
                    })
                    
                                    }
                                }
              res.redirect('/login')
        }).catch((err) => console.log(err))
     
    }
})

//booker routes
app.get('/vehicles',isrider, async (req, res) => {
    let vehicles = await vehicleModel.find({ booked: false });
    res.render('./booker/vehicles', { data: vehicles })
})  
app.post('/order', islogin, async (req, res) => {
    let my = req.body.vehicle;
    let data = JSON.parse(my)
    let owner = await Model.findOne({ _id: data.r_id })
    res.render('./booker/Order', { data: data, owner: owner })

})
app.post('/confirm-order', (req, res) => {
    let my = req.body.vehicle;
var TotalTime
var bill;
    if(req.body.start && req.body.end)
    {

    
        let date_1 = new Date(req.body.start);
        let date_2 = new Date(req.body.end);
        let difference = date_2.getTime() - date_1.getTime();
         TotalTime = Math.ceil(difference / (1000 * 3600 * 24));
         
         bill=TotalTime*700;
        if(TotalTime<0)
        {
            return  res.render('./booker/err')
         }
}

    let location=req.body.location;
    let mobile=req.body.mobile
    var vehicle = JSON.parse(my)

     res.render('./booker/orderSummry',{data:vehicle,bill:bill,location:location,mobile:mobile,TotalDays:TotalTime})

})
app.post('/placeOrder',async(req,res)=>{
    let my = req.body.vehicle;
    var vehicle = JSON.parse(my)

    await vehicleModel.findByIdAndUpdate(vehicle._id, { booked: true }, (err, docs) => {
        if (docs) {
            vehicle.booked = true
            let newOrder = new Order({
                user_id: req.user._id,
                r_id:vehicle.r_id,
                booked_vehicle: vehicle,
                time: req.body.TotalDays,
                bill: req.body.bill,
                mobile:req.body.mobile,
                location:req.body.location
            })
            newOrder.save().then(result =>{
                req.flash('success','order placed succsesfully')
                //use req.app.get('eventEmitter') if moving routs
              eventEmitter.emit ('orderPlaced',result);
            res.redirect('/All-orders')

            }).catch((err) => console.log(err))

        }
        else {
            res.send("some errore")
        }
    })

})
app.get('/All-orders', islogin, isrider,async (req, res) => {
    var vehicles = new Array();
    var owners = new Array();
    await Order.find({ user_id: req.user._id }, async (err, orders) => {
        if (orders) {
            for (i = 0; i < orders.length; i++) {
                vehicles[i] = orders[i].booked_vehicle


            }
        }


        for (let i = 0; i < vehicles.length; i++) {
            await Model.findOne({ _id: vehicles[i].r_id }, (err, doc) => {
                if (doc) {

                    owners[i] = doc.username
                }
                else {
                    console.log(err + "errrrr")
                }
            })

        }
        var data = new Array()
        data['h'] = orders;
        data['a'] = vehicles;
        data['b'] = owners;

        res.render('./booker/AllOrders', { data: data,moment:moment })
    })

})

app.get('/singelorder/:id',async(req, res) => {
   let data=await Order.findById({_id:req.params.id})
   // Join 
     res.render('./booker/singelOrder',{data:data})
})


 
const server = app.listen(80, () => {
    console.log("Server has been started");
})
const io=require('socket.io')(server)
io.on('connection',(socket)=>{
    //join   
    socket.on ('join' , ( orderId ) => {
        socket.join (orderId)
        } )
        

})
eventEmitter.on('orderUpdated',(data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated',data)
    })
 eventEmitter.on ('orderPlaced',(data) =>
 {

     io.to ('adminRoom').emit('orderPlaced',data)
    })
