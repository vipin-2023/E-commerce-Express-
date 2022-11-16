var express = require("express");
var router = express.Router();

var productHelper = require("../helpers/product-helpers");

/* GET users listing. */
router.get("/", function (req, res, next) {
  productHelper.getAllProducts().then((products) => {
    console.log(products);
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
        console.log(err);
      } else {
        res.send("product added");
      }
      //ddddddd
    });

    console.log("admin-routes.....");

    console.log("result:" + result.insertedId);
    console.log("..........");
  });
});

module.exports = router;
