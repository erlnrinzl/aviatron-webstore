export function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingIndex = cart.findIndex(item => item.id === product.id);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function removeFromCart(productId) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingIndex = cart.findIndex(item => item.id === productId);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity -= 1;
    if (cart[existingIndex].quantity <= 0) {
      cart.splice(existingIndex, 1);
    }
  }
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}