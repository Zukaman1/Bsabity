/**
 * ==========================================================================
 * Bsabity Furniture Workshop - Real Google Drive API & GIS Integration
 * ==========================================================================
 * Powered by modern Google Identity Services (GIS) and secure Fetch calls.
 * Zero GAPI (gapi.client) dependencies for total stability and reliability.
 */

const DEFAULT_PRODUCTS = [
    {
        id: "prod_metal_bed",
        name: "Standard Metal Double Bed",
        category: "metal-beds",
        description: "Heavy-duty steel pipe double bed frame. Hand-welded, rust-protected matte black finish.",
        price: "180,000 RWF",
        availability: "In Stock"
    },
    {
        id: "prod_wooden_table",
        name: "Executive Mahogany Dining Table",
        category: "dining-tables",
        description: "Premium solid mahogany 8-seater dining table with custom high-gloss natural wood top varnish.",
        price: "450,000 RWF",
        availability: "Custom Build"
    },
    {
        id: "prod_office_desk",
        name: "Premium Office Workspace Desk",
        category: "office-tables",
        description: "Integrated storage cabinets, high-durability wooden composite finish, custom wire management.",
        price: "220,000 RWF",
        availability: "In Stock"
    },
    {
        id: "prod_wardrobe",
        name: "Modern 4-Door Wardrobe",
        category: "wardrobes",
        description: "Large-capacity bedroom cabinet with slide-out drawers, built-in hangers, and dressing mirrors.",
        price: "380,000 RWF",
        availability: "Custom Build"
    },
    {
        id: "prod_chair",
        name: "Ergonomic Office Chair",
        category: "office-chairs",
        description: "Cushioned posture chair with durable metal base, pneumatic height controls, and nylon caster wheels.",
        price: "85,000 RWF",
        availability: "In Stock"
    },
    {
        id: "prod_kitchen",
        name: "Custom Modular Kitchen Cabinet",
        category: "kitchen-cabinets",
        description: "Luxury modular kitchen set with acrylic finish doors, quartz countertops, and stainless handles.",
        price: "1,200,000 RWF",
        availability: "Custom Build"
    }
];

// Load configurations from LocalStorage if customized
const savedConfig = JSON.parse(localStorage.getItem('bsabity_gdrive_config')) || {};

const GOOGLE_DRIVE_CONFIG = {
    clientId: savedConfig.clientId || window.ENV_GOOGLE_CLIENT_ID || '1046960813958-b6v48f5aslca1ep3e8u6d8o37re9b054.apps.googleusercontent.com',
    apiKey: savedConfig.apiKey || window.ENV_GOOGLE_API_KEY || '',
    scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
    folderId: savedConfig.folderId || window.ENV_GOOGLE_FOLDER_ID || '1_HkXqK5vU-gVreWn0hK6S2iO0P2yB7Vv'
};

let gapiAuthToken = null;
let tokenClient = null;
let sdkInitPromise = null;

/**
 * Dynamically injects script tag into document head
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script ${src}`));
        document.head.appendChild(script);
    });
}

/**
 * Ensures Google Identity Services (GIS) library is loaded
 */
async function ensureSDKInitialized() {
    if (tokenClient) return true;
    if (sdkInitPromise) return sdkInitPromise;

    sdkInitPromise = (async () => {
        try {
            await loadScript('https://accounts.google.com/gsi/client');

            if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
                tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_DRIVE_CONFIG.clientId,
                    scope: GOOGLE_DRIVE_CONFIG.scopes,
                    callback: (resp) => {
                        if (window.onGoogleTokenReceived) {
                            window.onGoogleTokenReceived(resp);
                        }
                    }
                });
            } else {
                throw new Error("Google Identity Services not loaded properly.");
            }

            // Restore token if it is still valid
            const storedToken = localStorage.getItem('gapi_auth_token') || sessionStorage.getItem('gapi_auth_token');
            const storedExpiry = localStorage.getItem('gapi_auth_token_expiry') || sessionStorage.getItem('gapi_auth_token_expiry');

            if (storedToken && storedExpiry && Date.now() < parseInt(storedExpiry)) {
                gapiAuthToken = storedToken;
                console.log("Google Drive session restored from storage.");
                updateDriveConnectionStatus(true);
            }

            return true;
        } catch (error) {
            console.error("Error initializing Google Identity Services SDK:", error);
            return false;
        }
    })();

    return sdkInitPromise;
}

/**
 * Updates UI connection badges and buttons live
 */
function updateDriveConnectionStatus(connected) {
    const statusDiv = document.getElementById('gdrive-connection-status');
    const authBtn = document.getElementById('btn-gdrive-auth');
    if (connected) {
        if (statusDiv) {
            statusDiv.style.display = 'block';
        }
        if (authBtn) {
            authBtn.innerHTML = '<i class="fas fa-check-circle"></i> Connected to Google Drive';
            authBtn.style.backgroundColor = '#059669';
            authBtn.style.borderColor = '#059669';
            authBtn.disabled = true;
        }
        localStorage.setItem('gdrive_connected_flag', 'true');
    } else {
        if (statusDiv) {
            statusDiv.style.display = 'none';
        }
        if (authBtn) {
            authBtn.innerHTML = '<i class="fab fa-google"></i> Connect Google Drive';
            authBtn.style.backgroundColor = '#3b82f6';
            authBtn.style.borderColor = '#3b82f6';
            authBtn.disabled = false;
        }
    }
}

/**
 * Triggers Google Authentication via GIS Popup
 */
async function authenticateGoogle() {
    console.log("Initiating authentication with Google Drive API...");
    const sdkOk = await ensureSDKInitialized();
    if (!sdkOk) {
        showAlertBanner("Failed to load Google Identity Services SDK.", "error");
        return false;
    }

    return new Promise((resolve, reject) => {
        try {
            window.onGoogleTokenReceived = async (resp) => {
                if (resp.error !== undefined) {
                    console.error("Authentication Error response:", resp);
                    showAlertBanner(`Google Drive authorization failed: ${resp.error_description || resp.error}`, "error");
                    reject(resp);
                    return;
                }

                gapiAuthToken = resp.access_token;

                // Persist token for the duration of the expiry time (typically 3600s)
                const expiry = Date.now() + (resp.expires_in || 3600) * 1000;
                sessionStorage.setItem('gapi_auth_token', resp.access_token);
                sessionStorage.setItem('gapi_auth_token_expiry', expiry.toString());
                localStorage.setItem('gapi_auth_token', resp.access_token);
                localStorage.setItem('gapi_auth_token_expiry', expiry.toString());

                console.log("Successfully authenticated with Google Drive API.");
                updateDriveConnectionStatus(true);
                showAlertBanner("Authenticated with Google Drive!", "success");
                resolve(true);
            };

            // Trigger the Google OAuth screen popup
            tokenClient.requestToken({ prompt: 'consent' });
        } catch (error) {
            console.error("GIS RequestToken trigger error:", error);
            showAlertBanner(`Authentication Error: ${error.message || error}`, "error");
            reject(error);
        }
    });
}

/**
 * Searches for a file in Google Drive by filename
 */
async function findFileInDrive(filename) {
    try {
        const q = `'${GOOGLE_DRIVE_CONFIG.folderId}' in parents and name = '${filename}' and trashed = false`;
        let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`;
        
        const headers = {};
        if (gapiAuthToken) {
            headers['Authorization'] = 'Bearer ' + gapiAuthToken;
        } else if (GOOGLE_DRIVE_CONFIG.apiKey) {
            url += `&key=${GOOGLE_DRIVE_CONFIG.apiKey}`;
        } else {
            return null;
        }

        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`Find file HTTP error: ${response.status}`);
        }
        const data = await response.json();
        const files = data.files || [];
        return files.length > 0 ? files[0].id : null;
    } catch (e) {
        console.error(`Error finding ${filename} in Drive:`, e);
        return null;
    }
}

/**
 * Uploads JSON content to Google Drive (creates or overrides products.json)
 */
async function uploadJsonToDrive(filename, data) {
    if (!gapiAuthToken) {
        throw new Error("Google Drive is not authenticated.");
    }
    const existingFileId = await findFileInDrive(filename);

    const metadata = {
        name: filename,
        mimeType: 'application/json'
    };
    if (!existingFileId) {
        metadata.parents = [GOOGLE_DRIVE_CONFIG.folderId];
    }

    const boundary = 'foo_bar_boundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(data) +
        closeDelimiter;

    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    let method = 'POST';

    if (existingFileId) {
        url = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
        method = 'PATCH';
    }

    const response = await fetch(url, {
        method: method,
        headers: {
            'Authorization': 'Bearer ' + gapiAuthToken,
            'Content-Type': 'multipart/related; boundary=' + boundary
        },
        body: multipartRequestBody
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Upload JSON HTTP error: ${response.status} ${errText}`);
    }
    return await response.json();
}

/**
 * Uploads images directly into Google Drive Folder
 */
async function uploadImage(file, title, category) {
    const sdkOk = await ensureSDKInitialized();
    if (!sdkOk || !gapiAuthToken) {
        throw new Error("Google Drive is not authenticated.");
    }

    const boundary = 'foo_bar_boundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
        name: title || file.name,
        description: category || 'other',
        mimeType: file.type,
        parents: [GOOGLE_DRIVE_CONFIG.folderId]
    };

    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = async function(e) {
            const rawBase64 = e.target.result.split(',')[1] || e.target.result;
            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + file.type + '\r\n' +
                'Content-Transfer-Encoding: base64\r\n\r\n' +
                rawBase64 +
                closeDelimiter;

            try {
                const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + gapiAuthToken,
                        'Content-Type': 'multipart/related; boundary=' + boundary
                    },
                    body: multipartRequestBody
                });

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error("HTTP upload error: " + response.status + " " + errText);
                }

                const result = await response.json();
                resolve({
                    id: result.id,
                    name: result.name,
                    url: `https://lh3.googleusercontent.com/d/${result.id}=w1000`,
                    thumbnail: `https://lh3.googleusercontent.com/d/${result.id}=w400`
                });
            } catch (error) {
                console.error("Google Drive Upload API failure:", error);
                reject(error);
            }
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Query image assets directly from designated Google Drive Folder
 */
async function listImages() {
    const isDriveConnected = localStorage.getItem('gdrive_connected_flag') === 'true' || gapiAuthToken || GOOGLE_DRIVE_CONFIG.apiKey;

    if (isDriveConnected && GOOGLE_DRIVE_CONFIG.folderId) {
        try {
            console.log("Querying real images from Google Drive folder...");
            const q = `'${GOOGLE_DRIVE_CONFIG.folderId}' in parents and mimeType contains 'image/' and trashed = false`;
            let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,description)&pageSize=100`;
            
            const headers = {};
            if (gapiAuthToken) {
                headers['Authorization'] = 'Bearer ' + gapiAuthToken;
            } else if (GOOGLE_DRIVE_CONFIG.apiKey) {
                url += `&key=${GOOGLE_DRIVE_CONFIG.apiKey}`;
            }

            const response = await fetch(url, { headers });
            if (!response.ok) {
                throw new Error(`List images HTTP error: ${response.status}`);
            }

            const data = await response.json();
            const files = data.files || [];
            
            // Map drive files to our expected image objects
            return files.map(file => ({
                id: file.id,
                title: file.name ? file.name.split('.')[0] : "Furniture Masterpiece",
                category: file.description || "beds",
                url: `https://lh3.googleusercontent.com/d/${file.id}=w1000`,
                thumbnail: `https://lh3.googleusercontent.com/d/${file.id}=w400`
            }));
        } catch (error) {
            console.error("Error querying Google Drive images:", error);
            // If connection is verified, throw the error instead of silently falling back to mock Unsplash
            if (localStorage.getItem('gdrive_connected_flag') === 'true') {
                throw error;
            }
        }
    }

    // Fallback to local catalog images ONLY if Google Drive has never been configured
    return loadMockDatabaseImages();
}

/**
 * Permanent deletion of a file from Google Drive
 */
async function deleteImage(fileId) {
    if (!gapiAuthToken) {
        throw new Error("Google Drive is not authenticated.");
    }
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + gapiAuthToken
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Delete image HTTP error: ${response.status} ${errText}`);
    }
    return true;
}

/**
 * Global products persistence (Google Drive JSON sync)
 */
async function loadProducts() {
    const isDriveConnected = localStorage.getItem('gdrive_connected_flag') === 'true' || gapiAuthToken || GOOGLE_DRIVE_CONFIG.apiKey;

    if (isDriveConnected && GOOGLE_DRIVE_CONFIG.folderId) {
        try {
            console.log("Fetching products globally from Google Drive...");
            const fileId = await findFileInDrive('products.json');
            if (fileId) {
                let url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
                const headers = {};
                if (gapiAuthToken) {
                    headers['Authorization'] = 'Bearer ' + gapiAuthToken;
                } else if (GOOGLE_DRIVE_CONFIG.apiKey) {
                    url += `&key=${GOOGLE_DRIVE_CONFIG.apiKey}`;
                }

                const response = await fetch(url, { headers });
                if (response.ok) {
                    const products = await response.json();
                    console.log("Successfully loaded products from Google Drive:", products);
                    localStorage.setItem('bsabity_products', JSON.stringify(products));
                    return products;
                }
            } else if (gapiAuthToken) {
                console.log("products.json not found in Google Drive. Syncing local list up...");
                const localProds = JSON.parse(localStorage.getItem('bsabity_products')) || DEFAULT_PRODUCTS;
                await uploadJsonToDrive('products.json', localProds);
                return localProds;
            }
        } catch (error) {
            console.error("Google Drive products load failed:", error);
        }
    }

    // Fallback to local storage or defaults if Drive fetch failed or not connected
    let products = JSON.parse(localStorage.getItem('bsabity_products'));
    if (!products || products.length === 0) {
        products = DEFAULT_PRODUCTS;
        localStorage.setItem('bsabity_products', JSON.stringify(products));
    }
    return products;
}

/**
 * Sync updated product list with Google Drive
 */
async function saveProducts(products) {
    localStorage.setItem('bsabity_products', JSON.stringify(products));
    const isDriveConnected = localStorage.getItem('gdrive_connected_flag') === 'true' || gapiAuthToken;

    if (isDriveConnected && gapiAuthToken) {
        try {
            console.log("Syncing products list to Google Drive...");
            await uploadJsonToDrive('products.json', products);
            console.log("Sync complete!");
        } catch (error) {
            console.error("Error syncing products to Google Drive:", error);
            throw error;
        }
    }
}

/**
 * Legacy support for gallery page loaders
 */
async function loadGallery() {
    return await listImages();
}

/**
 * Mock data fallback when disconnected from Google Drive
 */
function loadMockDatabaseImages() {
    const defaults = [
        {
            id: "mock_metal_bed",
            title: "Royal Metal Bed Frame",
            category: "beds",
            url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200",
            thumbnail: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=500"
        },
        {
            id: "mock_wooden_table",
            title: "Rustic Oak Dining Table",
            category: "dining-tables",
            url: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=1200",
            thumbnail: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=500"
        },
        {
            id: "mock_office_desk",
            title: "Modern Executive Office Desk",
            category: "office-tables",
            url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=1200",
            thumbnail: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=500"
        },
        {
            id: "mock_wardrobe",
            title: "Built-In Walnut Wardrobe",
            category: "wardrobes",
            url: "https://images.unsplash.com/photo-1558882224-dda166733079?q=80&w=1200",
            thumbnail: "https://images.unsplash.com/photo-1558882224-dda166733079?q=80&w=500"
        },
        {
            id: "mock_chair",
            title: "Minimalist Lounge Chair",
            category: "lounge-chairs",
            url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1200",
            thumbnail: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=500"
        },
        {
            id: "mock_kitchen",
            title: "Premium Acrylic Kitchen Cabinets",
            category: "kitchen-cabinets",
            url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200",
            thumbnail: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=500"
        },
        {
            id: "mock_outdoor",
            title: "Teak Wood Patio Set",
            category: "outdoor-sets",
            url: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=1200",
            thumbnail: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=500"
        }
    ];

    const localGallery = JSON.parse(localStorage.getItem('bsabity_custom_gallery')) || [];
    return [...defaults, ...localGallery];
}

// Initial auto-activation
ensureSDKInitialized();
