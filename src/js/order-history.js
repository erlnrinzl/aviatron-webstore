document.addEventListener('DOMContentLoaded', function() {
    // Mock user data (replace with actual data fetching if available)
    const currentUser = {
        name: "Jane Aviator",
        email: "jane.aviator@example.com",
        // avatar: "path/to/jane-avatar.jpg" // Optional
    };

    // Update sidebar user info
    const userNameSidebar = document.getElementById('user-name-sidebar');
    const userEmailSidebar = document.getElementById('user-email-sidebar');
    if (userNameSidebar) userNameSidebar.textContent = currentUser.name;
    if (userEmailSidebar) userEmailSidebar.textContent = currentUser.email;
    // const userAvatar = document.querySelector('.account-avatar img');
    // if (userAvatar && currentUser.avatar) userAvatar.src = currentUser.avatar;


    // Mock order data
    const allOrders = [
        { id: '#ORD-2025-001', date: '2025-01-15', status: 'delivered', total: 1299.99, items: [] },
        { id: '#ORD-2025-002', date: '2025-01-20', status: 'processing', total: 299.99, items: [] },
        { id: '#ORD-2025-003', date: '2025-01-25', status: 'shipped', total: 899.99, items: [] },
        { id: '#ORD-2025-004', date: '2025-01-30', status: 'cancelled', total: 199.99, items: [] },
        { id: '#ORD-2024-015', date: '2024-12-10', status: 'delivered', total: 75.50, items: [] },
        { id: '#ORD-2024-012', date: '2024-11-05', status: 'shipped', total: 549.00, items: [] },
        { id: '#ORD-2024-010', date: '2024-10-22', status: 'processing', total: 120.00, items: [] },
        { id: '#ORD-2024-008', date: '2024-09-15', status: 'delivered', total: 2000.00, items: [] },
        { id: '#ORD-2024-007', date: '2024-09-01', status: 'cancelled', total: 88.00, items: [] },
        { id: '#ORD-2024-005', date: '2024-08-10', status: 'shipped', total: 300.00, items: [] },
    ];

    const ordersTableBody = document.getElementById('orders-table-body');
    const searchInput = document.getElementById('search-orders-input');
    const filterSelect = document.getElementById('filter-orders-select');
    const noOrdersMessage = document.getElementById('no-orders-message');

    // Pagination variables
    const ordersPerPage = 5;
    let currentPage = 1;
    let filteredOrders = [...allOrders];

    // Helper: Format date
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    // Helper: Format price
    function formatPrice(price) {
        return '$' + price.toFixed(2);
    }

    // Render orders in the table
    function renderOrders() {
        if (!ordersTableBody) return;
        ordersTableBody.innerHTML = ''; // Clear existing rows

        if (filteredOrders.length === 0) {
            if (noOrdersMessage) noOrdersMessage.style.display = 'block';
            renderPagination(); // Still render pagination controls, but they might be disabled
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
                <td><span class="status ${order.status.toLowerCase()}">${order.status}</span></td>
                <td>${formatPrice(order.total)}</td>
                <td>
                    <div class="order-actions">
                        <button class="btn btn-primary btn-sm view-order-btn" data-order-id="${order.id}">View</button>
                        ${order.status.toLowerCase() !== 'delivered' && order.status.toLowerCase() !== 'cancelled' ?
                          `<button class="btn btn-secondary btn-sm track-btn" data-order-id="${order.id}">Track</button>` : ''}
                    </div>
                </td>
            `;
            ordersTableBody.appendChild(row);
        });
        renderPagination();
        attachActionListeners();
    }

    // Attach listeners to action buttons (View, Track)
    function attachActionListeners() {
        document.querySelectorAll('.view-order-btn').forEach(button => {
            button.addEventListener('click', function() {
                alert(`Viewing details for order: ${this.dataset.orderId}`);
                // Implement actual view order functionality (e.g., redirect or show modal)
            });
        });
        document.querySelectorAll('.track-btn').forEach(button => {
            button.addEventListener('click', function() {
                alert(`Tracking order: ${this.dataset.orderId}`);
                // Implement actual track order functionality
            });
        });
    }


    // Filter and Search
    function applyFiltersAndSearch() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const statusFilter = filterSelect ? filterSelect.value : '';
        currentPage = 1; // Reset to first page after filtering

        filteredOrders = allOrders.filter(order => {
            const matchesSearch = order.id.toLowerCase().includes(searchTerm);
            const matchesStatus = statusFilter ? order.status.toLowerCase() === statusFilter : true;
            return matchesSearch && matchesStatus;
        });
        renderOrders();
    }

    if (searchInput) searchInput.addEventListener('input', applyFiltersAndSearch);
    if (filterSelect) filterSelect.addEventListener('change', applyFiltersAndSearch);

    // Pagination
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const pageNumbersContainer = document.getElementById('page-numbers-container');

    function renderPagination() {
        if (!pageNumbersContainer || !prevPageBtn || !nextPageBtn) return;

        const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
        pageNumbersContainer.innerHTML = ''; // Clear existing page numbers

        // Prev button
        prevPageBtn.disabled = currentPage === 1;

        // Next button
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        
        if (totalPages <= 1 && filteredOrders.length > 0) { // Only one page of results
             const pageBtn = document.createElement('button');
             pageBtn.classList.add('btn', 'active');
             pageBtn.textContent = 1;
             pageNumbersContainer.appendChild(pageBtn);
             prevPageBtn.style.display = 'none'; // Hide if only one page
             nextPageBtn.style.display = 'none'; // Hide if only one page
             return; // Exit early if only one page
        } else if (totalPages === 0) { // No results
            prevPageBtn.style.display = 'none';
            nextPageBtn.style.display = 'none';
            return;
        }

        // Ensure buttons are visible if multiple pages
        prevPageBtn.style.display = 'inline-flex';
        nextPageBtn.style.display = 'inline-flex';


        // Page number buttons (simplified: show current and neighbors, or use more complex logic)
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
            if (startPage > 2) pageNumbersContainer.appendChild(document.createTextNode('...'));
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
            if (endPage < totalPages - 1) pageNumbersContainer.appendChild(document.createTextNode('...'));
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

    // Logout functionality
    function handleLogout() {
        alert("Logged out successfully!");
        // In a real app, redirect to login page or clear session/token
        // window.location.href = '/login.html';
    }

    const logoutButtonMain = document.getElementById('logout-btn-main');
    const logoutLinkSidebar = document.getElementById('logout-link-sidebar');

    if (logoutButtonMain) logoutButtonMain.addEventListener('click', handleLogout);
    if (logoutLinkSidebar) logoutLinkSidebar.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior
        handleLogout();
    });

    // Initial render
    applyFiltersAndSearch(); // This will also call renderOrders and renderPagination
}); 