/**
 * ==========================================================================
 * Bsabity Furniture Workshop - Real-time Firebase Admin Dashboard
 * ==========================================================================
 */

let cachedAdminProducts = [];
let cachedAdminGallery = [];
let productsUnsubscribe = null;
let galleryUnsubscribe = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuthentication();
    initAdminFormHandlers();
    initFirebaseControlCenter();
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
        
        // Populate all categories
        populateCategorySelectors();
        
        // Subscribe to real-time updates
        startRealtimeAdminSync();
        
        initSearchAndFilters();
        initBulkSelectionHandlers();
    } else {
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
        initLoginHandler();
    }
}

/**
 * Subscribes to real-time Firestore database updates
 */
function startRealtimeAdminSync() {
    // Unsubscribe from any previous listeners to avoid duplicates
    if (productsUnsubscribe) productsUnsubscribe();
    if (galleryUnsubscribe) galleryUnsubscribe();

    const tableBodyProducts = document.getElementById('admin-products-table');
    if (tableBodyProducts) {
        tableBodyProducts.innerHTML = '<tr><td colspan="4" class="text-center"><div class="loader-spinner" style="margin:0 auto;"></div><p style="margin-top:0.5rem;">Connecting to real-time catalog stream...</p></td></tr>';
    }

    const tableBodyGallery = document.getElementById('admin-gallery-table');
    if (tableBodyGallery) {
        tableBodyGallery.innerHTML = '<tr><td colspan="3" class="text-center"><div class="loader-spinner" style="margin:0 auto;"></div><p style="margin-top:0.5rem;">Connecting to real-time asset stream...</p></td></tr>';
    }

    // 1. Listen to real-time products
    const checkFirebaseActive = setInterval(() => {
        if (window.firebase && window.firebase.onProductsUpdate) {
            clearInterval(checkFirebaseActive);
            
            // Listen to Products
            productsUnsubscribe = window.firebase.onProductsUpdate((products) => {
                cachedAdminProducts = products;
                renderAdminProducts(products);
                
                // Keep the search and filters applied if user typed something
                const searchInput = document.getElementById('admin-search-products');
                const filterSelect = document.getElementById('admin-filter-category');
                if ((searchInput && searchInput.value) || (filterSelect && filterSelect.value !== 'all')) {
                    applySearchAndFilters();
                }
            });

            // Listen to Gallery
            galleryUnsubscribe = window.firebase.onGalleryUpdate((images) => {
                cachedAdminGallery = images;
                renderAdminGallery(images);
            });
        }
    }, 50);
}

/**
 * Populates all category selectors
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
    // Unsubscribe listeners
    if (productsUnsubscribe) {
        productsUnsubscribe();
        productsUnsubscribe = null;
    }
    if (galleryUnsubscribe) {
        galleryUnsubscribe();
        galleryUnsubscribe = null;
    }
    
    localStorage.removeItem('bsabity_admin_auth');
    showAlertBanner("Successfully logged out.", "success");
    checkAdminAuthentication();
}
window.logoutAdmin = logoutAdmin;

/**
 * Calculates discounted price
 */
function getDiscountedPrice(priceStr, discountPercent) {
    if (!priceStr) return null;
    const discount = parseInt(discountPercent, 10);
    if (isNaN(discount) || discount <= 0) return null;
    
    const numericPart = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numericPart)) return null;
    
    const discountedNum = Math.round(numericPart * (1 - discount / 100));
    return discountedNum.toLocaleString() + " RWF";
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
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No matching products found in database.</td></tr>';
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

        const catObj = (window.FURNITURE_CATEGORIES || []).find(c => c.id === prod.category);
        const categoryName = catObj ? catObj.name : prod.category;

        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="${prod.image || 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=150'}" alt="" style="width: 42px; height: 42px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color);">
                    <div>
                        <strong>${prod.name}</strong><br>
                        <small style="color: var(--text-secondary); text-transform: uppercase;">${categoryName}</small>
                    </div>
                </div>
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
 * Filter / Search Trigger
 */
function applySearchAndFilters() {
    const searchInput = document.getElementById('admin-search-products');
    const filterSelect = document.getElementById('admin-filter-category');

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const category = filterSelect ? filterSelect.value : 'all';

    const filtered = cachedAdminProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
        const matchesCategory = category === 'all' || p.category === category;
        return matchesSearch && matchesCategory;
    });

    renderAdminProducts(filtered);
}

function initSearchAndFilters() {
    const searchInput = document.getElementById('admin-search-products');
    const filterSelect = document.getElementById('admin-filter-category');

    if (searchInput) searchInput.addEventListener('input', applySearchAndFilters);
    if (filterSelect) filterSelect.addEventListener('change', applySearchAndFilters);
}

/**
 * Forms submission handlers
 */
function initAdminFormHandlers() {
    const productForm = document.getElementById('admin-product-form');
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = productForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

            try {
                const idInput = document.getElementById('product-id');
                const nameInput = document.getElementById('product-name');
                const categorySelect = document.getElementById('product-category');
                const descInput = document.getElementById('product-desc');
                const priceInput = document.getElementById('product-price');
                const discountInput = document.getElementById('product-discount');
                const availSelect = document.getElementById('product-avail');
                const imageFileInput = document.getElementById('product-image-file');

                let imageUrl = null;
                
                // Upload new image to Storage if selected
                if (imageFileInput && imageFileInput.files.length > 0) {
                    const file = imageFileInput.files[0];
                    showAlertBanner(`Uploading "${file.name}" to Cloud Storage...`, "success");
                    const uploadResult = await window.firebase.uploadImage(file, file.name, "products");
                    imageUrl = uploadResult.url;
                }

                const productPayload = {
                    name: nameInput.value.trim(),
                    category: categorySelect.value,
                    description: descInput.value.trim(),
                    price: priceInput.value.trim(),
                    discount: discountInput.value ? parseInt(discountInput.value, 10) : 0,
                    availability: availSelect.value
                };

                if (imageUrl) {
                    productPayload.image = imageUrl;
                }

                if (idInput && idInput.value) {
                    // Update Product in Firestore
                    await window.firebase.updateProduct(idInput.value, productPayload);
                    showAlertBanner("Product details updated in real-time!", "success");
                    
                    // If a new image was uploaded, also create/sync a matching gallery document
                    if (imageUrl) {
                        try {
                            const galleryItem = {
                                title: nameInput.value.trim(),
                                category: categorySelect.value,
                                url: imageUrl,
                                thumbnail: imageUrl
                            };
                            await window.firebase.addGalleryItem(galleryItem);
                            console.log("Automatically saved updated product image to Firestore gallery collection.");
                        } catch (galErr) {
                            console.error("Error saving updated product image to gallery collection:", galErr);
                        }
                    }
                } else {
                    // Create Product in Firestore
                    if (!imageUrl) {
                        // Unsplash design-conscious default fallbacks if no image was chosen
                        productPayload.image = "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=600";
                    }
                    await window.firebase.addProduct(productPayload);
                    showAlertBanner("New masterpiece added to Firebase database!", "success");

                    // Automatically create matching Gallery document if we have an image
                    const finalImage = productPayload.image;
                    try {
                        const galleryItem = {
                            title: productPayload.name,
                            category: productPayload.category,
                            url: finalImage,
                            thumbnail: finalImage
                        };
                        await window.firebase.addGalleryItem(galleryItem);
                        console.log("Automatically saved new product image to Firestore gallery collection.");
                    } catch (galErr) {
                        console.error("Error saving product image to gallery collection:", galErr);
                    }
                }

                productForm.reset();
                if (idInput) idInput.value = '';
                
                // Restore Form Action Name
                const titleEl = document.getElementById('form-action-title');
                if (titleEl) titleEl.innerHTML = '<i class="fas fa-box-open" style="color: #059669; margin-right: 0.5rem;"></i> Add New Product';

            } catch (err) {
                console.error("Error saving product: ", err);
                showAlertBanner("Failed to save product details.", "error");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        });
    }

    const galleryForm = document.getElementById('admin-gallery-form');
    if (galleryForm) {
        galleryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = galleryForm.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            
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

            // Show progress indicator
            const progressContainer = document.getElementById('upload-progress-container');
            const progressBar = document.getElementById('upload-progress-bar');
            const progressText = document.getElementById('upload-progress-text');
            const progressPercent = document.getElementById('upload-progress-percent');

            if (progressContainer) {
                progressContainer.style.display = 'block';
                progressBar.style.width = '0%';
                progressPercent.textContent = '0%';
                progressText.textContent = 'Preparing upload...';
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

            let successfulUploads = 0;

            try {
                for (let i = 0; i < totalFiles; i++) {
                    const file = files[i];
                    const fileTitle = (i === 0) ? titleBase : file.name.split('.')[0].replace(/[-_]/g, ' ');

                    // Update progress metrics
                    const percent = Math.round((i / totalFiles) * 100);
                    if (progressBar) progressBar.style.width = `${percent}%`;
                    if (progressText) progressText.textContent = `Uploading item ${i + 1} of ${totalFiles}: "${fileTitle}"...`;
                    if (progressPercent) progressPercent.textContent = `${percent}%`;

                    try {
                        // Upload directly to Cloud Storage
                        const uploadResult = await window.firebase.uploadImage(file, file.name);

                        // Insert metadata into Firestore gallery collection
                        const newGalleryItem = {
                            title: fileTitle,
                            category: categorySelect.value,
                            url: uploadResult.url,
                            thumbnail: uploadResult.url
                        };

                        await window.firebase.addGalleryItem(newGalleryItem);
                        successfulUploads++;
                    } catch (error) {
                        console.error(`Upload failed for file "${file.name}":`, error);
                        showAlertBanner(`Failed to upload "${file.name}".`, "error");
                    }
                }

                // Finished progress wrap-up
                if (progressBar) progressBar.style.width = '100%';
                if (progressPercent) progressPercent.textContent = '100%';
                
                if (successfulUploads > 0) {
                    if (progressText) progressText.textContent = `Upload completed! ${successfulUploads} of ${totalFiles} images uploaded to Firebase Storage.`;
                    showAlertBanner(`Success! ${successfulUploads} assets synchronized to Firebase Storage.`, "success");
                    galleryForm.reset();
                } else {
                    if (progressText) progressText.textContent = `Upload failed completely. 0 of ${totalFiles} images uploaded.`;
                    showAlertBanner("Upload process failed. No images were saved.", "error");
                }
            } catch (globalError) {
                console.error("Global upload handler error:", globalError);
                showAlertBanner("A system error occurred during upload.", "error");
            } finally {
                setTimeout(() => {
                    if (progressContainer) progressContainer.style.display = 'none';
                    if (progressBar) progressBar.style.width = '0%';
                    if (progressPercent) progressPercent.textContent = '0%';
                    
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }, 1500);
            }
        });
    }
}

/**
 * Edit Product Form Population Trigger
 */
function editProductPrompt(id) {
    const prod = cachedAdminProducts.find(p => p.id === id);
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
    if (!confirm("Are you sure you want to delete this product? This action is permanent.")) return;

    try {
        const prod = cachedAdminProducts.find(p => p.id === id);
        // If product has custom Firebase Storage image, delete it to save space!
        if (prod && prod.image) {
            await window.firebase.deleteImageByUrl(prod.image);
        }
        
        await window.firebase.deleteProduct(id);
        showAlertBanner("Product deleted successfully.", "success");
    } catch (error) {
        console.error("Deletion failed:", error);
        showAlertBanner("Failed to delete product from database.", "error");
    }
}
window.deleteProduct = deleteProduct;

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
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center">No portfolio images found in database.</td></tr>';
        return;
    }

    images.forEach(img => {
        const row = document.createElement('tr');
        
        const catObj = (window.FURNITURE_CATEGORIES || []).find(c => c.id === img.category);
        const categoryLabel = catObj ? catObj.name : img.category;

        row.innerHTML = `
            <td style="text-align: center;">
                <input type="checkbox" class="gallery-select-checkbox" data-id="${img.id}" data-url="${img.url}" style="width: 18px; height: 18px; cursor: pointer;">
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${img.thumbnail || img.url}" alt="" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color);">
                    <div>
                        <strong>${img.title}</strong><br>
                        <small style="color: var(--text-secondary); text-transform: uppercase;">${categoryLabel}</small>
                    </div>
                </div>
            </td>
            <td>
                <div style="display: flex; justify-content: flex-end;">
                    <button class="table-action-btn delete" onclick="deleteGalleryItem('${img.id}', '${img.url}')" title="Delete Gallery Image"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Rebind check events
    const checkboxes = document.querySelectorAll('.gallery-select-checkbox');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateBulkDeleteButton);
    });
}

/**
 * Handles individual item deletion
 */
async function deleteGalleryItem(id, url) {
    if (!confirm("Are you sure you want to delete this portfolio photo? This will permanently delete it from Firebase Storage.")) return;

    try {
        showAlertBanner("Deleting image from Cloud Storage...", "success");
        await window.firebase.deleteImageByUrl(url);
        await window.firebase.deleteGalleryItem(id);
        
        showAlertBanner("Gallery image successfully deleted.", "success");
    } catch (error) {
        console.error("Deletion failed:", error);
        showAlertBanner("Failed to delete gallery image.", "error");
    }
}
window.deleteGalleryItem = deleteGalleryItem;

/**
 * Set up bulk gallery operations
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
            if (selectedBoxes.length === 0) return;

            if (!confirm(`Are you sure you want to delete the ${selectedBoxes.length} selected images? This will permanently delete them from Firebase Storage and cannot be undone.`)) {
                return;
            }

            showAlertBanner(`Deleting ${selectedBoxes.length} images from Firebase...`, "success");

            let deletedCount = 0;

            for (const cb of selectedBoxes) {
                const id = cb.getAttribute('data-id');
                const url = cb.getAttribute('data-url');
                try {
                    await window.firebase.deleteImageByUrl(url);
                    await window.firebase.deleteGalleryItem(id);
                    deletedCount++;
                } catch (error) {
                    console.error(`Error deleting image ID ${id}:`, error);
                }
            }

            showAlertBanner(`Successfully deleted ${deletedCount} of ${selectedBoxes.length} gallery assets.`, "success");
        });
    }
}

/**
 * Refreshes bulk deletion button state
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
 * Configures the Firebase Seeding controls in the side panel
 */
function initFirebaseControlCenter() {
    const seedBtn = document.getElementById('btn-seed-data');
    if (seedBtn) {
        seedBtn.addEventListener('click', async () => {
            if (!confirm("This will populate empty Firestore collections with Bsabity's beautiful default metal and wood catalog products. Proceed?")) return;
            
            seedBtn.disabled = true;
            seedBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Seeding Firestore...';
            
            try {
                await window.firebase.seedInitialData();
                showAlertBanner("Firebase Firestore database has been successfully seeded!", "success");
            } catch (err) {
                console.error("Data seeding failed: ", err);
                showAlertBanner("Seeding database failed.", "error");
            } finally {
                seedBtn.disabled = false;
                seedBtn.innerHTML = '<i class="fas fa-magic"></i> Seed Premium Default Products';
            }
        });
    }
}
