var express = require("express");
var router = express.Router();

var productHelper = require("../helpers/product-helpers");

/* GET users listing. */
router.get("/", function (req, res, next) {
  productHelper.getAllProducts().then((products) => {
    res.render("admin/view-products", { products, admin: true });
  });
});

router.get("/add-product", function (req, res) {
  res.render("admin/add-product", { admin: true });
});

router.post("/add-product", (req, res) => {
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
router.get("/delete-product/:id", (req, res) => {
  let proId = req.params.id;

  productHelper.deleteProduct(proId).then((data) => {
    res.redirect("/admin");
  });
});
router.get("/edit-product/:id", (req, res) => {
  productHelper.getProductDetails(req.params.id).then((data) => {
    res.render("admin/edit-product", { data });
  });
});
router.post("/edit-product/:id", (req, res) => {
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
