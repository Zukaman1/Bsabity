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

## 🔥 Pure Firebase Cloud Architecture

The entire project is backed by Firebase for secure, real-time, scale-ready cloud storage and data persistence.

### 🗄️ 1. Cloud Firestore Database
The system uses real-time snapshot listeners (`onSnapshot`) to synchronize product listings and the portfolio showcase instantly across all client devices without full-page reloads.

- **`products` Collection:** Contains the workshop's product catalog. Each document has:
  - `name` (String)
  - `category` (String)
  - `description` (String)
  - `price` (String)
  - `discount` (Number)
  - `availability` (String)
  - `image` (String - Storage download URL)
  - `createdAt` (String - ISO Timestamp)
- **`gallery` Collection:** Stores the portfolio images rendered in the masonry gallery grid:
  - `title` (String)
  - `category` (String)
  - `url` (String - Storage download URL)
  - `thumbnail` (String - Storage download URL)
  - `createdAt` (String - ISO Timestamp)

### 📁 2. Firebase Storage
Assets are organized cleanly inside Firebase Storage buckets:
- **`gallery/`**: Main portfolio photos and client showcase files.
- **`products/`**: Images associated with catalog products.

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

#### Firebase Storage Rules (`storage.rules`):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
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
     - It is sent to Firebase Storage under the `products/` path.
     - A product document is created in the Firestore `products` collection.
     - A matching showcase document is automatically created in the `gallery` collection.
3. **Gallery Upload Flow:**
   - Multi-select multiple files to bulk-upload to Firebase Storage under the `gallery/` path.
   - Documents are created instantly in the `gallery` collection and updated on the gallery page in real-time.
4. **Delete and Purge Flow:**
   - Clicking delete on any product or gallery image removes the Firestore document and purges the file from Firebase Storage automatically to save bucket space.

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
