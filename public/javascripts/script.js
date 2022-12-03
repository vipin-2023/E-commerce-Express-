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

$("#checkout-form").submit((e) => {
  e.preventDefault();
  console.log("checkout......");
  $.ajax({
    url: "/place-order",
    method: "post",
    data: $("#checkout-form").serialize(),
    success: (response) => {
      alert(response);
    },
  });
});

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
  });
}
