var db = require("../config/connection");
var collection = require("../config/collections");
module.exports = {
  addProduct: (request, callback) => {
    let product=request.body
    var type=request.files.image.mimetype.split('/')
    console.log(type[1])
     product.type=type[1]
     
    db.get()
      .collection(collection.PRODUCT_COLLECTION)
      .insertOne(product)
      .then((data) => {
        console.log("product-Helpers.....");
        console.log(data);
        console.log(".....");
        callback(data);
      });
  },
  getAllProducts: () => {
    return new Promise(async(resolve, reject) => {
      let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
      resolve(products)
    });
  },
  imageSaving: (image, result, callback) => {
    try {
      if (image.mimetype === "image/png") {
        image.mv(
          "./public/product-images/" + result.insertedId + ".png",
          (err, done) => {
            callback(err, done);
          }
        );
      } else if (image.mimetype === "image/jpg") {
        image.mv(
          "./public/product-images/" + result.insertedId + ".jpg",
          (err, done) => {
            callback(err, done);
          }
        );
      } else if (image.mimetype === "image/jpeg") {
        image.mv(
          "./public/product-images/" + result.insertedId + ".jpeg",
          (err, done) => {
            callback(err, done);
          }
        );
      }
    } catch (err) {
      console.log("image extension error :" + err);
    }
  },
};
