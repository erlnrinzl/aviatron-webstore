import { requireAuth, getCurrentUser, logout } from '../static/auth.js';

// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    requireAuth();
    
    // Initialize dashboard
    initializeDashboard();
});

function initializeDashboard() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
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
    document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`;
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
}

function toggleAdminSection(user) {
    const adminSection = document.getElementById('adminSection');
    if (adminSection) { // Added this check to ensure the element exists
        if (user.role === 'admin') {
            adminSection.style.display = 'block';
        } else {
            adminSection.style.display = 'none';
        }
    }
}

function loadProfileDetails(user) {
    const accountDetailsContainer = document.getElementById('accountDetails');
    
    if (accountDetailsContainer) {
        // Basic profile info - can be expanded
        accountDetailsContainer.innerHTML = `
            <div class="profile-info-item"><strong>Name:</strong> <span id="profile-name">${user.name || 'N/A'}</span></div>
            <div class="profile-info-item"><strong>Email:</strong> <span id="profile-email">${user.email || 'N/A'}</span></div>
            <div class="profile-info-item"><strong>Role:</strong> <span id="profile-role">${user.role || 'N/A'}</span></div>
            ${user.loggedInAt ? `<div class="profile-info-item"><strong>Member Since:</strong> ${new Date(user.loggedInAt).toLocaleDateString()}</div>` : ''}
            <!-- Add more profile details here as needed -->
        `;
    }
}

// --- Order History Functionality (merged from order-history.js) ---
let allOrders = []; // Will be populated, e.g., from localStorage or API
const ordersPerPage = 5;
let currentPage = 1;
let filteredOrders = [];

const ordersTableBody = document.getElementById('orders-table-body');
const searchInput = document.getElementById('search-orders-input');
const filterSelect = document.getElementById('filter-orders-select');
const noOrdersMessage = document.getElementById('no-orders-message');
const prevPageBtn = document.getElementById('prev-page-btn');
const nextPageBtn = document.getElementById('next-page-btn');
const pageNumbersContainer = document.getElementById('page-numbers-container');

function fetchOrders() {
    // In a real app, fetch from an API. For now, using localStorage like in checkout.js
    const storedOrders = JSON.parse(localStorage.getItem('orderHistory')) || [];
    
    // Transform storedOrders to match the structure expected by renderOrders if necessary
    // For now, assume structure is: { id: 'ORD-XXXX', date: 'YYYY-MM-DD', status: 'status', total: 123.45, items: [] }
    // The mock data in order-history.js used 'id', 'date', 'status', 'total'.
    // The checkout.js stored 'orderDate' instead of 'date', and 'total' was a number.
    // We need to ensure consistency or map the fields.
    
    allOrders = storedOrders.map((order, index) => ({
        id: order.id || `#ORDER-${index + 1001}`, // Fallback ID
        date: order.orderDate || order.date, // Use orderDate from checkout.js if available
        status: order.status || 'Processing', // Fallback status
        total: order.total,
        items: order.items || []
    })).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by most recent
    
    filteredOrders = [...allOrders];
}


function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatPrice(price) {
    if (typeof price !== 'number') return 'N/A';
    return 'Rp ' + price.toLocaleString('id-ID'); // Adapted from checkout.js
}

function renderOrders() {
    if (!ordersTableBody) return;
    ordersTableBody.innerHTML = ''; 

    if (filteredOrders.length === 0) {
        if (noOrdersMessage) noOrdersMessage.style.display = 'block';
        renderPagination(); 
        return;
    }
    if (noOrdersMessage) noOrdersMessage.style.display = 'none';

    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    paginatedOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${formatDate(order.date)}</td>
            <td><span class="status ${order.status ? order.status.toLowerCase() : 'unknown'}">${order.status || 'Unknown'}</span></td>
            <td>${formatPrice(order.total)}</td>
            <td>
                <div class="order-actions">
                    <button class="btn btn-primary btn-sm view-order-btn" data-order-id="${order.id}">View</button>
                    ${order.status && order.status.toLowerCase() !== 'delivered' && order.status.toLowerCase() !== 'cancelled' ?
                      `<button class="btn btn-secondary btn-sm track-btn" data-order-id="${order.id}">Track</button>` : ''}
                </div>
            </td>
        `;
        ordersTableBody.appendChild(row);
    });
    renderPagination();
    attachOrderActionListeners();
}

function attachOrderActionListeners() {
    document.querySelectorAll('.view-order-btn').forEach(button => {
        button.addEventListener('click', function() {
            alert(`Viewing details for order: ${this.dataset.orderId}. (Feature to be implemented)`);
            // TODO: Implement actual view order functionality (e.g., redirect or show modal with order.items details)
        });
    });
    document.querySelectorAll('.track-btn').forEach(button => {
        button.addEventListener('click', function() {
            alert(`Tracking order: ${this.dataset.orderId}. (Feature to be implemented)`);
            // TODO: Implement actual track order functionality
        });
    });
}

function applyFiltersAndSearch() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const statusFilter = filterSelect ? filterSelect.value : '';
    currentPage = 1; 

    filteredOrders = allOrders.filter(order => {
        const orderIdString = String(order.id || '').toLowerCase();
        const matchesSearch = orderIdString.includes(searchTerm);
        const matchesStatus = statusFilter ? (order.status || '').toLowerCase() === statusFilter : true;
        return matchesSearch && matchesStatus;
    });
    renderOrders();
}

function renderPagination() {
    if (!pageNumbersContainer || !prevPageBtn || !nextPageBtn) return;

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    pageNumbersContainer.innerHTML = '';

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    if (totalPages === 0) { // No results
        prevPageBtn.style.display = 'none';
        nextPageBtn.style.display = 'none';
        if (noOrdersMessage) noOrdersMessage.textContent = "No orders match your criteria.";
        return;
    } else if (totalPages === 1) { // Only one page of results
         const pageBtn = document.createElement('button');
         pageBtn.classList.add('btn', 'active');
         pageBtn.textContent = 1;
         pageNumbersContainer.appendChild(pageBtn);
         prevPageBtn.style.display = 'none'; 
         nextPageBtn.style.display = 'none'; 
         if (noOrdersMessage) noOrdersMessage.style.display = 'none';
         return; 
    }

    prevPageBtn.style.display = 'inline-flex';
    nextPageBtn.style.display = 'inline-flex';
    if (noOrdersMessage) noOrdersMessage.style.display = 'none';


    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);

    if (currentPage === 1 && totalPages > 2) endPage = 3;
    if (currentPage === totalPages && totalPages > 2) startPage = totalPages - 2;

    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.classList.add('btn');
        firstBtn.textContent = '1';
        firstBtn.addEventListener('click', () => goToPage(1));
        pageNumbersContainer.appendChild(firstBtn);
        if (startPage > 2) {
             const ellipsis = document.createElement('span');
             ellipsis.classList.add('page-ellipsis');
             ellipsis.textContent = '...';
            pageNumbersContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.classList.add('btn');
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => goToPage(i));
        pageNumbersContainer.appendChild(pageBtn);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.classList.add('page-ellipsis');
            ellipsis.textContent = '...';
            pageNumbersContainer.appendChild(ellipsis);
        }
        const lastBtn = document.createElement('button');
        lastBtn.classList.add('btn');
        lastBtn.textContent = totalPages;
        lastBtn.addEventListener('click', () => goToPage(totalPages));
        pageNumbersContainer.appendChild(lastBtn);
    }
}

function goToPage(pageNumber) {
    currentPage = pageNumber;
    renderOrders();
}

function initializeOrderHistory() {
    fetchOrders(); // Load orders
    if (searchInput) searchInput.addEventListener('input', applyFiltersAndSearch);
    if (filterSelect) filterSelect.addEventListener('change', applyFiltersAndSearch);

    if (prevPageBtn) prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderOrders();
        }
    });

    if (nextPageBtn) nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderOrders();
        }
    });
    applyFiltersAndSearch(); // Initial render
}
// --- End of Order History Functionality ---

function initializeDashboardEventListeners(user) {
    // Logout functionality (taken from order-history.js, adapted for dashboard)
    const logoutButton = document.querySelector('.sidebar .logout a'); // More specific selector for sidebar logout
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout(user); // Pass user if needed for logout logic
        });
    }
    
    // Navigation for Profile and Order History tabs/sections within dashboard
    const profileLink = document.querySelector('.sidebar .nav-links a[href="#"]'); // First link assumed as Profile
    const orderHistoryLink = document.querySelectorAll('.sidebar .nav-links a[href="#"]')[1]; // Second link as Order History

    const profileSection = document.getElementById('profile-section');
    const orderHistorySection = document.getElementById('order-history-section');

    if (profileLink && orderHistoryLink && profileSection && orderHistorySection) {
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            profileSection.style.display = 'block'; // Or 'flex' if it's a flex container
            orderHistorySection.style.display = 'none';
            profileLink.parentElement.classList.add('active');
            orderHistoryLink.parentElement.classList.remove('active');
            document.querySelector('.dashboard-header h1').textContent = 'Profile Information';
        });

        orderHistoryLink.addEventListener('click', (e) => {
            e.preventDefault();
            profileSection.style.display = 'none';
            orderHistorySection.style.display = 'block'; // Or 'flex'
            orderHistoryLink.parentElement.classList.add('active');
            profileLink.parentElement.classList.remove('active');
            document.querySelector('.dashboard-header h1').textContent = 'Order History';
            // Re-fetch/re-render orders if necessary, or ensure it's up-to-date
            // applyFiltersAndSearch(); // Could be called to ensure view is fresh
        });

        // Default view: Show Profile, hide Order History
        profileSection.style.display = 'block';
        orderHistorySection.style.display = 'none';
        profileLink.parentElement.classList.add('active');
        document.querySelector('.dashboard-header h1').textContent = 'Profile Information';

    } else {
        // Fallback if new nav links are not set up as expected, show both or default to orders
        if(orderHistorySection) orderHistorySection.style.display = 'block';
    }
}

function handleLogout(user) {
    // Use the logout function from auth.js if it exists and handles clearing session/localStorage
    if (typeof logout === 'function') {
        logout(); // Assuming global logout() from auth.js
    } else {
        // Fallback basic logout
        alert(`Logging out ${user ? user.name : 'user'}... (Simulated)`);
        localStorage.removeItem('currentUser'); // Or your specific session item
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

// Create dummy admin account if it doesn't exist
function createDummyAdmin() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if admin already exists
    const adminExists = users.some(user => user.role === 'admin');
    
    if (!adminExists) {
        const adminUser = {
            name: 'Admin User',
            email: 'admin@aviatron.com',
            password: 'admin123', // In production, this should be properly hashed
            role: 'admin',
            phone: '+1234567890',
            address: 'Admin Office'
        };
        
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Dummy admin account created');
    }
}

// Call createDummyAdmin when the script loads
createDummyAdmin(); 