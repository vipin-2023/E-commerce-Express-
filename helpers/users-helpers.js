var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { response } = require("express");
const { ObjectId } = require("mongodb");
const { use } = require("../routes/user");
const Razorpay = require('razorpay');
const { resolve } = require("path");

var instance = new Razorpay({
  key_id: "rzp_test_sdbwALhaZWx0lX" ,
  key_secret: "v7cgRP4Qg39TSkF52yyKEgzu",
});

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      console.log("......userData.........")
      console.log(userData);
      let email = userData.email;
      const doesEmailExist = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email });
        console.log("......doesEmailExist.........")
      console.log(doesEmailExist);
      if (!doesEmailExist) {
        userData.password = await bcrypt.hash(userData.password, 10);
        console.log("......userData.........")
        console.log(userData);

        var dbResponse = await db
          .get()
          .collection(collection.USER_COLLECTION)
          .insertOne(userData);
          console.log("......dbResponse.........")
        console.log(dbResponse);

        if (dbResponse.acknowledged) {
          var user = await db
            .get()
            .collection(collection.USER_COLLECTION)
            .findOne({ _id: dbResponse.insertedId });
            console.log("......user.........")

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
        console.log("......addToCart.........")
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
              console.log("......addToCartData.........")
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
        try{

      
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((data) => {
            data.newFieldAdded = true;
            resolve(data);
          });
        }
        catch(err){
          console.log("cartobj incert problem db(add to cart)")
        }

      }
    });
  },
  placeOrder:(order,products,total)=>{
    return new Promise((resolve,reject)=>{
      console.log("PlaceOrder.......")
      console.log(order,products,total)
      let status = order['payment-method']==="COD"?"placed":'pending'
      let orderObj={
        deliveryDetails:{
          mobile:order.mobile,
          address:order.address,
          pincode:order.pincode
        },
        userId:ObjectId(order.userId),
        paymentMethod:order['payment-method'],
        products:products,
        totalAmount:total,
        status:status,
        date:new Date()
      }
      try{

     
      db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{ 
        db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(order.userId)})
   

        resolve(response.insertedId)
      })
    }catch(err){
      console.log('product helpers ,insert order')
    }
    })


  },
  getCartProductList:(userId)=>{
    return new Promise(async (resolve,reject)=>{
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({
        user:ObjectId(userId)
      })
      resolve(cart)
    })

  },
  getAllCart: (userId) => {
    return new Promise(async (resolve, reject) => {
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
  removeProduct: (prodId, cartId) => {
    console.log("......removeProduct.........")
    console.log(prodId);
    console.log(cartId);
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: ObjectId(cartId) },
          {
            $pull: { products: { item: prodId } },
          }
        )
        .then((data) => {
          resolve(data);
        });
    });
  },getUserOrders:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      let orders= await db.get().collection(collection.ORDER_COLLECTION).find({userId:ObjectId(userId)}).toArray()
      resolve(orders)
    })
  },getOrderProducts:(orderId)=>{
    return new Promise(async (resolve, reject) => {
      let orderItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: {_id: ObjectId(orderId) },
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
      orderItems.map((inside) => {
        newArray.push(inside.cartItems);
      });

      resolve(orderItems);
    });

  },
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
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

          {
            $group: {
              _id:"$cartItems._id",
              total: {
                $sum: { $multiply: ["$quantity", {$toInt:"$cartItems.Price"}] },
              },
            },
          },
          {
            $group: {
              _id:"$cartItems._id",
              total: {
                $sum: "$total" ,
              },
            },
          },
        ])
        .toArray();
      var newArray = [];
      cartItems.map((inside) => {
        newArray.push(inside.cartItems);
      });

      resolve(cartItems);
    });
  },generateRazorpay:(orderId,totalPrice)=>{
    return new Promise((resolve, reject) => {
      instance.orders.create({
        amount: totalPrice*100,
        currency: "INR",
        receipt: ""+orderId
        
      }
      ,
      (error,response)=>{
        if (error) {
         
         reject(error)
        } else {
       
          resolve(response)
        }

      })
      
      
    })

  },verifyPayment:(details)=>{
    return new Promise((resolve,reject)=>{
      const crypto = require('crypto');
      let hmac =crypto.createHmac('sha256','v7cgRP4Qg39TSkF52yyKEgzu')
      hmac.update(details[ 'payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
      hmac=hmac.digest('hex')
      if(hmac==details[ 'payment[razorpay_signature]']){
        resolve()
      }else{
        reject()
      }
    })

  },
  changePaymentStatus:(orderId)=>{
   

               
    return new Promise((resolve,reject)=>{
      db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},{
        $set:{
          status:'placed'
        }
      }).then(()=>{
        resolve()
      })
    })
  },
  changeProductQuantity: (quantityObj) => {
    //quantityObj has 4 value from cart.hbs ajax script

    quantityObj.quantity = parseInt(quantityObj.quantity);

    return new Promise((resolve, reject) => {
      if (quantityObj.quantity == 1 && quantityObj.count == -1) {
        console.log("qty :1 and count:-1");
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: ObjectId(quantityObj.cart),
              "products.item": quantityObj.product,
            },
            {
              $inc: { "products.$.quantity": parseInt(quantityObj.count) },
            }
          )
          .then((data) => {
            resolve(data);
          });
      }
    });
  },
};
