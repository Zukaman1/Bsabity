# Bsabity Furniture Workshop - Premium Web & Android Project (Firebase Powered)

Welcome to the official codebase of **Bsabity Furniture Workshop**, a premium, responsive web application and integrated native Android companion app engineered for a world-class furniture manufacturing workshop in Rwanda.

This repository features a modern, cloud-native **dual-delivery architecture**:
1. **Premium Web Application (HTML5, CSS3, JavaScript):** Powered by **Firebase (Firestore, Storage, CDN v12)**, fully installable (Progressive Web App - PWA), featuring a masonry image gallery, real-time catalogs, and interactive dashboard controllers.
2. **Native Android Companion App (Jetpack Compose, Kotlin, WebView):** Runs a localized, high-speed container of the web system directly inside an Android container, featuring edge-to-edge screens and back-gesture handlers.

---

## 🚀 How to Run Locally

### 1. Web Application (Browser)
Because the website is built on static web standards, you can run it without any local compilation:
- **Option A (Double-Click):** Simply open the root `index.html` file in any modern web browser.
- **Option B (Local Web Server - Recommended):** To test PWA capabilities, offline caching (Service Workers), or Firebase database synchronization, run a simple local HTTP server from the root directory:
  ```bash
  # Using Python 3
  python3 -m http.server 8000
  
  # Using Node.js (npx)
  npx serve .
  ```
  Then, navigate your web browser to `http://localhost:8000`.

### 2. Android App (Emulator / Device)
Since the project uses an incremental compilation pipeline, you can compile and launch the companion Android app onto a streaming emulator or a physical device:
- Gradle automatically copies all root web assets (`index.html`, `css/`, `js/`, etc.) into the Android package assets folder upon compile.
- In Android Studio, open the root folder, wait for Gradle synchronization, and click **Run**.

---

## 🔥 Hybrid Cloud Architecture (Firestore & Cloudinary)

The entire project is backed by a hybrid cloud architecture, combining the real-time data synchronization of **Firebase Firestore** with the robust media optimization of **Cloudinary**.

### 🗄️ 1. Cloud Firestore Database
The system uses real-time snapshot listeners (`onSnapshot`) to synchronize product listings and the portfolio showcase instantly across all client devices without full-page reloads.

- **`products` Collection:** Contains the workshop's product catalog. Each document has:
  - `name` (String)
  - `category` (String)
  - `description` (String)
  - `price` (String)
  - `discount` (Number)
  - `availability` (String)
  - `image` (String - Cloudinary secure URL)
  - `cloudinaryPublicId` (String - Cloudinary resource public ID)
  - `createdAt` (String - ISO Timestamp)
- **`gallery` Collection:** Stores the portfolio images rendered in the masonry gallery grid:
  - `title` (String)
  - `category` (String)
  - `url` (String - Cloudinary secure URL)
  - `thumbnail` (String - Cloudinary secure URL)
  - `cloudinaryPublicId` (String - Cloudinary resource public ID)
  - `createdAt` (String - ISO Timestamp)

### 📁 2. Cloudinary Media Storage
Images and portfolio files are stored on Cloudinary. The frontend performs direct, secure unsigned uploads to Cloudinary via the REST Upload API.

#### Cloudinary Configuration
To configure Cloudinary:
1. Open the file **`/js/cloudinary.js`**.
2. Update the credentials with your Cloudinary Cloud Name and Unsigned Upload Preset:
   ```javascript
   export const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUD_NAME";
   export const CLOUDINARY_UPLOAD_PRESET = "YOUR_UPLOAD_PRESET";
   ```
3. To enable Unsigned Uploads in Cloudinary:
   - Go to your Cloudinary Dashboard.
   - Click on **Settings** (Gear Icon) -> **Upload**.
   - Scroll down to **Upload presets** and click **Add upload preset**.
   - Change the **Signing mode** from *Signed* to *Unsigned*.
   - Copy the generated preset name and paste it as `CLOUDINARY_UPLOAD_PRESET`.

### 🛡️ 3. Security Rules Configurations

#### Cloud Firestore Rules (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 🛠️ Real-Time Admin Dashboard

To make inventory and showcase updates seamless, Bsabity Furniture uses an integrated client-side **Admin Dashboard** (`admin.html`):

1. **Authentication:** Enter the default password **`admin123`** to access the dashboard.
2. **Product Save Flow:**
   - Add new items or edit existing ones.
   - When saving, if a custom preview image is uploaded:
     - It is sent to Cloudinary via the REST Upload API.
     - A product document is created in the Firestore `products` collection with the Cloudinary `image` and `cloudinaryPublicId`.
     - A matching showcase document is automatically created in the `gallery` collection with the Cloudinary `url`, `thumbnail`, and `cloudinaryPublicId`.
3. **Gallery Upload Flow:**
   - Multi-select multiple files to bulk-upload to Cloudinary.
   - Documents are created instantly in the `gallery` collection and updated on the gallery page in real-time.
4. **Delete and Purge Flow:**
   - Clicking delete on any product or gallery image removes the Firestore document and requests deletion of the file from Cloudinary (using the `cloudinaryPublicId` when configured).

---

## ☁️ Online Deployment & Hosting

### 1. Deploying to GitHub Pages (100% Free)
1. Initialize a Git repository in the root folder and push to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "fix: fully migrate project to Firebase"
   git branch -M main
   git remote add origin https://github.com/Zukaman1/Bsabity.git
   git push -u origin main
   ```
2. On GitHub, navigate to **Settings** -> **Pages**.
3. Under **Build and deployment**, set the source to **Deploy from a branch**.
4. Select the **main** branch and `/ (root)` folder, and click **Save**.

### 2. Deploying to Vercel or Netlify
- Connect your GitHub repository to Vercel/Netlify for immediate deployment.
- No build command is required. Set the publish directory to `.` (root).

---

## ⚙️ Changing Business Information
To update contact details or localized content:
* **Contact Phone:** Search and replace `+250 783 847 520` in all HTML files.
* **Contact Email:** Search and replace `Bsabity@gmail.com` in all HTML files.
* **Translations:** Open `/js/app.js` and modify elements inside the `TRANSLATIONS` dictionary.
