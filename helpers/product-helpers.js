var db = require("../config/connection");

module.exports = {
  addProduct: (product, callback) => {
    db.get()
      .collection("product")
      .insertOne(product)
      .then((data) => {
        console.log("product-Helpers.....");
        console.log(data);
        console.log(".....");
        callback(data);
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
