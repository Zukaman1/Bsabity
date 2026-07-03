/**
 * ==========================================================================
 * Bsabity Furniture Workshop - Gallery & Lightbox Logic
 * ==========================================================================
 */

let activeGalleryImages = [];
let currentLightboxIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
    await initializeGallery();
    initLightbox();
});

/**
 * Initializes and fetches gallery assets, rendering the grid and setting up category filtering.
 */
async function initializeGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;

    // Show inline loading state in gallery
    galleryGrid.innerHTML = `
        <div class="text-center" style="grid-column: 1/-1; padding: 4rem 0;">
            <div class="loader-spinner" style="margin: 0 auto 1rem;"></div>
            <p>Loading handcrafted masterpieces...</p>
        </div>
    `;

    try {
        // Wait for window.firebase to be fully initialized and ready
        const checkFirebase = setInterval(() => {
            if (window.firebase && window.firebase.onGalleryUpdate) {
                clearInterval(checkFirebase);
                
                // Dynamically populate category filter buttons
                populateGalleryFilters();

                // Setup realtime listener directly from Firestore
                window.firebase.onGalleryUpdate((gallery) => {
                    activeGalleryImages = gallery;
                    renderGallery(activeGalleryImages);
                    initCategoryFilters();
                });
            }
        }, 50);
    } catch (error) {
        console.error("Gallery initialization error:", error);
        galleryGrid.innerHTML = `<p class="text-center" style="grid-column: 1/-1; color: var(--text-secondary);">Unable to load gallery assets. Please try again later.</p>`;
    }
}

/**
 * Dynamically builds the category filter pill list from the global catalog
 */
function populateGalleryFilters() {
    const filterContainer = document.querySelector('.gallery-filters');
    if (!filterContainer) return;

    const categories = window.FURNITURE_CATEGORIES || [];
    filterContainer.innerHTML = `
        <button class="filter-btn active" data-filter="all">All Projects</button>
        ${categories.map(cat => `<button class="filter-btn" data-filter="${cat.id}">${cat.name}</button>`).join('\n        ')}
    `;
}

/**
 * Renders the image items into the masonry-style grid
 * @param {Array} images - Array of gallery image objects
 */
function renderGallery(images) {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;

    if (images.length === 0) {
        galleryGrid.innerHTML = `<p class="text-center" style="grid-column: 1/-1; color: var(--text-secondary);">No custom gallery images found.</p>`;
        return;
    }

    galleryGrid.innerHTML = '';

    images.forEach((img, index) => {
        const item = document.createElement('div');
        
        // Add random wide/tall classes to create a beautiful organic masonry layout
        let gridClass = '';
        if (index % 5 === 1) {
            gridClass = 'wide';
        } else if (index % 5 === 3) {
            gridClass = 'tall';
        }

        item.className = `gallery-item ${gridClass}`;
        item.setAttribute('data-category', img.category);
        item.setAttribute('data-index', index);
        item.setAttribute('tabindex', '0'); // For Keyboard Accessibility
        item.setAttribute('aria-label', `View larger image of ${img.title}`);

        item.innerHTML = `
            <img src="${img.url}" alt="${img.title}" loading="lazy">
            <div class="gallery-overlay">
                <span class="gallery-category">${img.category}</span>
                <h3 class="gallery-title">${img.title}</h3>
            </div>
        `;

        // Click Event -> Lightbox
        item.addEventListener('click', () => {
            openLightbox(index);
        });

        // Keydown Event (Enter/Space) -> Lightbox
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });

        galleryGrid.appendChild(item);
    });
}

/**
 * Handles category filtering animation & visibility
 */
function initCategoryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryGrid = document.getElementById('gallery-grid');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Toggle active status
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-filter');
            const items = galleryGrid.querySelectorAll('.gallery-item');

            items.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                // Animate entry / exit transitions smoothly
                if (category === 'all' || itemCategory === category) {
                    item.style.display = '';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

/**
 * Fullscreen Interactive Lightbox Engine
 */
function initLightbox() {
    // Create the lightbox container dynamically if not present in the HTML page.
    let lightbox = document.getElementById('lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-label', 'Image Viewer');

        lightbox.innerHTML = `
            <button class="lightbox-close" id="lightbox-close" aria-label="Close Lightbox">&times;</button>
            <button class="lightbox-nav lightbox-prev" id="lightbox-prev" aria-label="Previous Image">&#10094;</button>
            <div class="lightbox-content">
                <img class="lightbox-img" id="lightbox-img" src="" alt="">
                <p class="lightbox-caption" id="lightbox-caption"></p>
            </div>
            <button class="lightbox-nav lightbox-next" id="lightbox-next" aria-label="Next Image">&#10095;</button>
        `;

        document.body.appendChild(lightbox);
    }

    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    // Event listeners
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', navigatePrev);
    nextBtn.addEventListener('click', navigateNext);

    // Dismiss when backdrop is clicked
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation accessibility
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigatePrev();
        if (e.key === 'ArrowRight') navigateNext();
    });
}

function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const imgElement = document.getElementById('lightbox-img');
    const captionElement = document.getElementById('lightbox-caption');

    if (!lightbox || activeGalleryImages.length === 0) return;

    currentLightboxIndex = index;
    const activeImage = activeGalleryImages[index];

    imgElement.src = activeImage.url;
    imgElement.alt = activeImage.title;
    captionElement.textContent = activeImage.title;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
    
    // Set focus on close button
    setTimeout(() => {
        document.getElementById('lightbox-close').focus();
    }, 100);
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function navigatePrev() {
    let nextIndex = currentLightboxIndex - 1;
    if (nextIndex < 0) {
        nextIndex = activeGalleryImages.length - 1;
    }
    openLightbox(nextIndex);
}

function navigateNext() {
    let nextIndex = currentLightboxIndex + 1;
    if (nextIndex >= activeGalleryImages.length) {
        nextIndex = 0;
    }
    openLightbox(nextIndex);
}
