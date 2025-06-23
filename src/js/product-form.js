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

const productListContainer = document.getElementById("product-list");

const getLocalProducts = () =>
  JSON.parse(localStorage.getItem("aviatron_products") || "[]");
const saveLocalProducts = (data) =>
  localStorage.setItem("aviatron_products", JSON.stringify(data));

const getDeletedIds = () =>
  JSON.parse(localStorage.getItem("deletedProductIds") || "[]");
const saveDeletedIds = (data) =>
  localStorage.setItem("deletedProductIds", JSON.stringify(data));

const mergeProducts = (jsonProducts, localProducts) => {
  const merged = [...jsonProducts];
  localProducts.forEach((local) => {
    const i = merged.findIndex((p) => p.id === local.id);
    if (i !== -1) merged[i] = local;
    else merged.push(local);
  });
  return merged;
};

const renderProducts = (products) => {
  const deletedIds = getDeletedIds();
  productListContainer.innerHTML = "";

  products
    .filter((product) => !deletedIds.includes(product.id))
    .forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-card";

      const imgSrc = product.image?.startsWith("data:image")
        ? product.image
        : `./assets/images/${product.image}.jpg`;

      card.innerHTML = `
        <img src="${imgSrc}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p><strong>Rp ${product.price.toLocaleString("id-ID")}</strong></p>
        <p style="font-size: 0.9em; color: gray;">${product.category}</p>
        <a href="edit-product.html?id=${product.id}" class="btn-edit">Edit</a>
        <a class="btn-delete" data-id="${product.id}">Delete</a>
      `;

      productListContainer.appendChild(card);
    });

  // Delete handler
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      let locals = getLocalProducts();
      const isLocal = locals.find((p) => p.id === id);

      if (isLocal) {
        locals = locals.filter((p) => p.id !== id);
        saveLocalProducts(locals);
      }

      const deleted = getDeletedIds();
      if (!deleted.includes(id)) {
        deleted.push(id);
        saveDeletedIds(deleted);
      }

      alert("Produk telah dihapus.");
      location.reload();
    });
  });
};

fetch("./data/products.json")
  .then((res) => res.json())
  .then((jsonProducts) => {
    const localProducts = getLocalProducts();
    const all = mergeProducts(jsonProducts, localProducts);
    renderProducts(all);
  })
  .catch((err) => {
    console.error("Gagal memuat produk:", err);
    const localProducts = getLocalProducts();
    renderProducts(localProducts);
  });
