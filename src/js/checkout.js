document.addEventListener('DOMContentLoaded', () => {
    const cartItemsSummaryContainer = document.getElementById('cart-items-summary');
    const subtotalPriceElement = document.getElementById('subtotal-price');
    const shippingCostElement = document.getElementById('shipping-cost');
    const totalPriceElement = document.getElementById('total-price');
    const paymentMethodBtn = document.getElementById('payment-method-btn');
    const paymentModal = document.getElementById('payment-modal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const paymentOptions = document.querySelectorAll('.payment-option');
    const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
    const shippingForm = document.getElementById('shipping-form');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let selectedPaymentMethod = null;
    const shippingCost = 10000; // Example shipping cost

    function formatPrice(price) {
        return `Rp ${price.toLocaleString('id-ID')}`;
    }

    function renderCartSummary() {
        cartItemsSummaryContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsSummaryContainer.innerHTML = '<p>Keranjang belanja Anda kosong.</p>';
            paymentMethodBtn.disabled = true;
            return;
        }

        let currentSubtotal = 0;
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item-summary');
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-info">
                    <p>${item.name}</p>
                    <p>${item.quantity} x ${formatPrice(item.price)}</p>
                </div>
                <p>${formatPrice(item.price * item.quantity)}</p>
            `;
            cartItemsSummaryContainer.appendChild(itemElement);
            currentSubtotal += item.price * item.quantity;
        });

        subtotalPriceElement.textContent = formatPrice(currentSubtotal);
        shippingCostElement.textContent = formatPrice(shippingCost);
        totalPriceElement.textContent = formatPrice(currentSubtotal + shippingCost);
        paymentMethodBtn.disabled = false;
    }

    function isShippingFormValid() {
        return shippingForm.checkValidity();
    }

    paymentMethodBtn.addEventListener('click', () => {
        if (!isShippingFormValid()) {
            alert('Mohon lengkapi alamat pengiriman terlebih dahulu.');
            // Optionally, highlight invalid fields
            shippingForm.reportValidity();
            return;
        }
        paymentModal.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', () => {
        paymentModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });

    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            paymentOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedPaymentMethod = option.dataset.method;
            confirmPaymentBtn.disabled = false;
        });
    });

    confirmPaymentBtn.addEventListener('click', () => {
        if (!selectedPaymentMethod) {
            alert('Silakan pilih metode pembayaran.');
            return;
        }

        if (!isShippingFormValid()) {
            alert('Mohon lengkapi alamat pengiriman terlebih dahulu.');
            shippingForm.reportValidity();
            paymentModal.style.display = 'none'; // Close modal to show form
            return;
        }

        const shippingDetails = {
            fullName: document.getElementById('fullName').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            province: document.getElementById('province').value,
            postalCode: document.getElementById('postalCode').value,
        };

        const orderDetails = {
            items: cart,
            subtotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            shippingCost: shippingCost,
            total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + shippingCost,
            paymentMethod: selectedPaymentMethod,
            shippingAddress: shippingDetails,
            orderDate: new Date().toISOString()
        };

        // Simulate order placement
        console.log('Order placed:', orderDetails);

        // Store order in history (simulate backend)
        let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
        orderHistory.push(orderDetails);
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));

        // Clear cart
        localStorage.removeItem('cart');
        cart = [];

        alert(`Pembayaran dengan ${selectedPaymentMethod} berhasil! Pesanan Anda sedang diproses.\nTerima kasih telah berbelanja di Aviatron!`);
        paymentModal.style.display = 'none';
        window.location.href = 'order-history.html'; // Redirect to order history or a thank you page
    });

    // Initial render
    renderCartSummary();
}); 