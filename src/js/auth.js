import { getCart } from "./cart.js"; // Updated import path

// Authentication utility functions

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem("userSession") !== null;
}

// Get current user session
function getCurrentUser() {
  const session = localStorage.getItem("userSession");
  return session ? JSON.parse(session) : null;
}

// Logout function
function logout() {
  localStorage.removeItem("userSession");
  window.location.href = "login.html";
}

// Check if user has required role
function hasRole(requiredRole) {
  const user = getCurrentUser();
  return user && user.role === requiredRole;
}

// Protect page based on authentication
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}

// Protect page based on role
function requireRole(role) {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  if (!hasRole(role)) {
    alert("You do not have permission to access this page");
    window.location.href = "index.html";
  }
}

// Function to update user actions div based on auth state
function updateUserActions() {
  const userActionsDiv = document.querySelector(".user-actions");
  if (!userActionsDiv) return;

  const cart = getCart();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const currentPagePath = window.location.pathname;
  // Normalize paths: ensure leading slash and remove trailing if any for comparison
  const normalizedCurrentPath = currentPagePath.startsWith("/")
    ? currentPagePath
    : "/" + currentPagePath;

  // Define allowed paths (ensure these are exactly how they appear or use a flexible check)
  const cartVisiblePaths = [
    "/products.html",
    "/product-detail.html",
    "/cart.html",
  ];

  // A more robust check: see if the current path *ends with* an allowed path.
  // This handles cases where the full path might have other segments (e.g. /src/products.html if running locally from a subfolder)
  const shouldShowCartIcon = cartVisiblePaths.some((allowedPath) =>
    normalizedCurrentPath.endsWith(allowedPath)
  );

  let cartIconHTML = "";
  if (shouldShowCartIcon) {
    cartIconHTML = `
            <div class="user-action">
                <a href="./cart.html">
                    <div class="cart-icon">
                        <span>Cart</span>
                        <span class="cart-count ${
                          totalItems > 0 ? "active" : "hidden"
                        }">${totalItems}</span>
                    </div>
                </a>
            </div>
        `;
  }

  if (isLoggedIn()) {
    const user = getCurrentUser();
    userActionsDiv.innerHTML = `
            ${cartIconHTML}
            <div class="user-action profile-action">
                <div class="profile-info">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name
                    )}&background=0D8ABC&color=fff" alt="Profile" class="profile-image">
                    <span class="profile-name">${user.name}</span>
                </div>
                <div class="profile-menu">
                    <a href="dashboard.html" class="menu-item">Dashboard</a>
                    <button onclick="logout()" class="menu-item">Log Out</button>
                </div>
            </div>
        `;
  } else {
    userActionsDiv.innerHTML = `
            ${cartIconHTML}
            <div class="user-action">
                <a href="login.html" class="auth-button">Login</a>
            </div>
        `;
  }
}

// Register functionality
$(document).ready(function () {
  // Redirect if already logged in
  if (isLoggedIn() && !window.location.href.includes("dashboard.html")) {
    window.location.href = "dashboard.html";
    return;
  }

  $("#registerForm").on("submit", function (e) {
    e.preventDefault();

    const formData = {
      name: $("#name").val(),
      email: $("#email").val(),
      phone: $("#phone").val(),
      address: $("#address").val(),
      password: $("#password").val(),
      confirmPassword: $("#confirmPassword").val(),
      role: $("#role").val(),
    };

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Please enter a valid phone number");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Get existing users or initialize empty array
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if email already exists
    if (users.some((user) => user.email === formData.email)) {
      alert("Email already registered");
      return;
    }

    // Create new user object (excluding confirmPassword)
    const newUser = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      password: formData.password, // In real app, this should be hashed
      role: formData.role || "user",
    };

    // Add new user to users array
    users.push(newUser);

    // Save updated users array
    localStorage.setItem("users", JSON.stringify(users));

    // Create session for new user
    const session = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      loggedInAt: new Date().toISOString(),
    };

    // Save session
    localStorage.setItem("userSession", JSON.stringify(session));

    // Show success message
    alert("Registration successful! Redirecting...");

    // Redirect to dashboard
    window.location.href = "dashboard.html";
  });
});

// Login functionality
$(document).ready(function () {
  // Redirect if already logged in
  if (isLoggedIn() && !window.location.href.includes("dashboard.html")) {
    window.location.href = "dashboard.html";
    return;
  }

  $("#loginForm").on("submit", function (e) {
    e.preventDefault();

    const email = $("#email").val();
    const password = $("#password").val();

    // Simulate login verification (replace this with actual backend call later)
    const mockUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Create session
      const session = {
        id: Date.now(),
        name: user.name,
        email: user.email,
        role: user.role,
        loggedInAt: new Date().toISOString(),
      };

      // Save session to localStorage
      localStorage.setItem("userSession", JSON.stringify(session));

      // Show success message
      alert("Login successful! Redirecting...");

      // Redirect based on role
      if (user.role === "admin") {
        window.location.href = "admin-products.html";
      } else {
        window.location.href = "dashboard.html";
      }
    } else {
      alert("Invalid email or password");
    }
  });
});

// Call updateUserActions when the page loads
document.addEventListener("DOMContentLoaded", () => {
  // Ensure DOM is ready for getCart
  updateUserActions();
});

export {
  isLoggedIn,
  getCurrentUser,
  logout,
  hasRole,
  requireAuth,
  requireRole,
  updateUserActions,
};
