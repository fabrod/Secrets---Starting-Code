//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

//mongodb connection with mongoose @ localhost with database name userDB
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true})

//nosql schema object mongoose schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//defining our secret ? in env file/ scret key // if real app a big nono
//const secret = "Thisisourlittlesecret.";  //if real app a big nono
//process.env.SECRET   //if real app a big nono
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"] }); // encript only certain fields with the mongoose plug in if multiple fields add a coma to the array


//calling my userSchema object and const User as the first param
const User = new mongoose.model("User", userSchema);

//routes
//home route
app.get("/", function(req, res){
    res.render("home");
})

//login route
app.get("/login", function(req, res){
    res.render("login");
})

//register route
app.get("/register", function(req, res){
    res.render("register");
})
/*
//app.get 
app.get("/secrets", function(req, res){
    if (req.isAuthenticated()){
        res.render("secrets");
    } else {
        res.redirect("/login");              
    }
});

//app.get redirect back to the log in page
app.get("/submit", function(req, res){
    if (req.isAuthenticated()){
        res.render("submit");
    } else {
        res.redirect("/login");
    }
});
//app.get logout route to home page /

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
})

*/


//post
//register post route creating a new user , getting the input name and input password from register.ejs post form
app.post("/register", function(req, res){
    const newUser = new User ({
        email: req.body.username,
        password: req.body.password
    });
//if our user has been created succesfully in our database, then user will have access to the  secrets.ejs page 
// when creating new user  .SAVE documents are encrypted and then signed
newUser.save(function(err){
    if (err) {
        console.log(err);
    }else {
        res.render("secrets");
    }
  });

});

//login post route  our log in users in the database
app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    

//findOne with matching user name and password in the database plus our email field is matching the username field
//During FIND docs are authenticated and then decrypted to see if user can log in 
User.findOne({email: username}, function(err, foundUser){
    if (err) {
        console.log(err);
    } else {
        if (foundUser) {
          if (foundUser.password === password) {
              res.render("secrets");//page to render secrets  if username and password is a match when they log in
          }
        }
    }

  });

});



app.listen(3000, function() {
    console.log("Server started in port 3000.");
});
