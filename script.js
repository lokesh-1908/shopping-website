// Products Data - Loaded from localStorage
let products = [];

// State Management
let cart = [];
let wishlist = [];
let currentBuyNowProduct = null;
let generatedOTP = null;
let currentOrder = null;

// Default Products (for first time setup)
const DEFAULT_PRODUCTS = [
    { id: 1, name: "Wireless Headphones", price: 2499, emoji: "🎧", rating: "⭐⭐⭐⭐⭐", category: "Headphones", description: "High-quality wireless headphones", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='30' cy='40' r='15' fill='%23ff9500'/%3E%3Ccircle cx='70' cy='40' r='15' fill='%23ff9500'/%3E%3Crect x='40' y='35' width='20' height='30' fill='%23ff9500'/%3E%3C/svg%3E" },
    { id: 2, name: "Smart Watch", price: 5999, emoji: "⌚", rating: "⭐⭐⭐⭐", category: "Watch", description: "Premium smart watch", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='20' y='10' width='60' height='80' rx='10' fill='%2327ae60'/%3E%3Ccircle cx='50' cy='50' r='30' fill='%23fff'/%3E%3C/svg%3E" }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromStorage();
    renderProducts();
    loadFromLocalStorage();
    updateCartSummary();
    updateWishlistSummary();
});

// Load products from localStorage
function loadProductsFromStorage() {
    const stored = localStorage.getItem('shopProducts');
    if (stored) {
        products = JSON.parse(stored);
    } else {
        // Initialize with default products on first visit
        products = DEFAULT_PRODUCTS;
        localStorage.setItem('shopProducts', JSON.stringify(products));
    }
}

// Render Products
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
                <div style="font-size: 48px; margin-bottom: 15px;">📭</div>
                <div style="font-size: 16px;">No products available. Please add products from the admin panel.</div>
                <a href="admin.html" style="display: inline-block; margin-top: 15px;">
                    <button style="background: #ff9500; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Go to Admin Panel</button>
                </a>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                ${product.image ? `<img src="${product.image}" style="width: 100%; height: 100%; object-fit: cover;">` : product.emoji}
                <button class="wishlist-icon ${wishlist.some(w => w.id === product.id) ? 'active' : ''}" 
                        onclick="toggleWishlist(${product.id}, event)">
                    ${wishlist.some(w => w.id === product.id) ? '❤️' : '🤍'}
                </button>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">₹${product.price}</div>
                <div class="product-rating">${product.rating}</div>
                <div class="product-actions">
                    <button class="btn btn-add-cart" onclick="addToCart(${product.id})">Add Cart</button>
                    <button class="btn btn-buy-now" onclick="openBuyNow(${product.id})">Buy Now</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveToLocalStorage();
    updateCartSummary();
    showSuccess(`${product.name} added to cart!`);
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveToLocalStorage();
    updateCartSummary();
    renderCartModal();
}

// Toggle Wishlist
function toggleWishlist(productId, event) {
    event.stopPropagation();
    const product = products.find(p => p.id === productId);
    const index = wishlist.findIndex(w => w.id === productId);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        showSuccess(`${product.name} removed from wishlist!`);
    } else {
        wishlist.push(product);
        showSuccess(`${product.name} added to wishlist!`);
    }
    
    saveToLocalStorage();
    updateWishlistSummary();
    renderProducts();
}

// Update Cart Summary
function updateCartSummary() {
    const cartSummary = document.getElementById('cartSummary');
    const cartSummaryItems = document.getElementById('cartSummaryItems');
    
    if (cart.length === 0) {
        cartSummary.textContent = 'Your cart is empty';
        cartSummaryItems.innerHTML = '';
    } else {
        cartSummary.innerHTML = '';
        cartSummaryItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <span class="item-name">${item.name} (x${item.quantity})</span>
                <span class="item-price">₹${item.price * item.quantity}</span>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `).join('');
    }
    
    calculateTotals();
    renderCartModal();
}

// Update Wishlist Summary
function updateWishlistSummary() {
    const wishlistSummary = document.getElementById('wishlistSummary');
    const wishlistItems = document.getElementById('wishlistItems');
    
    if (wishlist.length === 0) {
        wishlistSummary.textContent = 'Your wishlist is empty';
        wishlistItems.innerHTML = '';
    } else {
        wishlistSummary.innerHTML = '';
        wishlistItems.innerHTML = wishlist.map(item => `
            <div class="wishlist-item">
                <span class="item-name">${item.name}</span>
                <span class="item-price">₹${item.price}</span>
                <button class="remove-btn" onclick="removeFromWishlist(${item.id})">Remove</button>
            </div>
        `).join('');
    }
    
    renderWishlistModal();
}

// Remove from Wishlist
function removeFromWishlist(productId) {
    wishlist = wishlist.filter(item => item.id !== productId);
    saveToLocalStorage();
    updateWishlistSummary();
    renderProducts();
}

// Calculate Totals
function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 100 : 0;
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + shipping + tax;
    
    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('shipping').textContent = `₹${shipping}`;
    document.getElementById('tax').textContent = `₹${tax}`;
    document.getElementById('total').textContent = `₹${total}`;
}

// Render Cart Modal
function renderCartModal() {
    const cartModalContent = document.getElementById('cartModalContent');
    
    if (cart.length === 0) {
        cartModalContent.innerHTML = '<div class="empty-message">Your cart is empty</div>';
    } else {
        cartModalContent.innerHTML = `
            <div style="max-height: 400px; overflow-y: auto;">
                ${cart.map(item => `
                    <div class="cart-item" style="justify-content: space-between; align-items: start;">
                        <div>
                            <div class="item-name">${item.name}</div>
                            <div style="font-size: 12px; color: #666;">Quantity: ${item.quantity}</div>
                        </div>
                        <div style="text-align: right;">
                            <div class="item-price">₹${item.price * item.quantity}</div>
                            <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #ff9500;">
                <div class="summary-line">
                    <span>Subtotal:</span>
                    <span>₹${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                </div>
                <div class="summary-line">
                    <span>Shipping:</span>
                    <span>₹${cart.length > 0 ? 100 : 0}</span>
                </div>
                <div class="summary-line total">
                    <span>Total:</span>
                    <span id="cartModalTotal">₹${(() => {
                        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                        const tax = Math.round(subtotal * 0.1);
                        return subtotal + 100 + tax;
                    })()}</span>
                </div>
            </div>
        `;
    }
}

// Render Wishlist Modal
function renderWishlistModal() {
    const wishlistModalContent = document.getElementById('wishlistModalContent');
    
    if (wishlist.length === 0) {
        wishlistModalContent.innerHTML = '<div class="empty-message">Your wishlist is empty</div>';
    } else {
        wishlistModalContent.innerHTML = wishlist.map(item => `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div class="product-name">${item.name}</div>
                    <div class="product-price">₹${item.price}</div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-add-cart" onclick="addToCart(${item.id})">Add Cart</button>
                    <button class="remove-btn" onclick="removeFromWishlist(${item.id})">Remove</button>
                </div>
            </div>
        `).join('');
    }
}

// Open Buy Now Modal
function openBuyNow(productId) {
    const product = products.find(p => p.id === productId);
    currentBuyNowProduct = product;
    document.getElementById('quickBuyName').textContent = product.name;
    document.getElementById('quickBuyPrice').textContent = `₹${product.price}`;
    openModal('quickBuyModal');
}

// Complete Buy Now
function completeBuyNow() {
    const name = document.getElementById('quickName').value;
    const phone = document.getElementById('quickPhone').value;
    const address = document.getElementById('quickAddress').value;
    const city = document.getElementById('quickCity').value;
    
    if (!name || !phone || !address || !city) {
        alert('Please fill all fields');
        return;
    }
    
    showSuccess(`Order placed successfully! ${currentBuyNowProduct.name} will be delivered to ${address}, ${city}`);
    closeModal('quickBuyModal');
    document.getElementById('quickName').value = '';
    document.getElementById('quickPhone').value = '';
    document.getElementById('quickAddress').value = '';
    document.getElementById('quickCity').value = '';
}

        // Switch Checkout Tabs
        function switchTab(tabName) {
            document.getElementById('addressTab').style.display = tabName === 'addressTab' ? 'block' : 'none';
            document.getElementById('paymentTab').style.display = tabName === 'paymentTab' ? 'block' : 'none';
            document.getElementById('otpTab').style.display = tabName === 'otpTab' ? 'block' : 'none';
            
            // Update button colors
            const buttons = document.querySelectorAll('button[onclick*="switchTab"]');
            buttons.forEach(btn => {
                const tabText = tabName.replace('Tab', '');
                btn.style.color = btn.textContent.includes(tabText) ? '#ff9500' : '#999';
            });

            // Generate and send OTP when switching to OTP tab
            if (tabName === 'otpTab') {
                generateAndSendOTP();
            }
        }

        // Generate OTP
        function generateOTP() {
            return Math.floor(1000 + Math.random() * 9000).toString();
        }

        // Generate and send OTP
        function generateAndSendOTP() {
            generatedOTP = generateOTP();
            const phone = document.getElementById('phone').value;
            
            if (!phone) {
                alert('Please enter your phone number');
                switchTab('addressTab');
                return;
            }

            // Mask phone number for display
            const maskedPhone = phone.slice(-2).padStart(phone.length, '*');
            document.getElementById('phoneMask').textContent = maskedPhone;

            // Show success message
            showSuccess(`OTP sent to ${phone}. For demo: OTP is ${generatedOTP}`);
        }

        // Move to next OTP input
        function moveToNext(current, nextId) {
            if (current.value.length === 1) {
                if (nextId) {
                    document.getElementById(nextId).focus();
                }
            }
        }

        // Resend OTP
        function resendOTP(e) {
            e.preventDefault();
            generateAndSendOTP();
        }

        // Verify OTP
        function verifyOTP() {
            const otp1 = document.getElementById('otp1').value;
            const otp2 = document.getElementById('otp2').value;
            const otp3 = document.getElementById('otp3').value;
            const otp4 = document.getElementById('otp4').value;

            const enteredOTP = otp1 + otp2 + otp3 + otp4;

            if (enteredOTP.length !== 4) {
                alert('❌ Please enter all 4 digits of OTP');
                return false;
            }

            if (enteredOTP === generatedOTP) {
                return true;
            } else {
                alert('❌ Incorrect OTP. Please try again.');
                return false;
            }
        }

        // Complete Checkout
        function completeCheckout() {
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            const city = document.getElementById('city').value;
            const cardNumber = document.getElementById('cardNumber').value;
            
            if (!fullName || !email || !phone || !address || !city || !cardNumber) {
                alert('Please fill all required fields');
                return;
            }
            
            if (cart.length === 0) {
                alert('Your cart is empty');
                return;
            }

            // Verify OTP
            if (!verifyOTP()) {
                return;
            }

            // Generate order
            generateOrder(fullName, email, phone, address, city);
            
            // Show confirmation modal
            showOrderConfirmation();

            // Close checkout modal
            closeModal('checkoutModal');
        }// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Show Success Message
function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = '✅ ' + message;
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

// Local Storage
function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function loadFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    const savedWishlist = localStorage.getItem('wishlist');
    
    if (savedCart) cart = JSON.parse(savedCart);
    if (savedWishlist) wishlist = JSON.parse(savedWishlist);
    
    renderProducts();
}

        // Close modal when clicking outside
        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        }

        // Generate Order
        function generateOrder(fullName, email, phone, address, city) {
            const orderNumber = 'ORD-' + Date.now();
            const orderDate = new Date().toLocaleDateString();
            
            currentOrder = {
                orderNumber,
                orderDate,
                customerName: fullName,
                email,
                phone,
                address,
                city,
                items: [...cart],
                subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                shipping: 100,
                tax: Math.round(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.1),
            };

            currentOrder.total = currentOrder.subtotal + currentOrder.shipping + currentOrder.tax;

            // Save order to localStorage
            let orders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders.push(currentOrder);
            localStorage.setItem('orders', JSON.stringify(orders));
        }

        // Show Order Confirmation
        function showOrderConfirmation() {
            if (!currentOrder) return;

            // Update order number
            document.getElementById('orderNumber').textContent = currentOrder.orderNumber;

            // Update order details
            let detailsHTML = currentOrder.items.map(item => `
                <div style="margin-bottom: 10px;">
                    <strong>${item.name}</strong> x${item.quantity} = ₹${item.price * item.quantity}
                </div>
            `).join('');

            detailsHTML += `
                <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Subtotal:</span>
                        <span>₹${currentOrder.subtotal}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Shipping:</span>
                        <span>₹${currentOrder.shipping}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Tax (10%):</span>
                        <span>₹${currentOrder.tax}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border-top: 1px solid #ddd; padding-top: 8px; margin-top: 8px;">
                        <span>Total:</span>
                        <span style="color: #ff9500;">₹${currentOrder.total}</span>
                    </div>
                </div>
            `;

            document.getElementById('confirmationOrderDetails').innerHTML = detailsHTML;

            // Update address
            document.getElementById('confirmationAddress').textContent = 
                `${currentOrder.address}, ${currentOrder.city}\nPhone: ${currentOrder.phone}\nEmail: ${currentOrder.email}`;

            // Clear cart and show modal
            cart = [];
            saveToLocalStorage();
            updateCartSummary();

            // Open confirmation modal
            document.getElementById('orderConfirmationModal').style.display = 'block';
        }

        // Reset checkout forms
        function resetCheckoutForms() {
            document.getElementById('fullName').value = '';
            document.getElementById('email').value = '';
            document.getElementById('phone').value = '';
            document.getElementById('address').value = '';
            document.getElementById('city').value = '';
            document.getElementById('state').value = '';
            document.getElementById('zip').value = '';
            document.getElementById('country').value = '';
            document.getElementById('cardName').value = '';
            document.getElementById('cardNumber').value = '';
            document.getElementById('expiry').value = '';
            document.getElementById('cvv').value = '';
            document.getElementById('otp1').value = '';
            document.getElementById('otp2').value = '';
            document.getElementById('otp3').value = '';
            document.getElementById('otp4').value = '';
            switchTab('addressTab');
        }

        // Download Bill PDF
        function downloadBillPDF() {
            if (!currentOrder) {
                alert('No order to download');
                return;
            }

            const billContent = `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #ff9500; margin: 0;">ShopHub</h1>
                        <h2 style="color: #333; margin: 10px 0 0 0;">Invoice</h2>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                        <div>
                            <h3 style="color: #27ae60; margin-top: 0;">Bill To:</h3>
                            <p style="margin: 5px 0;"><strong>${currentOrder.customerName}</strong></p>
                            <p style="margin: 5px 0;">${currentOrder.address}</p>
                            <p style="margin: 5px 0;">${currentOrder.city}</p>
                            <p style="margin: 5px 0;">Phone: ${currentOrder.phone}</p>
                            <p style="margin: 5px 0;">Email: ${currentOrder.email}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 5px 0;"><strong>Order Number:</strong></p>
                            <p style="font-size: 20px; color: #ff9500; font-weight: bold; font-family: monospace; margin: 5px 0;">${currentOrder.orderNumber}</p>
                            <p style="margin: 15px 0 5px 0;"><strong>Order Date:</strong></p>
                            <p style="margin: 5px 0;">${currentOrder.orderDate}</p>
                        </div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #ff9500 0%, #27ae60 100%); color: white;">
                                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Product</th>
                                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
                                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Unit Price</th>
                                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${currentOrder.items.map(item => `
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                                    <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                                    <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹${item.price}</td>
                                    <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹${item.price * item.quantity}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div style="display: grid; grid-template-columns: 1fr 300px; gap: 30px;">
                        <div></div>
                        <div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
                                <span>Subtotal:</span>
                                <span>₹${currentOrder.subtotal}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
                                <span>Shipping:</span>
                                <span>₹${currentOrder.shipping}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd;">
                                <span>Tax (10%):</span>
                                <span>₹${currentOrder.tax}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 12px 0; font-weight: bold; font-size: 18px; color: #ff9500;">
                                <span>Total Amount:</span>
                                <span>₹${currentOrder.total}</span>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #27ae60;">
                        <p style="margin: 0; color: #666; font-size: 13px;">
                            <strong>Thank you for your order!</strong> Your order has been confirmed. You will receive a tracking update shortly.
                        </p>
                    </div>

                    <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px;">
                        <p style="margin: 5px 0;">ShopHub © 2025 | www.shophub.com</p>
                        <p style="margin: 5px 0;">This is an automatically generated invoice.</p>
                    </div>
                </div>
            `;

            const element = document.createElement('div');
            element.innerHTML = billContent;
            
            const opt = {
                margin: 10,
                filename: `${currentOrder.orderNumber}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
            };

            html2pdf().set(opt).from(element).save();
            
            showSuccess('Bill downloaded successfully!');
        }