import { addToCart, getCart, updateNavCartCount } from "../../cart.js";

$(document).ready(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const targetId = urlParams.get('id') ?? "PR001";
  
  function initProductDetail() {
    loadProductData();
    // setupEventListeners();
  }

  function loadProductData() {
    $.ajax({
      url: "./assets/static/products.json",
      method: "GET",
      dataType: "json",
      success: function (response) {
        const product = response.find(product => product.id === targetId);

        if (!product) { 
          console.error("Product not found");
          return;
        }

        // Populate product details
        $('.product-title').text(product.name);
        $('.price-value').text(`Rp${product.price}`);
        $('.product-description').text(product.description);
        $('#mainImage').attr('src', './assets/images/' + product.image + '.jpg');
        $('.product-category').text(product.category);

        $('.specs-table').empty();
        product.technical_specification.forEach(spec => {
          const specRow = $('<tr></tr>');
          specRow.append(`<td>${spec.specName}</td>`);
          specRow.append(`<td>${spec.value}</td>`);
          $('.specs-table').append(specRow);
        });

        $('#addToCart').on('click', function() {
          const productName = $('.product-title').text();
          const productPrice = $('.price-value').text();
          addToCart(product);
          updateNavCartCount(); // Call imported function
          
          Swal.fire({
            title: 'Success!',
            text: `${productName} has been added to your cart for ${productPrice}`,
            icon: 'success',
            confirmButtonText: 'OK'
          });
        });
        
      }
    });
  }

  $("#wishlist").click(function () {
    $(this).toggleClass("active");
    if ($(this).hasClass("active")) {
      alert("Ditambahkan ke wishlist!");
    } else {
      alert("Dihapus dari wishlist!");
    }
  });

  // function setupEventListeners() {
  //   // Example: Add to cart button click event
  //   $('#add-to-cart').on('click', function() {
  //     console.log("Add to cart clicked");
  //     // Logic to add the product to the cart
  //   });
  // }

  // Call the initialization function
  initProductDetail();
  updateNavCartCount(); // Call imported function on initial load
});