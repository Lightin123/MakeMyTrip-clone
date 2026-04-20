const express = require('express');
const app = express();
const users = require('./routes/user.js');
const cookieParser = require('cookie-parser');


app.use(cookieParser("secret"));
//users routes
console.log(__filename);
app.get("/getcookies",(req,res)=>{
    res.cookie("greet","namaste");
    res.cookie("origin","india");
    res.send("sent you some cookies");
})

app.get("/signedcookies",(req,res)=>{
    res.cookie("Country","India",{signed : true});
    res.send("sent you some cookies");
})

app.use("/users",users);
//posts routes


app.get("/posts",(req,res)=>{
    res.send(req.signedCookies);
    console.log("GET request for posts");
    
})
app.get("/posts/:id",(req,res)=>{
    console.log("GET request for post id");
    
})
app.post("/posts",(req,res)=>{
    console.log("POST request for posts");
    
})
app.delete("/posts/:id",(req,res)=>{
    console.log("DELETE request for post id");
    
})

app.listen(5000,()=>{
    console.log("The server is running")
})