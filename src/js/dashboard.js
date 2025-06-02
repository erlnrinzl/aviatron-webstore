import { requireAuth, getCurrentUser, logout } from "./auth.js";

// Dashboard functionality
document.addEventListener("DOMContentLoaded", function () {
  // Check authentication
  requireAuth();

  // Initialize dashboard
  initializeDashboard();
});

function initializeDashboard() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Update user information
  updateUserInfo(user);

  // Show/hide admin section based on role
  // toggleAdminSection(user); // Ensure this is commented out if adminSection HTML is not present

  // Load profile information
  loadProfileDetails(user);

  // Load and render order history
  initializeOrderHistory();

  // Initialize general event listeners (e.g., logout)
  initializeDashboardEventListeners(user);
}

function updateUserInfo(user) {
  // Update avatar and name
  document.getElementById(
    "userAvatar"
  ).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.name
  )}&background=0D8ABC&color=fff`;
  document.getElementById("userName").textContent = user.name;
  document.getElementById("userRole").textContent =
    user.role.charAt(0).toUpperCase() + user.role.slice(1);
}

function toggleAdminSection(user) {
  const adminSection = document.getElementById("adminSection");
  if (adminSection) {
    // Added this check to ensure the element exists
    if (user.role === "admin") {
      adminSection.style.display = "block";
    } else {
      adminSection.style.display = "none";
    }
  }
}

function loadProfileDetails(user) {
  const accountDetailsContainer = document.getElementById("accountDetails");

  if (accountDetailsContainer) {
    // Basic profile info - can be expanded
    accountDetailsContainer.innerHTML = `
            <div class="profile-info-item"><strong>Name:</strong> <span id="profile-name">${
              user.name || "N/A"
            }</span></div>
            <div class="profile-info-item"><strong>Email:</strong> <span id="profile-email">${
              user.email || "N/A"
            }</span></div>
            <div class="profile-info-item"><strong>Role:</strong> <span id="profile-role">${
              user.role || "N/A"
            }</span></div>
            ${
              user.loggedInAt
                ? `<div class="profile-info-item"><strong>Member Since:</strong> ${new Date(
                    user.loggedInAt
                  ).toLocaleDateString()}</div>`
                : ""
            }
            <!-- Add more profile details here as needed -->
        `;
  }
}

// --- Order History Functionality (merged from order-history.js) ---
let allOrders = []; // Will be populated, e.g., from localStorage or API
const ordersPerPage = 5;
let currentPage = 1;
let filteredOrders = [];

const ordersTableBody = document.getElementById("orders-table-body");
const searchInput = document.getElementById("search-orders-input");
const filterSelect = document.getElementById("filter-orders-select");
const noOrdersMessage = document.getElementById("no-orders-message");
const prevPageBtn = document.getElementById("prev-page-btn");
const nextPageBtn = document.getElementById("next-page-btn");
const pageNumbersContainer = document.getElementById("page-numbers-container");

function fetchOrders() {
  // In a real app, fetch from an API. For now, using localStorage like in checkout.js
  const storedOrders = JSON.parse(localStorage.getItem("orderHistory")) || [];

  // Transform storedOrders to match the structure expected by renderOrders if necessary
  // For now, assume structure is: { id: 'ORD-XXXX', date: 'YYYY-MM-DD', status: 'status', total: 123.45, items: [] }
  // The mock data in order-history.js used 'id', 'date', 'status', 'total'.
  // The checkout.js stored 'orderDate' instead of 'date', and 'total' was a number.
  // We need to ensure consistency or map the fields.

  allOrders = storedOrders
    .map((order, index) => ({
      id: order.id || `#ORDER-${index + 1001}`, // Fallback ID
      date: order.orderDate || order.date, // Use orderDate from checkout.js if available
      status: order.status || "Processing", // Fallback status
      total: order.total,
      items: order.items || [],
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by most recent

  filteredOrders = [...allOrders];
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function formatPrice(price) {
  if (typeof price !== "number") return "N/A";
  return "Rp " + price.toLocaleString("id-ID"); // Adapted from checkout.js
}

function renderOrders() {
  if (!ordersTableBody) return;
  ordersTableBody.innerHTML = "";

  if (filteredOrders.length === 0) {
    if (noOrdersMessage) noOrdersMessage.style.display = "block";
    renderPagination();
    return;
  }
  if (noOrdersMessage) noOrdersMessage.style.display = "none";

  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  paginatedOrders.forEach((order) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${order.id}</td>
            <td>${formatDate(order.date)}</td>
            <td><span class="status ${
              order.status ? order.status.toLowerCase() : "unknown"
            }">${order.status || "Unknown"}</span></td>
            <td>${formatPrice(order.total)}</td>
            <td>
                <div class="order-actions">
                    <button class="btn btn-primary btn-sm view-order-btn" data-order-id="${
                      order.id
                    }">View</button>
                    ${
                      order.status &&
                      order.status.toLowerCase() !== "delivered" &&
                      order.status.toLowerCase() !== "cancelled"
                        ? `<button class="btn btn-secondary btn-sm track-btn" data-order-id="${order.id}">Track</button>`
                        : ""
                    }
                </div>
            </td>
        `;
    ordersTableBody.appendChild(row);
  });
  renderPagination();
  attachOrderActionListeners();
}

function attachOrderActionListeners() {
  document.querySelectorAll(".view-order-btn").forEach((button) => {
    button.addEventListener("click", function () {
      alert(
        `Viewing details for order: ${this.dataset.orderId}. (Feature to be implemented)`
      );
      // TODO: Implement actual view order functionality (e.g., redirect or show modal with order.items details)
    });
  });
  document.querySelectorAll(".track-btn").forEach((button) => {
    button.addEventListener("click", function () {
      alert(
        `Tracking order: ${this.dataset.orderId}. (Feature to be implemented)`
      );
      // TODO: Implement actual track order functionality
    });
  });
}

function applyFiltersAndSearch() {
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  const statusFilter = filterSelect ? filterSelect.value : "";
  currentPage = 1;

  filteredOrders = allOrders.filter((order) => {
    const orderIdString = String(order.id || "").toLowerCase();
    const matchesSearch = orderIdString.includes(searchTerm);
    const matchesStatus = statusFilter
      ? (order.status || "").toLowerCase() === statusFilter
      : true;
    return matchesSearch && matchesStatus;
  });
  renderOrders();
}

function renderPagination() {
  if (!pageNumbersContainer || !prevPageBtn || !nextPageBtn) return;

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  pageNumbersContainer.innerHTML = "";

  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

  if (totalPages === 0) {
    // No results
    prevPageBtn.style.display = "none";
    nextPageBtn.style.display = "none";
    if (noOrdersMessage)
      noOrdersMessage.textContent = "No orders match your criteria.";
    return;
  } else if (totalPages === 1) {
    // Only one page of results
    const pageBtn = document.createElement("button");
    pageBtn.classList.add("btn", "active");
    pageBtn.textContent = 1;
    pageNumbersContainer.appendChild(pageBtn);
    prevPageBtn.style.display = "none";
    nextPageBtn.style.display = "none";
    if (noOrdersMessage) noOrdersMessage.style.display = "none";
    return;
  }

  prevPageBtn.style.display = "inline-flex";
  nextPageBtn.style.display = "inline-flex";
  if (noOrdersMessage) noOrdersMessage.style.display = "none";

  let startPage = Math.max(1, currentPage - 1);
  let endPage = Math.min(totalPages, currentPage + 1);

  if (currentPage === 1 && totalPages > 2) endPage = 3;
  if (currentPage === totalPages && totalPages > 2) startPage = totalPages - 2;

  if (startPage > 1) {
    const firstBtn = document.createElement("button");
    firstBtn.classList.add("btn");
    firstBtn.textContent = "1";
    firstBtn.addEventListener("click", () => goToPage(1));
    pageNumbersContainer.appendChild(firstBtn);
    if (startPage > 2) {
      const ellipsis = document.createElement("span");
      ellipsis.classList.add("page-ellipsis");
      ellipsis.textContent = "...";
      pageNumbersContainer.appendChild(ellipsis);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.classList.add("btn");
    if (i === currentPage) {
      pageBtn.classList.add("active");
    }
    pageBtn.textContent = i;
    pageBtn.addEventListener("click", () => goToPage(i));
    pageNumbersContainer.appendChild(pageBtn);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement("span");
      ellipsis.classList.add("page-ellipsis");
      ellipsis.textContent = "...";
      pageNumbersContainer.appendChild(ellipsis);
    }
    const lastBtn = document.createElement("button");
    lastBtn.classList.add("btn");
    lastBtn.textContent = totalPages;
    lastBtn.addEventListener("click", () => goToPage(totalPages));
    pageNumbersContainer.appendChild(lastBtn);
  }
}

function goToPage(pageNumber) {
  currentPage = pageNumber;
  renderOrders();
}

function initializeOrderHistory() {
  fetchOrders(); // Fetch initial data
  renderOrders(); // Initial render

  if (searchInput) {
    searchInput.addEventListener("input", applyFiltersAndSearch);
  }
  if (filterSelect) {
    filterSelect.addEventListener("change", applyFiltersAndSearch);
  }
  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        goToPage(currentPage - 1);
      }
    });
  }
  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", () => {
      const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
      if (currentPage < totalPages) {
        goToPage(currentPage + 1);
      }
    });
  }
}

// --- General Dashboard Event Listeners ---
function initializeDashboardEventListeners(user) {
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => handleLogout(user));
  }

  // Event listener for sidebar navigation
  const sidebarLinks = document.querySelectorAll(".sidebar-nav a");
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const targetSectionId = this.getAttribute("href").substring(1); // e.g., #profile -> profile
      showSection(targetSectionId);
    });
  });

  // Show default section (e.g., 'profile')
  showSection("profile");

  // More event listeners can be added here as dashboard functionality expands.
  // Example: Edit profile button, change password, etc.
}

function showSection(sectionId) {
  const sections = document.querySelectorAll(".dashboard-section");
  sections.forEach((section) => {
    if (section.id === sectionId) {
      section.style.display = "block";
    } else {
      section.style.display = "none";
    }
  });

  // Update active state in sidebar
  const sidebarLinks = document.querySelectorAll(".sidebar-nav a");
  sidebarLinks.forEach((link) => {
    if (link.getAttribute("href") === `#${sectionId}`) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function handleLogout(user) {
  // Placeholder: Log user activity before logout, if needed
  console.log(`User ${user.email} is logging out.`);

  logout(); // Clear user session

  // Redirect to login page
  window.location.href = "login.html";
}

// --- Mock Admin Actions (Placeholder, for future development) ---
// Note: These functions are just placeholders. Actual implementation would involve API calls and more robust logic.

// This is just a dummy function as createAdmin functionality is not yet fully implemented
function createDummyAdmin() {
  if (!localStorage.getItem("users")) {
    // If no users exist, create a default admin
    const defaultAdmin = {
      id: "admin-" + Date.now(),
      name: "Administrator",
      email: "admin@aviatron.com",
      password: "admin123", // In a real app, hash this password
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem("users", JSON.stringify([defaultAdmin]));
    console.log("Default admin created.");
  }
}

// Call this function perhaps once when the app initializes or on a specific admin setup page
// createDummyAdmin(); // Commented out to prevent re-creation every time dashboard script runs

// Example functions for managing users (placeholders)
function viewUsers() {
  alert("Admin Action: View Users. (To be implemented)");
  // Fetch users from backend/localStorage and display them
}

function manageProducts() {
  alert("Admin Action: Manage Products. (To be implemented)");
  // Redirect to product management page or show a modal
}

function viewSiteAnalytics() {
  alert("Admin Action: View Site Analytics. (To be implemented)");
  // Show analytics dashboard
}

// Event listeners for admin actions (if admin section is shown)
// Ensure these are only attached if the elements exist and the user is an admin
// Example (would be placed inside toggleAdminSection or a similar setup function):
// document.getElementById('viewUsersBtn').addEventListener('click', viewUsers);
// document.getElementById('manageProductsBtn').addEventListener('click', manageProducts);
// document.getElementById('viewAnalyticsBtn').addEventListener('click', viewSiteAnalytics);
