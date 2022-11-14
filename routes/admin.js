var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  let products = [
    {
      name: "iphone 9",
      category: "smartphone",
      price: "60,000",
      discription:
        "Why Apple is the best place to buy iPhone. You can choose a payment option that works for you, pay less with a trade‑in, connect your new iPhone to your ...",
      imageUrl: "https://m.media-amazon.com/images/I/61IJBsHm97L._SL1500_.jpg",
    },
    {
      name: "iphone 9",
      category: "smartphone",
      price: "60,000",
      discription:
        "Why Apple is the best place to buy iPhone. You can choose a payment option that works for you, pay less with a trade‑in, connect your new iPhone to your ...",
      imageUrl: "https://m.media-amazon.com/images/I/61IJBsHm97L._SL1500_.jpg",
    },
    {
      name: "iphone 9",
      category: "smartphone",
      price: "60,000",
      discription:
        "Why Apple is the best place to buy iPhone. You can choose a payment option that works for you, pay less with a trade‑in, connect your new iPhone to your ...",
      imageUrl: "https://m.media-amazon.com/images/I/61IJBsHm97L._SL1500_.jpg",
    },
    {
      name: "iphone 2",
      category: "smartphone",
      price: "20,000",
      discription:
        "Why Apple is the best place to buy iPhone. You can choose a payment option that works for you, pay less with a trade‑in, connect your new iPhone to your ...",
      imageUrl: "https://m.media-amazon.com/images/I/61IJBsHm97L._SL1500_.jpg",
    },
    {
      name: "iphone 9",
      category: "smartphone",
      price: "60,000",
      discription:
        "Why Apple is the best place to buy iPhone. You can choose a payment option that works for you, pay less with a trade‑in, connect your new iPhone to your ...",
      imageUrl: "https://m.media-amazon.com/images/I/61IJBsHm97L._SL1500_.jpg",
    },
  ];
  res.render("admin/view-products", { products, admin: true });
});
router.get("/add-product", function (req, res) {
  res.render("admin/add-product", { admin: true });
});
router.post("/add-product",(req,res)=>{
  console.log(req.body)
  console.log(req.files.image)

})

module.exports = router;
