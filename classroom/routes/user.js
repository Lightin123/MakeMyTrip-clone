const express = require('express');
const router = express.Router();

router.get("/",(req,res)=>{
    console.log("GET request for users");
    res.send("Users route");
    
})
router.get("/:id",(req,res)=>{
    console.log("GET request for user id");
    
})
router.post("/",(req,res)=>{
    console.log("POST request for users");
    
})
router.delete("/:id",(req,res)=>{
    console.log("DELETE request for user id");
    
})
module.exports = router;