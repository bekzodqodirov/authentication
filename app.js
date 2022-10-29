//jshint esversion:6
require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const encrypt = require('mongoose-encryption');


app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static('public'))

mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = mongoose.Schema({
    email: String,
    password: String
});



const secret = process.env.SECRET
userSchema.plugin(encrypt, {secret:secret, encryptedFields:['password']})
const User = mongoose.model('User', userSchema);

app.get('/',function (req, res) {
    res.render('home')
})

app.get('/login', function (req, res) {
        res.render('login');
})

app.get('/register', function (req, res) {
        res.render('register');
})


app.post('/register', function (req, res) {
    const email = req.body.username;
    const password = req.body.password;

    const newUser = User({
        email:email,
        password:password
    })
    newUser.save(function (err) {
        if(!err){
            res.render('secrets')
        }else{
            res.send(err)
        }
    })
})

app.post('/login',function(req,res) {
    const email = req.body.username;
    const password = req.body.password


    User.findOne({email:email}, function (err, foundUser) {
        if(!err){
            if(foundUser){
                if(foundUser.password === password){
                    res.render('secrets');
                }else{
                    res.redirect('/')
                }
                
            }else{
                
                res.redirect('/')
            }
        }
    })
} )



app.listen(3000, function (err) {
    if(!err){
        console.log('succesfully lounched on port 3000');
    }else{
        console.log(err);
    }
    
})
