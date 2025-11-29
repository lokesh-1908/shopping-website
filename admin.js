// Admin Product Management System

let products = [];
let editingProductId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromStorage();
    renderProductsTable();
    updateStats();
    setupDragDrop();
    setupFormSubmit();
    setupImagePreview();
});

// Load products from localStorage
function loadProductsFromStorage() {
    const stored = localStorage.getItem('shopProducts');
    if (stored) {
        products = JSON.parse(stored);
    }
}

// Save products to localStorage
function saveProductsToStorage() {
    localStorage.setItem('shopProducts', JSON.stringify(products));
}

// Setup image preview
function setupImagePreview() {
    const fileInput = document.getElementById('productImage');
    const preview = document.getElementById('imagePreview');

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                preview.src = event.target.result;
                preview.classList.add('show');
            };
            reader.readAsDataURL(file);
        }
    });
}

// Setup drag and drop
function setupDragDrop() {
    const dropZone = document.querySelector('.file-upload-btn');
    const fileInput = document.getElementById('productImage');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.style.background = '#e8f8f5';
        dropZone.style.borderColor = '#27ae60';
    }

    function unhighlight(e) {
        dropZone.style.background = '';
        dropZone.style.borderColor = '';
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        fileInput.files = files;

        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
    }
}

// Setup form submission
function setupFormSubmit() {
    const form = document.getElementById('productForm');
    form.addEventListener('submit', handleFormSubmit);
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const rating = document.getElementById('productRating').value.trim();
    const category = document.getElementById('productCategory').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const imageFile = document.getElementById('productImage').files[0];
    const productId = document.getElementById('productId').value;

    if (!name || !price || !rating) {
        showError('Please fill all required fields');
        return;
    }

    if (!imageFile && !productId) {
        showError('Please upload a product image');
        return;
    }

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const base64Image = event.target.result;

            if (productId) {
                // Update existing product
                const productIndex = products.findIndex(p => p.id == productId);
                if (productIndex !== -1) {
                    products[productIndex] = {
                        id: parseInt(productId),
                        name,
                        price,
                        rating,
                        category,
                        description,
                        image: base64Image,
                        emoji: generateEmojiForCategory(category)
                    };
                    showSuccess('Product updated successfully!');
                }
            } else {
                // Add new product
                const newProduct = {
                    id: Date.now(),
                    name,
                    price,
                    rating,
                    category,
                    description,
                    image: base64Image,
                    emoji: generateEmojiForCategory(category)
                };
                products.push(newProduct);
                showSuccess('Product added successfully!');
            }

            saveProductsToStorage();
            resetForm();
            renderProductsTable();
            updateStats();
        };
        reader.readAsDataURL(imageFile);
    } else if (productId) {
        // Update without changing image
        saveProductsToStorage();
        resetForm();
        renderProductsTable();
        updateStats();
    }
}

// Generate emoji based on category
function generateEmojiForCategory(category) {
    const emojiMap = {
        'electronics': '📱',
        'headphones': '🎧',
        'watch': '⌚',
        'cables': '🔌',
        'power': '🔋',
        'speakers': '🔊',
        'computer': '💻',
        'keyboard': '⌨️',
        'mouse': '🖱️',
        'camera': '📹',
        'protection': '📦',
        'default': '🛍️'
    };

    const key = category.toLowerCase();
    for (let [categoryKey, emoji] of Object.entries(emojiMap)) {
        if (key.includes(categoryKey)) {
            return emoji;
        }
    }
    return emojiMap['default'];
}

// Reset form
function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('imagePreview').classList.remove('show');
    document.getElementById('productId').value = '';
    editingProductId = null;
}

// Render products table
function renderProductsTable() {
    const container = document.getElementById('productsTableContainer');

    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">No products added yet. Add your first product above!</div>
            </div>
        `;
        return;
    }

    const tableHTML = `
        <table class="products-table">
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Rating</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                    <tr>
                        <td>
                            <img src="${product.image}" alt="${product.name}" class="product-image-thumb">
                        </td>
                        <td class="product-name-cell">${product.name}</td>
                        <td>${product.category || 'N/A'}</td>
                        <td class="product-price-cell">₹${product.price}</td>
                        <td>${product.rating}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-edit" onclick="editProduct(${product.id})">✏️ Edit</button>
                                <button class="btn-delete" onclick="deleteProduct(${product.id})">🗑️ Delete</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = tableHTML;
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductRating').value = product.rating;
    document.getElementById('editProductCategory').value = product.category || '';
    document.getElementById('editProductDescription').value = product.description || '';

    editingProductId = productId;

    const editForm = document.getElementById('editForm');
    editForm.onsubmit = function(e) {
        e.preventDefault();

        const productIndex = products.findIndex(p => p.id === editingProductId);
        if (productIndex !== -1) {
            products[productIndex].name = document.getElementById('editProductName').value;
            products[productIndex].price = parseFloat(document.getElementById('editProductPrice').value);
            products[productIndex].rating = document.getElementById('editProductRating').value;
            products[productIndex].category = document.getElementById('editProductCategory').value;
            products[productIndex].description = document.getElementById('editProductDescription').value;
            products[productIndex].emoji = generateEmojiForCategory(document.getElementById('editProductCategory').value);

            saveProductsToStorage();
            renderProductsTable();
            updateStats();
            closeEditModal();
            showSuccess('Product updated successfully!');
        }
    };

    document.getElementById('editModal').style.display = 'block';
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingProductId = null;
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        saveProductsToStorage();
        renderProductsTable();
        updateStats();
        showSuccess('Product deleted successfully!');
    }
}

// Update statistics
function updateStats() {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalValue').textContent = `₹${totalValue.toLocaleString('en-IN')}`;
}

// Show success message
function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = '✅ ' + message;
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

// Show error message
function showError(message) {
    alert('❌ ' + message);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
