export const CLOUDINARY_CLOUD_NAME = "dahl4gfwe";
export const CLOUDINARY_UPLOAD_PRESET = "bsabity_unsigned";

/**
 * Uploads a file to Cloudinary using the REST Upload API
 * @param {File} file - The file to upload
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
export async function uploadToCloudinary(file) {
    if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === "YOUR_CLOUD_NAME") {
        throw new Error("Cloudinary Cloud Name is not configured.");
    }
    if (!CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_UPLOAD_PRESET === "YOUR_UPLOAD_PRESET") {
        throw new Error("Cloudinary Upload Preset is not configured.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    const response = await fetch(endpoint, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Cloudinary upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
        secure_url: data.secure_url,
        public_id: data.public_id
    };
}

/**
 * Deletes an image from Cloudinary using public_id
 * @param {string} publicId - The public_id of the image to delete
 */
export async function deleteFromCloudinary(publicId) {
    if (!publicId) {
        console.log("No Cloudinary public_id provided, skipping deletion.");
        return;
    }
    if (!CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME === "YOUR_CLOUD_NAME") {
        throw new Error("Cloudinary credentials are not configured (Cloud Name is placeholder).");
    }
    
    // Unsigned deletion requires a secure backend signature (api_secret) or a short-lived delete token.
    // We throw an error indicating deletion is unavailable client-side to be logged by the caller.
    console.warn(`Client-side deletion requested for public_id: ${publicId}`);
    throw new Error("Unsigned client-side deletion is not supported directly via public_id without secure backend signing.");
}
