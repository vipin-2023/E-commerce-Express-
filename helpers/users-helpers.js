var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { response } = require("express");
const { ObjectId } = require("mongodb");
module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      console.log(userData);
      let email=userData.email
      const doesEmailExist = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ email });
      console.log(doesEmailExist)
      if(!doesEmailExist){
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

      }else{
        resolve(false)

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
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      console.log(userCart);
      if (userCart) {
        console.log("Old user");
        db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId) },
              {
                $addToSet: {
                  products: ObjectId(proId),
                },
              }
            ).then((data) => {

              console.log(data)
              resolve(data.acknowledged)
            }) 
      } else {
        console.log("New user cart")
        let cartObj = {
          user: ObjectId(userId),
          products: [ObjectId(proId)],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve(response);
          });
      }
    });
  },
};
