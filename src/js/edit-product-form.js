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
const params = new URLSearchParams(window.location.search);
const productId = params.get("id"); // biarkan tetap string

const getLocalProducts = () =>
  JSON.parse(localStorage.getItem("aviatron_products") || "[]");
const saveLocalProducts = (data) =>
  localStorage.setItem("aviatron_products", JSON.stringify(data));

const loadAllProducts = async () => {
  try {
    const res = await fetch("assets/static/products.json");
    const json = await res.json();
    const local = getLocalProducts();
    const combined = [...json];

    for (const item of local) {
      const idx = combined.findIndex((p) => p.id === item.id);
      if (idx !== -1) combined[idx] = item;
      else combined.push(item);
    }

    return combined;
  } catch (err) {
    console.error("Failed to load products.json", err);
    return getLocalProducts(); // fallback only
  }
};

const populateForm = (product) => {
  form.name.value = product.name;
  form.price.value = product.price;
  form.category.value = product.category;
  previewImg.src = product.image?.startsWith("data:image")
    ? product.image
    : `assets/images/${product.image}.jpg`;
};

imageFileInput.addEventListener("change", () => {
  const file = imageFileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => (previewImg.src = e.target.result);
    reader.readAsDataURL(file);
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const local = getLocalProducts();

  const updated = {
    id: productId,
    name: form.name.value,
    price: Number(form.price.value),
    category: form.category.value,
    image: previewImg.src,
  };

  const idx = local.findIndex((p) => p.id === productId);
  if (idx !== -1) local[idx] = updated;
  else local.push(updated);
  saveLocalProducts(local);
  alert("Product updated successfully.");
});

loadAllProducts().then((allProducts) => {
  const product = allProducts.find((p) => p.id === productId);
  if (product) {
    populateForm(product);
  } else {
    alert("Product not found.");
  }
});
