const { response } = require("express");
var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
var usersHelper = require("../helpers/users-helpers");

// middleWare
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/", function (req, res, next) {
  let user = req.session.user;
  console.log(`user from ${user}`);
  productHelper.getAllProducts().then((products) => {
    res.render("user/view-products", { products, user });
  });
});
router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login", { loginErr: req.session.loginErr });
    req.session.loginErr = false;
  }
});
router.post("/login", (req, res) => {
  usersHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.loginErr = true;
      res.redirect("/login");
    }
  });
});
router.get("/signup", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/signup",{ signUpErr: req.session.signUpErr });
    req.session.signUpErr = false;
  }
});
router.post("/signup", (req, res) => {
  usersHelper.doSignup(req.body).then((response) => {
    if (response) {
      req.session.loggedIn = true;
      console.log(response.name);
      req.session.user = response;
      res.redirect("/");
    } else {
      req.session.signUpErr = true;
      res.redirect("/signup")
    }
    //  req.session.loggedIn=true
    //  console.log(req.body)
    //  req.session.user=response
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.get("/cart", verifyLogin, (req, res) => {
  res.render("user/cart");
});
router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  console.log(req.session.user._id)
  usersHelper.addToCart(req.params.id,req.session.user._id).then((data)=>{
    res.redirect('/')
  })

})


module.exports = router;
