import { addToCart, getCart } from './cartDA.js';
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

const updateCartCount = () => {
  const cartCount = document.querySelector('.cart-count');
  const cart = getCart();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCount.innerText = totalItems;
  cartCount.classList.add('active');
  cartCount.classList.remove('hidden');
}

updateCartCount();

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
  const imagePath = imageLink.split('//1b862cb460a41862e490b0efbe1d94d8.cdn.bubble.io');
  return "https://1b862cb460a41862e490b0efbe1d94d8.cdn.bubble.io/cdn-cgi/image/w=384,h=,f=auto,dpr=2,fit=contain" + imagePath[1];
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
        <button class="view-details">View Details</button>
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

      updateCartCount();
    });
  });

  const viewDetailsButtons = document.querySelectorAll('.view-details');
  viewDetailsButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const productCard = event.target.closest('.product');
      const productId = productCard.dataset.id;
      const product = products.find((p) => p.id === productId);
      // localStorage.setItem('selectedProduct', JSON.stringify(product));
      // window.location.href = './product-detail.html';
  
      Swal.fire({
        title: `<strong>${product.name}</strong>`,
        width: '80%',
        // icon: "info",
        html: `
          <div class="product-detail">
            <div class="product-detail-image">
              <img src=${imageLinkProcessor(product.image)} alt="product-image" />
            </div>
            <div class="product-detail-content">
              <div class="product-detail-info">
                <div class="product-detail-title">
                  <div class="product-detail-category">
                    <span>${product.category}</span>
                  </div>
                  <div class="product-detail-price">
                    <span>${currencyFormatter(product.price)}</span>
                  </div>
                </div>
                <div class="product-detail-description">
                  <p>${product.description}</p>
                </div>
                <div class="product-detail-seller-container">
                  <span>icon</span>
                  <div class="product-detail-seller-info">
                    <p>sold by</p>
                    <strong>${product.seller}</strong>
                  </div>
                </div>
              </div>
              <div class="product-detail-action">
                <button class="add-to-cart" id="swal-add-to-cart-btn">Add to Cart</button>
              </div>
            </div>
          </div>
        `,
        showCloseButton: true,
        showCancelButton: false,
        showConfirmButton: false,
        didOpen: () => {
          const addToCartButton = document.getElementById('swal-add-to-cart-btn');
          addToCartButton.addEventListener('click', () => {
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
  
            updateCartCount();
          });
        }
      });
    });
  });
}
