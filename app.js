//jshint esversion:6
require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require('body-parser');



const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');



const secret = process.env.SECRET

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static('public'))

app.use(session({
    secret:secret,
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser:true});
// mongoose.set('useCreateIndex', true);


const userSchema = mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {done(null, user);});
passport.deserializeUser(function(user, done) {done(null, user);});



app.get('/',function (req, res) {
    res.render('home')
})

app.get('/login', function (req, res) { 
        res.render('login');
})

app.get('/register', function (req, res) {
        res.render('register');
})



app.get('/secrets', function (req, res) {
    
    if(req.isAuthenticated()){
        res.render('secrets')
    }else{
        res.redirect('login')
    }
})


app.post('/register', function (req, res) {
    const email = req.body.username;
    const password = req.body.password;

    User.register({username:email}, password, function (err, user) {
        if(err){
            console.log(err);
            res.redirect('/register');
        }else{
            passport.authenticate('local')(req, res, function () {
                res.redirect('/secrets')
            })
        }
        
    })

})

app.post('/login',function(req,res) {
    const email = req.body.username;
    const password = req.body.password;

    const user = new User({
        email:email,
        password:password
    });

    req.login(user, function(err) {
        if(err){
            console.log(err);
            res.redirect('/login')
        }else{
            passport.authenticate('local')(req, res, function () {
                res.redirect('/secrets')
            })
        }
        
    })

} )
app.get('/logout', function (req,res) {
    req.logout(function (err) {
        if(!err){
            res.redirect('/')
        }
     });
    
})

app.listen(3000, function (err) {
    if(!err){
        console.log('succesfully lounched on port 3000');
    }else{
        console.log(err);
    }
    
})
