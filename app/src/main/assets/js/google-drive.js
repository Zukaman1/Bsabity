/**
 * ==========================================================================
 * Bsabity Furniture Workshop - Firebase Backward-Compatibility Bridge
 * ==========================================================================
 * Legacy Google Drive code has been fully migrated to Firestore/Firebase Storage.
 * This script bridges any old calls directly to the new Firebase SDK.
 */

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

console.log("Legacy Google Drive SDK successfully removed. Substituted with Firebase-direct bridge.");
