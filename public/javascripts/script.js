function addToCart(proId) {
  $.ajax({
    url: "/add-to-cart/" + proId,
    method: "get",
    success: (response) => {
      if (response.status) {
        let count = $("#cart-count").html();
        if (count === null) {
          count = 0;
        }
        count = parseInt(count) + 1;
        $("#cart-count").html(count);
      }
    },
  });
}

$(document).ready(()=>{
  $("#checkout-form").submit((e) => {
    
    e.preventDefault();
    console.log("checkout......");
    $.ajax({
      url: "/place-order",
      method: "post",
      data: $("#checkout-form").serialize(),
      success: (response) => {
    
        console.log("............... success")
        console.log(response)
        if (response.codSuccess) {
          location.href = "/order-success"
        } else {
          razorpayPayment(response)
  
        }
      },
    });
  });
});

function razorpayPayment(order) {
  let multilpiedPrice = order.amount * 100

  var options = {
    "key": "rzp_test_sdbwALhaZWx0lX", // Enter the Key ID generated from the Dashboard
    "amount": multilpiedPrice, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "name": "Jio Cart",
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "order_id": order.id, 
    "handler": function (response) {
    
      verifyPayment(response, order)
    },
    "prefill": {
      "name": "Gaurav Kumar",
      "email": "gaurav.kumar@example.com",
      "contact": "9999999999"
    },
    "notes": {
      "address": "Razorpay Corporate Office"
    },
    "theme": {
      "color": "#3399cc"
    }

  };
  var rzp1 = new Razorpay(options);
  rzp1.open();

  function verifyPayment(payment, order) {
    order.amount = order.amount * 100
    $.ajax({
      url: '/verify-payment',
      data: {
        payment,
        order
      },
      method: 'post',
      success: (response) => {
        if (response.isSuccess) {
          location.href = "/order-success"
        }else{
          alert('payment failed')
        }
       
      },
    })
  }

}

function changeQuantity(cartId, proId, count, price) {
  console.log("ajax called....");
  var quantity = parseInt(document.getElementById(proId).innerHTML);

  var newPrice = parseInt(price);
  count = parseInt(count);
  $.ajax({
    url: "/change-product-quantity",
    data: {
      cart: cartId,
      product: proId,
      count: count,
      quantity: quantity,
    },
    method: "post",
    success: (response) => {
      console.log(response.acknowledged);
      var newQty = quantity + count;
      var inTotalQty = newQty * newPrice;

      document.getElementById(proId).innerHTML = newQty;

      var collection = document.getElementsByClassName(proId);
      collection[0].innerHTML = inTotalQty;
      let total = $("#total").html();
      if (count === 1) {
        document.getElementById("total").innerHTML = parseInt(total) + newPrice;
      } else if (count === -1) {
        document.getElementById("total").innerHTML = parseInt(total) - newPrice;
      }
    },
  }
  );
}

function viewImage(event) {
  document.getElementById('image-tag-selected').src = URL.createObjectURL(event.target.files[0])
}

