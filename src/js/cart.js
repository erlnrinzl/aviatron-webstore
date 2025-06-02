export function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingIndex = cart.findIndex((item) => item.id === product.id);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingIndex = cart.findIndex((item) => item.id === productId);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity -= 1;
    if (cart[existingIndex].quantity <= 0) {
      cart.splice(existingIndex, 1);
    }
  }
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

export function updateCartItemQuantity(productId, newQuantity) {
  let cart = getCart();
  const existingIndex = cart.findIndex((item) => item.id === productId);

  if (existingIndex >= 0) {
    if (newQuantity > 0) {
      cart[existingIndex].quantity = newQuantity;
    } else {
      // If new quantity is 0 or less, remove the item
      cart.splice(existingIndex, 1);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
  }
}

export function removeItemCompletely(productId) {
  let cart = getCart();
  const updatedCart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(updatedCart));
}

export function clearCart() {
  localStorage.removeItem("cart");
}

// This function will be exported and used by other modules too.
export function updateNavCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const desktopCartCountEl = document.querySelector(".desktop-nav .cart-count");
  const mobileCartCountEl = document.querySelector(".mobile-nav .cart-count");

  if (desktopCartCountEl) {
    desktopCartCountEl.textContent = totalItems;
    desktopCartCountEl.classList.toggle("active", totalItems > 0);
    desktopCartCountEl.classList.toggle("hidden", totalItems === 0);
  }
  if (mobileCartCountEl) {
    mobileCartCountEl.textContent = totalItems;
    mobileCartCountEl.classList.toggle("active", totalItems > 0);
    mobileCartCountEl.classList.toggle("hidden", totalItems === 0);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Check if we are on cart.html before trying to access cart-specific elements
  if (window.location.pathname.endsWith("/cart.html")) {
    const cartItemsListEl = document.querySelector(".cart-items-list");
    const cartSubtotalEl = document.getElementById("cart-subtotal");
    const cartTotalItemsEl = document.getElementById("cart-total-items");
    const cartGrandTotalEl = document.getElementById("cart-grand-total");
    const checkoutButton = document.getElementById("checkout-button");
    const continueShoppingButton = document.getElementById(
      "continue-shopping-button"
    );
    const emptyCartMessageEl = document.querySelector(".empty-cart-message");
    const cartContentEl = document.querySelector(".cart-content");
    // Note: cartCountNavEl for nav updates is handled by the exported updateNavCartCount function

    // All functions that were previously inside DOMContentLoaded and specific to cart.html (renderCart, updateCartSummary, event listeners)
    // should now be defined *inside* this if block or called from here.

    function renderCart() {
      if (!cartItemsListEl) return; // Guard against null if somehow still an issue

      const cart = getCart();
      cartItemsListEl.innerHTML = ""; // Clear existing items

      if (cart.length === 0) {
        if (emptyCartMessageEl) emptyCartMessageEl.style.display = "block";
        if (cartContentEl) cartContentEl.style.display = "none";
        updateCartSummary(0, 0);
        // updateNavCartCount(); // This is called by the main script on page load or by other actions
        return;
      }

      if (emptyCartMessageEl) emptyCartMessageEl.style.display = "none";
      if (cartContentEl) cartContentEl.style.display = "";

      let subtotal = 0;
      let totalItems = 0;

      cart.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("cart-item");
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        totalItems += item.quantity;

        itemElement.innerHTML = `
                    <div class="cart-item-image">
                        <img src="/assets/images/${item.image}.jpg" alt="${
          item.name
        }">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="item-price">Price: Rp${item.price.toLocaleString()}</p>
                         <div class="cart-item-quantity">
                            <button class="quantity-change-btn" data-id="${
                              item.id
                            }" data-change="-1">-</button>
                            <input type="number" value="${
                              item.quantity
                            }" min="1" readonly data-id="${item.id}">
                            <button class="quantity-change-btn" data-id="${
                              item.id
                            }" data-change="1">+</button>
                        </div>
                    </div>
                    <div class="cart-item-total">
                        Rp${itemTotal.toLocaleString()}
                    </div>
                    <div class="cart-item-actions">
                        <button class="remove-item-btn" data-id="${
                          item.id
                        }">Remove</button>
                    </div>
                `;
        cartItemsListEl.appendChild(itemElement);
      });

      updateCartSummary(subtotal, totalItems);
      // updateNavCartCount(); // Nav count is updated globally or by other actions
      attachEventListeners();
    }

    function updateCartSummary(subtotal, totalItems) {
      if (cartSubtotalEl)
        cartSubtotalEl.textContent = `Rp${subtotal.toLocaleString()}`;
      if (cartTotalItemsEl) cartTotalItemsEl.textContent = totalItems;
      if (cartGrandTotalEl)
        cartGrandTotalEl.textContent = `Rp${subtotal.toLocaleString()}`;
    }

    function handleQuantityChange(productId, change) {
      const cart = getCart();
      const product = cart.find((item) => item.id === productId);
      if (!product) return;
      let newQuantity = product.quantity + change;
      if (newQuantity <= 0) {
        removeItemCompletely(productId);
      } else {
        updateCartItemQuantity(productId, newQuantity);
      }
      renderCart();
      updateNavCartCount(); // Update nav count after cart page action
    }

    function handleRemoveItem(productId) {
      removeItemCompletely(productId);
      renderCart();
      updateNavCartCount(); // Update nav count after cart page action
    }

    function attachEventListeners() {
      document.querySelectorAll(".remove-item-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
          const productId = event.target.dataset.id;
          handleRemoveItem(productId);
        });
      });
      document.querySelectorAll(".quantity-change-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
          const productId = event.target.dataset.id;
          const change = parseInt(event.target.dataset.change);
          handleQuantityChange(productId, change);
        });
      });
    }

    if (continueShoppingButton) {
      continueShoppingButton.addEventListener("click", () => {
        window.location.href = "../products.html";
      });
    }

    if (checkoutButton) {
      // No alert needed, the button is wrapped in an anchor tag now
    }

    // Initial render for cart.html page
    renderCart();
    updateNavCartCount(); // Ensure nav count is also up-to-date when cart page loads
  }
});
