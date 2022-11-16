const { response } = require("express");
var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
var usersHelper = require("../helpers/users-helpers");

/* GET home page. */
router.get("/", function (req, res, next) {
  productHelper.getAllProducts().then((products) => {
    console.log(products);
    res.render("user/view-products", { products, admin: false });
  });
  
  
});
router.get('/login',(req,res)=>{
  res.render('user/login')
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  usersHelper.doSignup(req.body).then((response)=>{
    res.send("login")
    console.log(response)
  })
  


})
module.exports = router;
