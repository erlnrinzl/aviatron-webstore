$(document).ready(function () {
  // $.getJSON('./data/products.json', function(products) {

  // });

  $.getJSON("./data/categories.json", function (categories) {
    const categoryList = $(".category-list");
    categoryList.empty();

    categories.forEach(function (category) {
      const listItem = $("<div></div>");
      listItem.addClass("category-item");
      listItem.addClass("card");
      listItem.html(`
        <div class="card-image">
          <img src="./assets/images/${category.image}.jpg" alt="Category Image" />
        </div>
        <div class="card-content">
          <h3>${category.name}</h3>
          <p>${category.description}</p>
        </div>
      `);
      categoryList.append(listItem);
    });
  }).fail(function () {
    console.error("Failed to load categories data.");
  });

  const renderCategories = (categories) => {
    const categoryListEl = $(".category-list");
    categoryListEl.empty();

    categories.forEach((category) => {
      const listItem = $("<div></div>");
      listItem.addClass("category-item");
      listItem.addClass("card");
      listItem.html(`
          <img src="" alt="Category Image" />
          <h3>Camera Drones</h3>
          <p>High-quality drones for stunning aerial photography.</p>
      `);
      categoryListEl.append(listItem);
    });
  };
});
