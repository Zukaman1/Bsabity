/**
 * ==========================================================================
 * Bsabity Furniture Workshop - Real Firebase SDK Integration
 * ==========================================================================
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    doc, 
    onSnapshot, 
    query, 
    where, 
    orderBy, 
    setDoc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject, 
    listAll 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Secure & correct production-ready config
const firebaseConfig = {
    apiKey: window.ENV_FIREBASE_API_KEY || "AIzaSyAs-M6vY_G8X9S0fE2k8P9B1m7V3l4Y5uI", // Injected at runtime or fallback
    authDomain: "bsabity-furniture.firebaseapp.com",
    projectId: "bsabity-furniture",
    storageBucket: "bsabity-furniture.appspot.com",
    messagingSenderId: "1046960813958",
    appId: "1:1046960813958:web:b1d8f8e0d4c1c9c7f68ad8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Default lists for automatic database seeding
const DEFAULT_PRODUCTS = [
    {
        name: "Standard Metal Double Bed",
        category: "metal-beds",
        description: "Heavy-duty steel pipe double bed frame. Hand-welded, rust-protected matte black finish.",
        price: "180,000 RWF",
        discount: 0,
        availability: "In Stock",
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600"
    },
    {
        name: "Executive Mahogany Dining Table",
        category: "dining-tables",
        description: "Premium solid mahogany 8-seater dining table with custom high-gloss natural wood top varnish.",
        price: "450,000 RWF",
        discount: 10,
        availability: "Custom Build",
        image: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=600"
    },
    {
        name: "Premium Office Workspace Desk",
        category: "office-tables",
        description: "Integrated storage cabinets, high-durability wooden composite finish, custom wire management.",
        price: "220,000 RWF",
        discount: 0,
        availability: "In Stock",
        image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=600"
    },
    {
        name: "Modern 4-Door Wardrobe",
        category: "wardrobes",
        description: "Large-capacity bedroom cabinet with slide-out drawers, built-in hangers, and dressing mirrors.",
        price: "380,000 RWF",
        discount: 5,
        availability: "Custom Build",
        image: "https://images.unsplash.com/photo-1558882224-dda166733079?q=80&w=600"
    },
    {
        name: "Ergonomic Office Chair",
        category: "office-chairs",
        description: "Cushioned posture chair with durable metal base, pneumatic height controls, and nylon caster wheels.",
        price: "85,000 RWF",
        discount: 0,
        availability: "In Stock",
        image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=600"
    },
    {
        name: "Custom Modular Kitchen Cabinet",
        category: "kitchen-cabinets",
        description: "Luxury modular kitchen set with acrylic finish doors, quartz countertops, and stainless handles.",
        price: "1,200,000 RWF",
        discount: 0,
        availability: "Custom Build",
        image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600"
    }
];

const DEFAULT_GALLERY = [
    {
        title: "Royal Metal Bed Frame",
        category: "metal-beds",
        url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200",
        thumbnail: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=500"
    },
    {
        title: "Rustic Oak Dining Table",
        category: "dining-tables",
        url: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=1200",
        thumbnail: "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=500"
    },
    {
        title: "Modern Executive Office Desk",
        category: "office-tables",
        url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=1200",
        thumbnail: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=500"
    },
    {
        title: "Built-In Walnut Wardrobe",
        category: "wardrobes",
        url: "https://images.unsplash.com/photo-1558882224-dda166733079?q=80&w=1200",
        thumbnail: "https://images.unsplash.com/photo-1558882224-dda166733079?q=80&w=500"
    },
    {
        title: "Minimalist Lounge Chair",
        category: "lounge-chairs",
        url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1200",
        thumbnail: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=500"
    },
    {
        title: "Premium Acrylic Kitchen Cabinets",
        category: "kitchen-cabinets",
        url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200",
        thumbnail: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=500"
    },
    {
        title: "Teak Wood Patio Set",
        category: "outdoor-furniture",
        url: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=1200",
        thumbnail: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=500"
    }
];

// Seed databases if they are empty
let isSeedingInProgress = false;

async function seedInitialDatabase() {
    if (isSeedingInProgress) {
        console.log("Database seeding is already in progress...");
        return;
    }
    
    // Check local storage to prevent running multiple times in the same session/browser
    if (localStorage.getItem('bsabity_db_seeded') === 'true' || localStorage.getItem('bsabity_db_seeding') === 'true') {
        console.log("Database seeding already verified, completed, or in progress.");
        return;
    }

    isSeedingInProgress = true;
    localStorage.setItem('bsabity_db_seeding', 'true');
    try {
        // 1. Seed Categories
        const catSnap = await getDocs(collection(db, "categories"));
        if (catSnap.empty) {
            console.log("Seeding initial categories...");
            const batch = writeBatch(db);
            const categories = window.FURNITURE_CATEGORIES || [];
            categories.forEach(cat => {
                const docRef = doc(collection(db, "categories"), cat.id);
                batch.set(docRef, { 
                    name: cat.name,
                    createdAt: new Date().toISOString()
                });
            });
            await batch.commit();
            console.log("Categories successfully seeded!");
        }

        // 2. Seed Products
        const prodSnap = await getDocs(collection(db, "products"));
        if (prodSnap.empty) {
            console.log("Seeding initial products...");
            const batch = writeBatch(db);
            DEFAULT_PRODUCTS.forEach(prod => {
                const newDocRef = doc(collection(db, "products"));
                batch.set(newDocRef, {
                    ...prod,
                    createdAt: new Date().toISOString()
                });
            });
            await batch.commit();
            console.log("Products successfully seeded!");
        }

        // 3. Seed Gallery
        const gallerySnap = await getDocs(collection(db, "gallery"));
        if (gallerySnap.empty) {
            console.log("Seeding initial gallery items...");
            const batch = writeBatch(db);
            DEFAULT_GALLERY.forEach(item => {
                const newDocRef = doc(collection(db, "gallery"));
                batch.set(newDocRef, {
                    ...item,
                    createdAt: new Date().toISOString()
                });
            });
            await batch.commit();
            console.log("Gallery successfully seeded!");
        }

        // Mark as seeded in localStorage to prevent subsequent checks
        localStorage.setItem('bsabity_db_seeded', 'true');
    } catch (error) {
        console.error("Error seeding initial database: ", error);
    } finally {
        isSeedingInProgress = false;
        localStorage.removeItem('bsabity_db_seeding');
    }
}

// Global Exports
window.firebase = {
    db,
    storage,
    
    // Products REST replacement CRUD with onSnapshot Realtime Listeners
    onProductsUpdate: (callback) => {
        const q = collection(db, "products");
        return onSnapshot(q, (snapshot) => {
            const products = [];
            snapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() });
            });
            
            // Sort client-side to ensure query never fails due to missing composite indexes
            products.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                if (dateB !== dateA) return dateB - dateA; // Newest first
                return (a.name || "").localeCompare(b.name || "");
            });
            
            callback(products);
        }, (error) => {
            console.error("Realtime products sync error:", error);
            // Fallback
            callback(DEFAULT_PRODUCTS.map((p, i) => ({ id: `default_prod_${i}`, ...p })));
        });
    },

    addProduct: async (product) => {
        const docRef = await addDoc(collection(db, "products"), {
            ...product,
            createdAt: new Date().toISOString()
        });
        return docRef.id;
    },

    updateProduct: async (id, product) => {
        const docRef = doc(db, "products", id);
        await updateDoc(docRef, {
            ...product,
            updatedAt: new Date().toISOString()
        });
    },

    deleteProduct: async (id) => {
        const docRef = doc(db, "products", id);
        await deleteDoc(docRef);
    },

    // Gallery operations
    onGalleryUpdate: (callback) => {
        const q = collection(db, "gallery");
        return onSnapshot(q, (snapshot) => {
            const items = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            
            // Sort client-side to guarantee compatibility without index requirements
            items.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                if (dateB !== dateA) return dateB - dateA; // Newest first
                return (a.title || "").localeCompare(b.title || "");
            });
            
            callback(items);
        }, (error) => {
            console.error("Realtime gallery sync error:", error);
            callback(DEFAULT_GALLERY.map((g, i) => ({ id: `default_gal_${i}`, ...g })));
        });
    },

    addGalleryItem: async (item) => {
        const docRef = await addDoc(collection(db, "gallery"), {
            ...item,
            createdAt: new Date().toISOString()
        });
        return docRef.id;
    },

    deleteGalleryItem: async (id) => {
        const docRef = doc(db, "gallery", id);
        await deleteDoc(docRef);
    },

    // Firebase Storage upload & delete with built-in timeout to avoid infinite hanging
    uploadImage: async (file, fileName) => {
        try {
            const uniqueName = `gallery/${Date.now()}_${fileName || file.name}`;
            const storageRef = ref(storage, uniqueName);
            
            // Timeout limit: 20 seconds for the entire chunk upload to prevent infinite spinner
            const uploadPromise = uploadBytes(storageRef, file);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Upload timed out (20 second limit exceeded)")), 20000)
            );
            
            const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
            
            // Get URL with a 10s timeout
            const urlPromise = getDownloadURL(snapshot.ref);
            const urlTimeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Getting download URL timed out")), 10000)
            );
            
            const downloadUrl = await Promise.race([urlPromise, urlTimeoutPromise]);
            
            return {
                url: downloadUrl,
                storagePath: uniqueName
            };
        } catch (error) {
            console.error("Firebase uploadImage encountered an error:", error);
            throw error; // Propagate error so that calling UI components can turn off their loading spinners/disable-states
        }
    },

    deleteImageByUrl: async (imageUrl) => {
        try {
            // Extract the storage reference path from the download URL if it belongs to Firebase
            if (imageUrl.includes("firebasestorage.googleapis.com")) {
                const decodedUrl = decodeURIComponent(imageUrl);
                const matches = decodedUrl.match(/\/o\/(.*?)\?alt=media/);
                if (matches && matches[1]) {
                    const storagePath = matches[1];
                    const storageRef = ref(storage, storagePath);
                    await deleteObject(storageRef);
                    console.log("Successfully deleted object from Storage:", storagePath);
                }
            }
        } catch (error) {
            console.error("Error deleting image from Storage: ", error);
        }
    },

    // Seed helper
    seedInitialData: async () => {
        await seedInitialDatabase();
    }
};

// Auto-seed if empty when database loads
seedInitialDatabase();

// Legacy backward-compatibility wrapper helpers (previously in google-drive.js)
window.loadProducts = async function() {
    return new Promise((resolve) => {
        const checkFirebase = setInterval(() => {
            if (window.firebase && window.firebase.onProductsUpdate) {
                clearInterval(checkFirebase);
                const unsubscribe = window.firebase.onProductsUpdate((products) => {
                    unsubscribe();
                    resolve(products);
                });
            }
        }, 50);
    });
};

window.loadGallery = async function() {
    return new Promise((resolve) => {
        const checkFirebase = setInterval(() => {
            if (window.firebase && window.firebase.onGalleryUpdate) {
                clearInterval(checkFirebase);
                const unsubscribe = window.firebase.onGalleryUpdate((gallery) => {
                    unsubscribe();
                    resolve(gallery);
                });
            }
        }, 50);
    });
};

console.log("Firebase initialized successfully with real-time listeners and fallback systems.");
