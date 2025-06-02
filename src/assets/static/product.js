import { addToCart, getCart, updateNavCartCount } from '../../cart.js';
let products = [];

const fetchProducts = async () => {
  const response = await fetch('./assets/static/products.json');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  products = data;
  renderProducts(products);
}

updateNavCartCount();

fetchProducts().catch((error) => {
    console.error('Error fetching products:', error);
  }
);

const currencyFormatter = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value);
};

const imageLinkProcessor = (imageLink) => {
  const decodedImagePath = imageLink;
  // const decodedImagePath = decodeURIComponent(imageLink);
  return "./assets/images/" + decodedImagePath + ".jpg";
}

const filterProducts = (category) => {
  const filteredProducts = products.filter((product) => {
    return product.category.trim().toLowerCase() === category.trim().toLowerCase();
  });
  renderProducts(filteredProducts);
  return filteredProducts;
}

const applyFilterBtn = document.querySelector('#apply-filter-btn');
applyFilterBtn.addEventListener('click', () => {
  const productCountEl = document.querySelector('.product-section-count');
  
  const selectedCategory = document.querySelector('#category-select').value;
  if (selectedCategory) {
    let filteredProducts = filterProducts(selectedCategory);
    productCountEl.innerHTML = `<span>${filteredProducts.length} Products Found</span>`;
  } else {
    renderProducts(products);
    productCountEl.innerHTML = `<span>Showing all products</span>`;
  }
});

const renderProducts = (products) => {
  const productGridEl = document.querySelector('.product-grid');
  productGridEl.innerHTML = '';
  products.forEach((product) => {
    const productCard = document.createElement('div');
    productCard.classList.add('product');
    productCard.classList.add('card');
    productCard.id = product.id;
    productCard.dataset.id = product.id;
    productCard.innerHTML = `
      <div class="card-image">
        <img src=${imageLinkProcessor(product.image)} alt="product-image" />
      </div>
      <div class="product-info card-content">
        <div class="product-title">
          <h3>${product.name}</h3>
        </div>
        <div class="product-price">
          <span>${currencyFormatter(product.price)}</span>
        </div>
        <div class="product-category">
          <span>${product.category}</span>
        </div>
        <div class="product-description">
          <p>${product.description}</p>
        </div>
      </div>
      <div class="card-action">
        <a href="./product-detail.html?id=${product.id}" class="view-details">View Details</a>
        <button class="add-to-cart">Add to Cart</button>
      </div>
    `;
    productGridEl.appendChild(productCard);
  });

  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const productCard = event.target.closest('.product');
      const productId = productCard.dataset.id;
      const product = products.find((p) => p.id === productId);
      addToCart(product);
      Swal.fire({
        title: 'Success!',
        text: 'Successfully added to cart',
        icon: 'success',
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      });

      updateNavCartCount();
    });
  });

  // const viewDetailsButtons = document.querySelectorAll('.view-details');
  // viewDetailsButtons.forEach((button) => {
  //   button.addEventListener('click', (event) => {
  //     const productCard = event.target.closest('.product');
  //     const productId = productCard.dataset.id;
  //     const product = products.find((p) => p.id === productId);
  //     // localStorage.setItem('selectedProduct', JSON.stringify(product));
  //     // window.location.href = './product-detail.html';
  
  //     Swal.fire({
  //       title: `<strong>${product.name}</strong>`,
  //       width: '80%',
  //       // icon: "info",
  //       html: `
  //         <div class="product-detail">
  //           <div class="product-detail-image">
  //             <img src=${imageLinkProcessor(product.image)} alt="product-image" />
  //           </div>
  //           <div class="product-detail-content">
  //             <div class="product-detail-info">
  //               <div class="product-detail-title">
  //                 <div class="product-detail-category">
  //                   <span>${product.category}</span>
  //                 </div>
  //                 <div class="product-detail-price">
  //                   <span>${currencyFormatter(product.price)}</span>
  //                 </div>
  //               </div>
  //               <div class="product-detail-description">
  //                 <p>${product.description}</p>
  //               </div>
  //               <div class="product-detail-seller-container">
  //                 <span>icon</span>
  //                 <div class="product-detail-seller-info">
  //                   <p>sold by</p>
  //                   <strong>${product.seller}</strong>
  //                 </div>
  //               </div>
  //             </div>
  //             <div class="product-detail-action">
  //               <button class="add-to-cart" id="swal-add-to-cart-btn">Add to Cart</button>
  //             </div>
  //           </div>
  //         </div>
  //       `,
  //       showCloseButton: true,
  //       showCancelButton: false,
  //       showConfirmButton: false,
  //       didOpen: () => {
  //         const addToCartButton = document.getElementById('swal-add-to-cart-btn');
  //         addToCartButton.addEventListener('click', () => {
  //           addToCart(product);
  //           Swal.fire({
  //             title: 'Success!',
  //             text: 'Successfully added to cart',
  //             icon: 'success',
  //             toast: true,
  //             position: 'bottom-end',
  //             showConfirmButton: false,
  //             timer: 1500,
  //             timerProgressBar: true
  //           });
  
  //           updateCartCount();
  //         });
  //       }
  //     });
  //   });
  // });
}

// jQuery(document).ready(function($) {
//   const targetPath = "/shop/"
  
//   if (!window.location.pathname.includes(targetPath)) {
//     const categoryNavEl  = $('.header-category-nav.cat-menu-text-overflow');
//     categoryNavEl.hide();

//     // Add overlay to .page-head
//     if ($('.page-head .overlay').length === 0) {
//       $('.page-head').prepend('<div class="overlay"></div>');
//     }
//     $('.page-head .overlay').css({
//       'position': 'absolute',
//       'top': 0,
//       'left': 0,
//       'width': '100%',
//       'height': '100%',
//       'background': 'rgba(0,0,0,0.6)',
//       'z-index': 1,
//       'pointer-events': 'none'
//     });

//     $('.page-head').css({
//       'position': 'relative',
//       'background-image': 'url("https://apawsitive.live/wp-content/uploads/2025/05/cute-dog-with-owner-pet-shop-scaled.jpg")',
//       'background-size': 'cover',
//       'background-position': 'center center',
//       'background-repeat': 'no-repeat',
//       'min-height': '30vh',
//       'display': 'flex',
//       'flex-direction': 'column',
//       'justify-content': 'center',
//       'align-items': 'center',
//       'color': 'white',
//       'text-align': 'center',
//       'z-index': 0
//     });

//     $('.page-head .page-title').css({
//       'text-align': 'center',
//       'color': 'white',
//       'position': 'relative',
//       'z-index': 2
//     });

//   }
// });
