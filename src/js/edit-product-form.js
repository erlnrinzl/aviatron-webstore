// Validasi login admin
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
const productId = params.get("id"); // tetap string

const getLocalProducts = () =>
  JSON.parse(localStorage.getItem("aviatron_products") || "[]");
const saveLocalProducts = (data) =>
  localStorage.setItem("aviatron_products", JSON.stringify(data));

// Ambil produk dari JSON + local
const loadAllProducts = async () => {
  try {
    const res = await fetch("./data/products.json");
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
    console.error("Gagal ambil produk JSON", err);
    return getLocalProducts(); // fallback
  }
};

// Tampilkan isi form
const populateForm = (product) => {
  form.name.value = product.name;
  form.price.value = product.price;
  form.category.value = product.category;

  const imageSrc = product.image?.startsWith("data:image")
    ? product.image
    : `./assets/images/${product.image}.jpg`;

  previewImg.src = imageSrc;

  // Simpan image lama (Base64 atau nama file) di atribut data
  form.dataset.oldImage = product.image;
};

// Ganti preview saat pilih file baru
imageFileInput.addEventListener("change", () => {
  const file = imageFileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Saat form disubmit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const local = getLocalProducts();
  const file = imageFileInput.files[0];

  const updateProduct = (imageData) => {
    const updated = {
      id: productId,
      name: form.name.value,
      price: Number(form.price.value),
      category: form.category.value,
      image: imageData, // gunakan hasil upload / image lama
    };

    const idx = local.findIndex((p) => p.id === productId);
    if (idx !== -1) {
      local[idx] = updated;
    } else {
      local.push(updated);
    }

    saveLocalProducts(local);
    alert("Produk berhasil diperbarui.");
    window.location.href = "admin-products.html";
  };

  // Jika user upload gambar baru
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => updateProduct(e.target.result);
    reader.readAsDataURL(file);
  } else {
    // Gunakan gambar lama jika tidak ada upload baru
    const oldImage = form.dataset.oldImage || "";
    updateProduct(oldImage);
  }
});

// Jalankan saat halaman dibuka
loadAllProducts().then((allProducts) => {
  const product = allProducts.find((p) => p.id === productId);
  if (product) {
    populateForm(product);
  } else {
    alert("Product not found.");
  }
});
