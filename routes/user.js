const { response } = require("express");
var express = require("express");
const { ObjectId } = require("mongodb");
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
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  
  let cartCount = null;
  if (req.session.user) {
    cartCount = await usersHelper.getCartCount(req.session.user._id);
  }
  productHelper.getAllProducts().then((products) => {
    res.render("user/view-products", { products, user, cartCount });
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
    res.render("user/signup", { signUpErr: req.session.signUpErr });
    req.session.signUpErr = false;
  }
});
router.post("/signup", (req, res) => {
  usersHelper.doSignup(req.body).then((response) => {
    if (response) {
      req.session.loggedIn = true;
    
      req.session.user = response;
      res.redirect("/");
    } else {
      req.session.signUpErr = true;
      res.redirect("/signup");
    }
   
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.get("/cart", verifyLogin, (req, res) => {
  usersHelper.getAllCart(req.session.user._id).then((data) => {
    let user = req.session.user;
    console.log(data)
   

    res.render("user/cart", { data, user });
  });
});
router.get("/add-to-cart/:id", (req, res) => {
  usersHelper.addToCart(req.params.id, req.session.user._id).then((data) => {
  
    if (!data.newFieldAdded) {
      res.json({ status: false });
    } else if (data.newFieldAdded) {
      res.json({ status: true });
    }
  });
});
router.post("/change-product-quantity",(req,res,next)=>{
  console.log(req.body)
  usersHelper.changeProductQuantity(req.body).then(()=>{

  })
})


module.exports = router;
