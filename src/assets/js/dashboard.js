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
    toggleAdminSection(user);

    // Load dashboard data
    loadDashboardData();

    // Initialize event listeners
    initializeEventListeners();
}

function updateUserInfo(user) {
    // Update avatar and name
    document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`;
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
}

function toggleAdminSection(user) {
    const adminSection = document.getElementById('adminSection');
    if (user.role === 'admin') {
        adminSection.style.display = 'block';
    } else {
        adminSection.style.display = 'none';
    }
}

function loadDashboardData() {
    // Load account details
    loadAccountDetails();
    
    // Load recent orders
    loadRecentOrders();
    
    // Load recent activity
    loadRecentActivity();
}

function loadAccountDetails() {
    const user = getCurrentUser();
    const accountDetails = document.getElementById('accountDetails');
    
    accountDetails.innerHTML = `
        <div class="account-info">
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> ${user.role}</p>
            <p><strong>Member Since:</strong> ${new Date(user.loggedInAt).toLocaleDateString()}</p>
        </div>
    `;
}

function loadRecentOrders() {
    // Mock data - replace with actual API call in production
    const mockOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const recentOrders = document.getElementById('recentOrders');
    
    if (mockOrders.length === 0) {
        recentOrders.innerHTML = '<p>No orders found</p>';
        return;
    }

    const ordersList = mockOrders
        .slice(0, 5)
        .map(order => `
            <div class="order-item">
                <p><strong>Order #${order.id}</strong></p>
                <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                <p>Status: <span class="status-${order.status.toLowerCase()}">${order.status}</span></p>
            </div>
        `)
        .join('');

    recentOrders.innerHTML = ordersList;
}

function loadRecentActivity() {
    // Mock data - replace with actual API call in production
    const activities = [
        { type: 'login', date: new Date(), description: 'Last login activity' },
        { type: 'profile_update', date: new Date(Date.now() - 86400000), description: 'Profile information updated' }
    ];

    const recentActivity = document.getElementById('recentActivity');
    
    const activityList = activities
        .map(activity => `
            <div class="activity-item">
                <p><strong>${activity.type}</strong></p>
                <p>${activity.description}</p>
                <small>${activity.date.toLocaleDateString()}</small>
            </div>
        `)
        .join('');

    recentActivity.innerHTML = activityList;
}

function initializeEventListeners() {
    // Add event listeners for quick action buttons
    document.querySelectorAll('.action-button').forEach(button => {
        button.addEventListener('click', function(e) {
            const action = e.target.textContent.toLowerCase();
            handleQuickAction(action);
        });
    });
}

function handleQuickAction(action) {
    switch(action) {
        case 'view cart':
            window.location.href = 'cart.html';
            break;
        case 'track order':
            // Implement order tracking functionality
            alert('Order tracking feature coming soon!');
            break;
        case 'edit profile':
            // Implement profile editing functionality
            alert('Profile editing feature coming soon!');
            break;
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