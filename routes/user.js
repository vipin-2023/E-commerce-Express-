const { response } = require("express");
var express = require("express");
const { ObjectId } = require("mongodb");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");
const usersHelpers = require("../helpers/users-helpers");
var usersHelper = require("../helpers/users-helpers");

// middleWare
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    if(req.session.user.isAdmin){
      res.redirect('/admin')
    }else{
      next();
    }
   
  } else {
    res.redirect("/login");
  }
};

/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  let cartCount = null;
  console.log(req.session.user)
  if(  req.session.user == undefined || !req.session.user.isAdmin){

  
  if (req.session.user) {
    cartCount = await usersHelper.getCartCount(req.session.user._id);
  }

  productHelper.getAllProducts().then((products) => {
    res.render("user/view-products", { products, user, cartCount });
  });}else{
    productHelper.getAllProducts().then((products) => {
     
      res.render("admin/view-products", { products,user, admin: true });
    });

  }
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

router.get("/cart", verifyLogin, async (req, res) => {
  console.log('first......')
  let data = await usersHelper.getAllCart(req.session.user._id);
  console.log('second......')
  let total = await usersHelper.getTotalAmount(req.session.user._id);
  console.log('3rd......')
  let user = req.session.user;

  res.render("user/cart", { data, user, total });
});

router.get("/add-to-cart/:id",verifyLogin, (req, res) => {
  usersHelper.addToCart(req.params.id, req.session.user._id).then((data) => {
    if (!data.newFieldAdded) {
      res.json({ status: false });
    } else if (data.newFieldAdded) {
      res.json({ status: true });
    }
  });
});
router.post("/change-product-quantity", (req, res, next) => {
  usersHelper.changeProductQuantity(req.body).then((data) => {
    res.json(data);
  });
});

router.get("/remove-product/:proid/:cartid", (req, res) => {
  let proId = req.params.proid;
  let cartId = req.params.cartid;

  usersHelper.removeProduct(proId, cartId).then((data) => {
    console.log("final result...from cart");
    console.log(data);
    res.redirect("/cart");
  });
});

router.get("/place-order", verifyLogin, async (req, res) => {
  console.log("......place-order.........")
  console.log(req.session.user);
  let user = req.session.user;
  console.log("......place-order(req.body).........")
  console.log(req.body)
  let total = await usersHelper.getTotalAmount(user._id);
  console.log("......place-order(total).........")
  console.log(total)

  res.render("user/order-details", { total, user });
});
//post method for placing order
router.post("/place-order", async (req, res) => {
  try {
    var products = await usersHelpers.getCartProductList(req.body.userId);
    var totalPrice = await usersHelpers.getTotalAmount(req.body.userId);
    var price = totalPrice[0].total
  }
  catch (err) {

  }
  usersHelpers.placeOrder(req.body, products, totalPrice[0]).then((orderId) => {
    if (req.body['payment-method'] == 'COD') {
      res.json({ codSuccess: true })

    } else {
      usersHelpers.generateRazorpay(orderId, price).then((response) => {
        
        console.log('... GENERATERAZORPAY response...')

        console.log(response)
        res.json(response)
       
      }).catch((err) => {
        console.log('ERROR..............')
      })
    }
  });
});

//order success routes for displaying message
router.get('/order-success', (req, res) => {
  console.log('checkout .........')
  res.render('user/order-success', { user: req.session.user })
})
//live orders 
router.get('/orders', async (req, res) => {
  let orders = await usersHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders', { user: req.session.user, orders })
})
router.get('/view-order-products/:id', async (req, res) => {
  let products = await usersHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products', { user: req.session.user, products })

})
router.post('/verify-payment', (req, res) => {
  console.log('.........req.body .........')
  console.log(req.body)
  
  usersHelpers.verifyPayment(req.body).then(()=>{
    usersHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({isSuccess:true})
    }).catch((err)=>{
      console.log(err)
      res.json({isSuccess:false});
    })

  })
  
})
module.exports = router;
