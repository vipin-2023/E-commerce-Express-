var db = require("../config/connection");
var collection = require("../config/collections");
var objectId = require("mongodb").ObjectId;
module.exports = {
  addProduct: (request, callback) => {
    let product = request.body;
    var type = request.files.image.mimetype.split("/");
    product.Price=product.Price

    product.type = type[1];

    db.get()
      .collection(collection.PRODUCT_COLLECTION)
      .insertOne(product)
      .then((data) => {
        callback(data);
      });
  },
  getProductDetails: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id: objectId(prodId) })
        .then((data) => {
          console.log("...............inside_getProductDetails")
          console.log(data)
          resolve(data);
        });
    });
  },
  deleteProduct: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: objectId(prodId) })
        .then((data) => {
          resolve(data);
        });
    });
  },
  updateProduct: (prodId, prodDetails) => {
    return new Promise((resolve, reject) => {
 
 

      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: objectId(prodId) },
          {
            $set: {
              Name: prodDetails.Name,
              Discription: prodDetails.Discription,
              Price: prodDetails.Price,
              Category: prodDetails.Category,
            },
          }
        )
        .then((data) => {
          console.log("....updateProduct.........")
          console.log(data)
          resolve(data);
        });
    });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let products = await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .find()
          .toArray();
        resolve(products);
      } catch (err) {}
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
    } catch (err) {}
  },
  imageEditing: (image, result, callback) => {
    try {
      if (image.mimetype === "image/png") {
        image.mv(
          "./public/product-images/" + result + ".png",
          (err, done) => {
            callback(err, done);
          }
        );
      } else if (image.mimetype === "image/jpg") {
        image.mv(
          "./public/product-images/" + result + ".jpg",
          (err, done) => {
            callback(err, done);
          }
        );
      } else if (image.mimetype === "image/jpeg") {
        image.mv(
          "./public/product-images/" + result + ".jpeg",
          (err, done) => {
            callback(err, done);
          }
        );
      }
    } catch (err) {}
  },
  
};
