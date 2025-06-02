const session = localStorage.getItem("userSession");
if (!session) {
  window.location.href = "login.html";
} else {
  const user = JSON.parse(session);
  if (user.role !== "admin") {
    alert("You do not have permission to access this page");
    window.location.href = "index.html";
  }
}

const form = document.getElementById("product-form");
const previewImg = document.getElementById("preview-image");
const imageFileInput = document.getElementById("imageFile");

const getLocalProducts = () =>
  JSON.parse(localStorage.getItem("aviatron_products") || "[]");
const saveLocalProducts = (data) =>
  localStorage.setItem("aviatron_products", JSON.stringify(data));

imageFileInput.addEventListener("change", () => {
  const file = imageFileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => (previewImg.src = e.target.result);
    reader.readAsDataURL(file);
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const file = imageFileInput.files[0];
  if (!file) return alert("Please upload a product image.");
  const reader = new FileReader();
  reader.onload = function (e) {
    const newProduct = {
      id: Date.now(),
      name: form.name.value,
      price: Number(form.price.value),
      category: form.category.value,
      image: e.target.result,
    };
    const products = getLocalProducts();
    products.push(newProduct);
    saveLocalProducts(products);
    alert("Product added.");
    form.reset();
    previewImg.src = "";
  };
  reader.readAsDataURL(file);
});
