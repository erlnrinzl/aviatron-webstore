import { addToCart, getCart, updateNavCartCount } from "./cart.js";
let products = [];

const fetchProducts = async () => {
  const response = await fetch("./data/products.json");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  products = data;
  renderProducts(products);
};

updateNavCartCount();

fetchProducts().catch((error) => {
  console.error("Error fetching products:", error);
});

const currencyFormatter = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(value);
};

const imageLinkProcessor = (imageLink) => {
  const decodedImagePath = imageLink;
  // const decodedImagePath = decodeURIComponent(imageLink);
  return "./assets/images/" + decodedImagePath + ".jpg";
};

const filterProducts = (category) => {
  const filteredProducts = products.filter((product) => {
    return (
      product.category.trim().toLowerCase() === category.trim().toLowerCase()
    );
  });
  renderProducts(filteredProducts);
  return filteredProducts;
};

const applyFilterBtn = document.querySelector("#apply-filter-btn");
applyFilterBtn.addEventListener("click", () => {
  const productCountEl = document.querySelector(".product-section-count");

  const selectedCategory = document.querySelector("#category-select").value;
  if (selectedCategory) {
    let filteredProducts = filterProducts(selectedCategory);
    productCountEl.innerHTML = `<span>${filteredProducts.length} Products Found</span>`;
  } else {
    renderProducts(products);
    productCountEl.innerHTML = `<span>Showing all products</span>`;
  }
});

const renderProducts = (products) => {
  const productGridEl = document.querySelector(".product-grid");
  productGridEl.innerHTML = "";
  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.classList.add("product");
    productCard.classList.add("card");
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
        <a href="./product-detail.html?id=${
          product.id
        }" class="view-details">View Details</a>
        <button class="add-to-cart">Add to Cart</button>
      </div>
    `;
    productGridEl.appendChild(productCard);
  });

  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const productCard = event.target.closest(".product");
      const productId = productCard.dataset.id;
      const product = products.find((p) => p.id === productId);
      addToCart(product);
      showModal({
        title: 'Success!',
        html: '<p>Successfully added to cart</p>',
        showConfirm: false,
        showClose: false
      });
      setTimeout(hideModal, 1500);
    });
  });

};
