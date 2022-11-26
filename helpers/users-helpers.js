var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { response } = require("express");
const { ObjectId } = require("mongodb");
const { use } = require("../routes/user");
module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      console.log(userData);
      let email = userData.email;
      const doesEmailExist = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email });
      console.log(doesEmailExist);
      if (!doesEmailExist) {
        userData.password = await bcrypt.hash(userData.password, 10);
        console.log(userData);

        var dbResponse = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .insertOne(userData);
        console.log(dbResponse);

        if (dbResponse.acknowledged) {
          var user = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .findOne({ _id: dbResponse.insertedId });

          console.log(user);

          resolve(user);
        }
      } else {
        resolve(false);
      }
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            resolve({ status: false });
          }
        });
      } else {
        resolve({ status: false });
      }
    });
  },

  addToCart: (proId, userId) => {
    let proObj = {
      item: proId,
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      console.log(userCart);
      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item === proId
        );
        if (proExist == -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId) },
              {
                $addToSet: {
                  products: proObj,
                },
              }
            )
            .then((data) => {
              console.log(data);
              data.newFieldAdded = true;

              resolve(data);
            });


          
        } 
      } else {
        console.log("New user cart");
        let cartObj = {
          user: ObjectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((data) => {
            data.newFieldAdded = true;
            resolve(data);
          });
      }
    });
  },
  getAllCart: (userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(userId);
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },

          { $unwind: "$products" },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $addFields: {
              proId: {
                $convert: {
                  input: "$item",
                  to: "objectId",
                },
              },
            },
          },

          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,

              localField: "proId",
              foreignField: "_id",
              as: "cartItems",
            },
          },
         
          { $unwind: "$cartItems" },
        ])
        .toArray();
      var newArray = [];
      cartItems.map((inside) => {
        console.log(inside);

        newArray.push(inside.cartItems);
      });

      resolve(cartItems);
    });
  },

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },
  changeProductQuantity: (quantityObj) => {
    //quantityObj has 3 value from cart.hbs ajax script
    return new Promise((resolve, reject) => {
      
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          {
            _id:ObjectId(quantityObj.cart),"products.item": quantityObj.product,
          },
          {
            $inc: { "products.$.quantity": parseInt(quantityObj.count) },
          }
        )
        .then((data) => {
          console.log(data);
          data.newFieldAdded = false;
          resolve(data);
        });
    });
  },
};
