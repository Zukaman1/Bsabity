/**
 * ==========================================================================
 * Bsabity Furniture Workshop - Admin Dashboard Operations
 * ==========================================================================
 */

let cachedAdminProducts = [];
let cachedAdminGallery = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuthentication();
    initAdminFormHandlers();
    initGoogleDriveSettingsHandler();
});

/**
 * Checks authentication status and displays appropriate panels.
 */
function checkAdminAuthentication() {
    const isAuth = localStorage.getItem('bsabity_admin_auth') === 'true';
    const loginSection = document.getElementById('admin-login-section');
    const dashboardSection = document.getElementById('admin-dashboard-section');

    if (!loginSection || !dashboardSection) return;

    if (isAuth) {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        
        // Dynamically populate all category select dropdowns
        populateCategorySelectors();
        
        loadAdminData();
        initSearchAndFilters();
        initBulkSelectionHandlers();
    } else {
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
        initLoginHandler();
    }
}

/**
 * Populates all form dropdown selectors dynamically from the global category config
 */
function populateCategorySelectors() {
    const categories = window.FURNITURE_CATEGORIES || [];
    
    const prodCategorySelect = document.getElementById('product-category');
    const galleryCategorySelect = document.getElementById('gallery-img-category');
    const filterCategorySelect = document.getElementById('admin-filter-category');

    if (prodCategorySelect) {
        prodCategorySelect.innerHTML = categories.map(cat => 
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
    }

    if (galleryCategorySelect) {
        galleryCategorySelect.innerHTML = categories.map(cat => 
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
    }

    if (filterCategorySelect) {
        filterCategorySelect.innerHTML = '<option value="all">All Categories</option>' + categories.map(cat => 
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
    }
}

/**
 * Handles Password challenge (Default: admin123)
 */
function initLoginHandler() {
    const loginForm = document.getElementById('admin-login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const passwordInput = document.getElementById('admin-password');
        
        if (passwordInput && passwordInput.value === 'admin123') {
            localStorage.setItem('bsabity_admin_auth', 'true');
            showAlertBanner("Welcome back, Master Artisan!", "success");
            passwordInput.value = '';
            checkAdminAuthentication();
        } else {
            showAlertBanner("Incorrect Password. Try again.", "error");
            if (passwordInput) passwordInput.value = '';
        }
    });
}

/**
 * Logs the administrator out safely
 */
function logoutAdmin() {
    localStorage.removeItem('bsabity_admin_auth');
    showAlertBanner("Successfully logged out.", "success");
    checkAdminAuthentication();
}

/**
 * Loads products and gallery images to display inside dashboard tables.
 */
function loadAdminData() {
    loadAdminProducts();
    loadAdminGallery();
}

/**
 * Utility: Calculates discounted price from raw price string and percentage
 */
function getDiscountedPrice(priceStr, discountPercent) {
    if (!priceStr) return null;
    const discount = parseInt(discountPercent, 10);
    if (isNaN(discount) || discount <= 0) return null;
    
    // Extract numbers from price string (e.g. "180,000 RWF" -> 180000)
    const numericPart = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numericPart)) return null;
    
    const discountedNum = Math.round(numericPart * (1 - discount / 100));
    return discountedNum.toLocaleString() + " RWF";
}

/**
 * CRUD Operations: PRODUCTS
 */
async function loadAdminProducts() {
    const tableBody = document.getElementById('admin-products-table');
    const badge = document.getElementById('product-count-badge');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Loading product catalog...</td></tr>';

    try {
        const products = await loadProducts(); // Fetch globally from Google Drive or local fallback
        cachedAdminProducts = products;
        renderAdminProducts(products);
    } catch (err) {
        console.error("Error loading admin products:", err);
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center" style="color: red;">Failed to load catalog. Check connection.</td></tr>';
    }
}

/**
 * Renders the products list inside the admin inventory table
 */
function renderAdminProducts(products) {
    const tableBody = document.getElementById('admin-products-table');
    const badge = document.getElementById('product-count-badge');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    if (badge) {
        badge.textContent = `${products.length} Items`;
    }

    if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No matching products found.</td></tr>';
        return;
    }

    products.forEach((prod) => {
        const row = document.createElement('tr');
        const discountValue = parseInt(prod.discount, 10);
        let priceDisplay = prod.price;

        if (discountValue > 0) {
            const discPrice = getDiscountedPrice(prod.price, discountValue);
            if (discPrice) {
                priceDisplay = `
                    <span style="text-decoration: line-through; color: var(--text-muted); font-size: 0.85rem;">${prod.price}</span><br>
                    <strong style="color: #059669;">${discPrice}</strong> <small style="background: rgba(5,150,105,0.1); color: #059669; padding: 2px 4px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">${discountValue}% OFF</small>
                `;
            }
        }

        // Get pretty name of the category from global mapping
        const catObj = (window.FURNITURE_CATEGORIES || []).find(c => c.id === prod.category);
        const categoryName = catObj ? catObj.name : prod.category;

        row.innerHTML = `
            <td>
                <strong>${prod.name}</strong><br>
                <small style="color: var(--text-secondary); text-transform: uppercase;">${categoryName}</small>
            </td>
            <td>${priceDisplay}</td>
            <td><span class="price-tag-badge">${prod.availability}</span></td>
            <td>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="table-action-btn edit" onclick="editProductPrompt('${prod.id}')" title="Edit Product"><i class="fas fa-edit"></i></button>
                    <button class="table-action-btn delete" onclick="deleteProduct('${prod.id}')" title="Delete Product"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Live search and filter implementation
 */
function initSearchAndFilters() {
    const searchInput = document.getElementById('admin-search-products');
    const filterSelect = document.getElementById('admin-filter-category');

    const triggerFilter = () => {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const category = filterSelect ? filterSelect.value : 'all';

        const filtered = cachedAdminProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
            const matchesCategory = category === 'all' || p.category === category;
            return matchesSearch && matchesCategory;
        });

        renderAdminProducts(filtered);
    };

    if (searchInput) searchInput.addEventListener('input', triggerFilter);
    if (filterSelect) filterSelect.addEventListener('change', triggerFilter);
}

/**
 * Admin Forms submission handling (Product and Gallery)
 */
function initAdminFormHandlers() {
    const productForm = document.getElementById('admin-product-form');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const idInput = document.getElementById('product-id');
            const nameInput = document.getElementById('product-name');
            const categorySelect = document.getElementById('product-category');
            const descInput = document.getElementById('product-desc');
            const priceInput = document.getElementById('product-price');
            const discountInput = document.getElementById('product-discount');
            const availSelect = document.getElementById('product-avail');
            const imageFileInput = document.getElementById('product-image-file');

            let imageBase64 = null;
            if (imageFileInput && imageFileInput.files.length > 0) {
                imageBase64 = await convertFileToBase64(imageFileInput.files[0]);
            }

            const products = await loadProducts();

            if (idInput && idInput.value) {
                // UPDATE PRODUCT
                const index = products.findIndex(p => p.id === idInput.value);
                if (index !== -1) {
                    products[index].name = nameInput.value;
                    products[index].category = categorySelect.value;
                    products[index].description = descInput.value;
                    products[index].price = priceInput.value;
                    products[index].discount = discountInput.value ? parseInt(discountInput.value, 10) : 0;
                    products[index].availability = availSelect.value;
                    if (imageBase64) {
                        products[index].image = imageBase64;
                    }
                    showAlertBanner("Product updated successfully!", "success");
                }
            } else {
                // CREATE PRODUCT
                const newProduct = {
                    id: "prod_" + Date.now(),
                    name: nameInput.value,
                    category: categorySelect.value,
                    description: descInput.value,
                    price: priceInput.value,
                    discount: discountInput.value ? parseInt(discountInput.value, 10) : 0,
                    availability: availSelect.value,
                    image: imageBase64 || "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=600"
                };
                products.push(newProduct);
                showAlertBanner("New product added to catalog!", "success");
            }

            // Save globally and trigger sync with Google Drive
            await saveProducts(products);
            productForm.reset();
            if (idInput) idInput.value = '';
            
            // Toggle form title back to "Add"
            const titleEl = document.getElementById('form-action-title');
            if (titleEl) titleEl.innerHTML = '<i class="fas fa-box-open" style="color: #059669; margin-right: 0.5rem;"></i> Add New Product';

            loadAdminProducts();
        });
    }

    const galleryForm = document.getElementById('admin-gallery-form');
    if (galleryForm) {
        galleryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('gallery-img-title');
            const categorySelect = document.getElementById('gallery-img-category');
            const imageFileInput = document.getElementById('gallery-img-file');

            if (!imageFileInput || imageFileInput.files.length === 0) {
                showAlertBanner("Please select image file(s) to upload.", "error");
                return;
            }

            const files = Array.from(imageFileInput.files);
            const totalFiles = files.length;
            const titleBase = titleInput.value.trim() || "Workshop Creation";

            // Show and reset progress elements
            const progressContainer = document.getElementById('upload-progress-container');
            const progressBar = document.getElementById('upload-progress-bar');
            const progressText = document.getElementById('upload-progress-text');
            const progressPercent = document.getElementById('upload-progress-percent');

            if (progressContainer) progressContainer.style.display = 'block';

            let customGallery = JSON.parse(localStorage.getItem('bsabity_custom_gallery')) || [];
            let successfulUploads = 0;

            for (let i = 0; i < totalFiles; i++) {
                const file = files[i];
                const fileTitle = (i === 0) ? titleBase : file.name.split('.')[0].replace(/[-_]/g, ' ');

                // Update progress bar status
                const percent = Math.round((i / totalFiles) * 100);
                if (progressBar) progressBar.style.width = `${percent}%`;
                if (progressText) progressText.textContent = `Uploading item ${i + 1} of ${totalFiles}: "${fileTitle}"...`;
                if (progressPercent) progressPercent.textContent = `${percent}%`;

                try {
                    // Upload to Google Drive directly with title and category
                    const uploadedAsset = await uploadImage(file, fileTitle, categorySelect.value);

                    const newGalleryItem = {
                        id: uploadedAsset.id,
                        title: fileTitle,
                        category: categorySelect.value,
                        url: uploadedAsset.url,
                        thumbnail: uploadedAsset.thumbnail
                    };

                    customGallery.push(newGalleryItem);
                    successfulUploads++;
                } catch (error) {
                    console.error(`Upload error for file "${file.name}":`, error);
                }
            }

            // Final progress wrap-up
            if (progressBar) progressBar.style.width = '100%';
            if (progressPercent) progressPercent.textContent = '100%';
            if (progressText) progressText.textContent = `Completed! ${successfulUploads} of ${totalFiles} images uploaded successfully.`;

            // Save custom gallery cache locally
            localStorage.setItem('bsabity_custom_gallery', JSON.stringify(customGallery));

            setTimeout(() => {
                if (progressContainer) progressContainer.style.display = 'none';
                if (progressBar) progressBar.style.width = '0%';
                if (progressPercent) progressPercent.textContent = '0%';
                
                showAlertBanner(`Success! ${successfulUploads} images uploaded to Google Drive.`, "success");
                galleryForm.reset();
                loadAdminGallery();
            }, 1500);
        });
    }
}

/**
 * Edit Product Form Population Trigger
 */
async function editProductPrompt(id) {
    const products = await loadProducts();
    const prod = products.find(p => p.id === id);
    if (!prod) return;

    document.getElementById('product-id').value = prod.id;
    document.getElementById('product-name').value = prod.name;
    document.getElementById('product-category').value = prod.category;
    document.getElementById('product-desc').value = prod.description;
    document.getElementById('product-price').value = prod.price;
    document.getElementById('product-discount').value = prod.discount || '';
    document.getElementById('product-avail').value = prod.availability;

    const titleEl = document.getElementById('form-action-title');
    if (titleEl) titleEl.innerHTML = '<i class="fas fa-edit" style="color: #059669; margin-right: 0.5rem;"></i> Edit Product Details';

    // Scroll smoothly to form container
    document.querySelector('.admin-sidebar').scrollIntoView({ behavior: 'smooth' });
}
window.editProductPrompt = editProductPrompt;

/**
 * Deletes a product
 */
async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    let products = await loadProducts();
    products = products.filter(p => p.id !== id);
    await saveProducts(products);

    showAlertBanner("Product deleted successfully.", "success");
    loadAdminProducts();
}
window.deleteProduct = deleteProduct;

/**
 * CRUD Operations: GALLERY
 */
function loadAdminGallery() {
    const tableBody = document.getElementById('admin-gallery-table');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="3" class="text-center">Querying Google Drive Assets...</td></tr>';

    loadGallery().then(images => {
        cachedAdminGallery = images;
        renderAdminGallery(images);
    }).catch(err => {
        console.error("Failed to load admin gallery:", err);
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center" style="color: red;">Failed to retrieve gallery. Ensure SDK is connected.</td></tr>';
    });
}

/**
 * Renders gallery items list inside the admin table
 */
function renderAdminGallery(images) {
    const tableBody = document.getElementById('admin-gallery-table');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    // Reset bulk selection controls
    const masterCheckbox = document.getElementById('select-all-gallery');
    if (masterCheckbox) masterCheckbox.checked = false;
    updateBulkDeleteButton();

    if (images.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center">No images found.</td></tr>';
        return;
    }

    images.forEach(img => {
        const row = document.createElement('tr');
        
        // Get category label
        const catObj = (window.FURNITURE_CATEGORIES || []).find(c => c.id === img.category);
        const categoryLabel = catObj ? catObj.name : img.category;

        row.innerHTML = `
            <td style="text-align: center;">
                <input type="checkbox" class="gallery-select-checkbox" data-id="${img.id}" style="width: 18px; height: 18px; cursor: pointer;">
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${img.thumbnail}" alt="" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color);">
                    <div>
                        <strong>${img.title}</strong><br>
                        <small style="color: var(--text-secondary); text-transform: uppercase;">${categoryLabel}</small>
                    </div>
                </div>
            </td>
            <td>
                <div style="display: flex; justify-content: flex-end;">
                    <button class="table-action-btn delete" onclick="deleteGalleryItem('${img.id}')" title="Delete Gallery Image"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Re-bind click handlers on new checkboxes
    const checkboxes = document.querySelectorAll('.gallery-select-checkbox');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateBulkDeleteButton);
    });
}

/**
 * Handles individual item deletion
 */
async function deleteGalleryItem(id) {
    if (!confirm("Are you sure you want to delete this image? This will permanently delete it from Google Drive.")) return;

    try {
        showAlertBanner("Deleting from Google Drive...", "success");
        await deleteImage(id);
        
        let customGallery = JSON.parse(localStorage.getItem('bsabity_custom_gallery')) || [];
        customGallery = customGallery.filter(item => item.id !== id);
        localStorage.setItem('bsabity_custom_gallery', JSON.stringify(customGallery));

        showAlertBanner("Gallery asset deleted successfully.", "success");
        loadAdminGallery();
    } catch (error) {
        console.error("Deletion failed:", error);
        showAlertBanner("Failed to delete asset. Ensure Google Drive is connected.", "error");
    }
}
window.deleteGalleryItem = deleteGalleryItem;

/**
 * Set up check-all and check-item triggers for bulk gallery operations
 */
function initBulkSelectionHandlers() {
    const masterCheckbox = document.getElementById('select-all-gallery');
    const bulkDeleteBtn = document.getElementById('btn-delete-multiple-gallery');

    if (masterCheckbox) {
        masterCheckbox.addEventListener('change', () => {
            const isChecked = masterCheckbox.checked;
            const checkboxes = document.querySelectorAll('.gallery-select-checkbox');
            checkboxes.forEach(cb => cb.checked = isChecked);
            updateBulkDeleteButton();
        });
    }

    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', async () => {
            const selectedBoxes = document.querySelectorAll('.gallery-select-checkbox:checked');
            const idsToDelete = Array.from(selectedBoxes).map(cb => cb.getAttribute('data-id'));
            
            if (idsToDelete.length === 0) return;

            if (!confirm(`Are you sure you want to delete the ${idsToDelete.length} selected images? This will permanently delete them from Google Drive and cannot be undone.`)) {
                return;
            }

            showAlertBanner(`Deleting ${idsToDelete.length} assets from Google Drive...`, "success");

            let deletedCount = 0;
            let customGallery = JSON.parse(localStorage.getItem('bsabity_custom_gallery')) || [];

            for (const id of idsToDelete) {
                try {
                    await deleteImage(id);
                    customGallery = customGallery.filter(item => item.id !== id);
                    deletedCount++;
                } catch (error) {
                    console.error(`Error deleting image ID ${id}:`, error);
                }
            }

            localStorage.setItem('bsabity_custom_gallery', JSON.stringify(customGallery));
            showAlertBanner(`Deleted ${deletedCount} of ${idsToDelete.length} images successfully.`, "success");
            loadAdminGallery();
        });
    }
}

/**
 * Refreshes bulk deletion button state and text
 */
function updateBulkDeleteButton() {
    const selectedBoxes = document.querySelectorAll('.gallery-select-checkbox:checked');
    const countSpan = document.getElementById('selected-gallery-count');
    const bulkBtn = document.getElementById('btn-delete-multiple-gallery');

    if (!bulkBtn) return;

    if (selectedBoxes.length > 0) {
        bulkBtn.style.display = 'inline-flex';
        bulkBtn.style.alignItems = 'center';
        bulkBtn.style.gap = '0.5rem';
        if (countSpan) countSpan.textContent = selectedBoxes.length;
    } else {
        bulkBtn.style.display = 'none';
    }
}

/**
 * Bind and initialize Google Drive Setting Inputs & Authorization triggers
 */
function initGoogleDriveSettingsHandler() {
    const gdriveForm = document.getElementById('admin-gdrive-form');
    const authBtn = document.getElementById('btn-gdrive-auth');

    // Populate existing fields
    const clientIdField = document.getElementById('gdrive-client-id');
    const apiKeyField = document.getElementById('gdrive-api-key');
    const folderIdField = document.getElementById('gdrive-folder-id');

    if (clientIdField) clientIdField.value = GOOGLE_DRIVE_CONFIG.clientId || '';
    if (apiKeyField) apiKeyField.value = GOOGLE_DRIVE_CONFIG.apiKey || '';
    if (folderIdField) folderIdField.value = GOOGLE_DRIVE_CONFIG.folderId || '';

    // Check saved status banner
    const isConnected = localStorage.getItem('gdrive_connected_flag') === 'true';
    updateDriveConnectionStatus(isConnected);

    if (gdriveForm) {
        gdriveForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const config = {
                clientId: clientIdField.value.trim(),
                apiKey: apiKeyField.value.trim(),
                folderId: folderIdField.value.trim()
            };

            localStorage.setItem('bsabity_gdrive_config', JSON.stringify(config));
            
            // Apply live configurations
            GOOGLE_DRIVE_CONFIG.clientId = config.clientId;
            GOOGLE_DRIVE_CONFIG.apiKey = config.apiKey;
            GOOGLE_DRIVE_CONFIG.folderId = config.folderId;

            // Reset connected state on configuration update to require fresh connection
            localStorage.removeItem('gdrive_connected_flag');
            updateDriveConnectionStatus(false);

            showAlertBanner("Google Drive settings saved! Click Connect to authorize.", "success");
        });
    }

    if (authBtn) {
        authBtn.addEventListener('click', async () => {
            try {
                const authenticated = await authenticateGoogle();
                if (authenticated) {
                    loadAdminData(); // Refresh page data on successful connection
                }
            } catch (err) {
                console.error("Google Drive connection failed:", err);
            }
        });
    }
}

/**
 * Utility: Converts file to Base64 Data URL
 */
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}
