var express = require("express");
const { ListCollectionsCursor } = require("mongodb");
var router = express.Router();

var productHelper = require("../helpers/product-helpers");
const usersHelpers = require("../helpers/users-helpers");


// middleWare
const verifyAdmin = (req, res, next) => {
  if (req.session.loggedIn) {
    if (req.session.user.isAdmin) {
      next();
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/login");
  }
};

/* GET users listing. */
router.get("/", verifyAdmin, function (req, res, next) {
  let user = req.session.user;

  productHelper.getAllProducts().then((products) => {
    res.render("admin/view-products", { products, user, admin: true });
  });
});
//users
router.get('/users', verifyAdmin, function (req, res) {
  let user = req.session.user;

  usersHelpers.getAllUsers().then((allUsers) => {


    res.render("admin/users-list", { allUsers, user, admin: true })
  })
})
//orders all 
router.get('/orders', verifyAdmin, function (req, res) {
  let user = req.session.user;
  usersHelpers.getAllOrders().then((allOrders) => {

    console.log(allOrders)
    res.render("admin/view-orders", { user, allOrders,admin:true })
  })
})

router.get("/add-product", verifyAdmin, function (req, res) {
  res.render("admin/add-product", { admin: true });
});

router.post("/add-product", verifyAdmin, (req, res) => {
  productHelper.addProduct(req, (result) => {
    productHelper.imageSaving(req.files.image, result, (err, done) => {
      if (err) {
      } else {
        res.render("admin/add-product", { admin: true });
      }
      //ddddddd
    });
  });
});
router.get("/delete-product/:id", verifyAdmin, (req, res) => {
  let proId = req.params.id;

  productHelper.deleteProduct(proId).then((data) => {
    res.redirect("/admin");
  });
});
router.get("/edit-product/:id", verifyAdmin, (req, res) => {
  productHelper.getProductDetails(req.params.id).then((data) => {
    res.render("admin/edit-product", { data });
  });
});
router.post("/edit-product/:id", verifyAdmin, (req, res) => {
  console.log(" edit post method called");

  productHelper.updateProduct(req.params.id, req.body).then((data) => {
    if (req.files.image) {
      productHelper.imageEditing(
        req.files.image,
        req.params.id,
        (err, done) => {
          res.redirect("/admin");

        }
      );
    } else {
      res.redirect("/admin");
    }
  });
});

module.exports = router;
