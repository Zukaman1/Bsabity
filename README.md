# Bsabity Furniture Workshop - Premium Web & Android Project

Welcome to the official codebase of **Bsabity Furniture Workshop**, a premium, responsive web application and integrated native Android companion app engineered for a world-class furniture manufacturing workshop in Rwanda.

This repository features a **dual-delivery architecture**:
1. **Premium Web Application (HTML5, CSS3, JavaScript):** Accessible via standard web browsers, fully installable (Progressive Web App - PWA), and optimized with modern dark/light styling, masonry image galleries, and interactive local state controllers.
2. **Native Android Companion App (Jetpack Compose, Kotlin, WebView):** Runs a localized, high-speed container of the web system directly inside an Android container, featuring edge-to-edge screens and back-gesture handlers.

---

## 🚀 How to Run Locally

### 1. Web Application (Browser)
Because the website is built entirely on modern static web standards, you can run it without any local compilation:
- **Option A (Double-Click):** Simply open the root `index.html` file in any modern web browser (Chrome, Safari, Firefox, Edge).
- **Option B (Local Web Server - Recommended):** If you wish to test PWA capabilities, offline caching (Service Workers), or Google Drive API integrations, run a simple local HTTP server from the root directory:
  ```bash
  # Using Python 3
  python3 -m http.server 8000
  
  # Using Node.js (npx)
  npx serve .
  ```
  Then, navigate your web browser to `http://localhost:8000`.

### 2. Android App (Emulator / Device)
Since the project uses an incremental compilation pipeline, you can compile and launch the companion Android app onto your streaming emulator or a physical device:
- Gradle automatically copies all root web assets (`index.html`, `css/`, `js/`, etc.) into the Android package assets folder upon compile.
- In Android Studio, open the root folder, wait for Gradle synchronization, and click **Run**.

---

## ☁️ How to Deploy Online

This project is structured for immediate, seamless hosting on modern CDNs with zero configuration required.

### 1. Deploying to GitHub Pages (100% Free)
1. Initialize a Git repository in the root folder and push it to a new public GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of Bsabity Furniture Workshop"
   git branch -M main
   git remote add origin https://github.com/your-username/bsabity-furniture.git
   git push -u origin main
   ```
2. On GitHub, navigate to your repository's **Settings** tab.
3. Click on the **Pages** menu item in the sidebar.
4. Under **Build and deployment**, set the source to **Deploy from a branch**.
5. Select the **main** branch and `/ (root)` folder, then click **Save**.
6. Your website will be live at `https://your-username.github.io/bsabity-furniture/` in less than 2 minutes!

### 2. Deploying to Netlify
1. Log in to your [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** -> **Import from an existing project** (or use the Drag-and-Drop option with your exported ZIP file).
3. If connected to GitHub, select your repository.
4. Set the following build settings:
   - **Build Command:** *(Leave blank)*
   - **Publish Directory:** `.` (or root directory)
5. Click **Deploy Site**. Netlify will provide you with a secure custom SSL URL (e.g., `https://bsabity-furniture.netlify.app`).

### 3. Deploying to Vercel
1. Install Vercel CLI (`npm i -g vercel`) or go to [Vercel Dashboard](https://vercel.com).
2. Click **Add New** -> **Project**, select your pushed GitHub repository, and click **Deploy**.

---

## 🔗 How to Connect the Google Drive API

The project comes pre-configured with a modular adapter in `js/google-drive.js`. When connected, all portfolio showcase photos are loaded, uploaded, or deleted directly from your Google Drive folder.

### Step-by-Step API Setup:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new Project called **"Bsabity Gallery"**.
3. Enable the **Google Drive API** in your project under "APIs & Services".
4. Go to the **Credentials** tab:
   - Create an **OAuth 2.0 Client ID** (for front-end user authorization during uploads) or an **API Key** (for fast, read-only public downloads).
5. Share a Google Drive folder publicly:
   - Create a folder in Google Drive.
   - Right-click, select **Share**, and set permissions to **"Anyone with the link can view"** (this is critical so that your customers can view the images).
   - Copy the folder's ID from the browser URL (the long string of letters and numbers after `/folders/`).
6. Open `/js/google-drive.js` and insert your credentials into the config object:
   ```javascript
   const GOOGLE_DRIVE_CONFIG = {
       clientId: 'YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER', // e.g. "1234567890-abc.apps.googleusercontent.com"
       apiKey: 'YOUR_GOOGLE_API_KEY_PLACEHOLDER',     // Your Browser API Key
       folderId: 'YOUR_SHARED_FOLDER_ID_PLACEHOLDER', // Your shared Google Drive Folder ID
       scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
       discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
   };
   ```
7. That's it! The gallery on `gallery.html` and the uploader in `admin.html` will now automatically feed directly from your Google Drive cloud!

---

## ⚙️ How to Change Business Information

To adjust core business metadata, simply edit the localized tags inside the code files:
* **Contact Phone:** Search and replace `+250 783 847 520` inside `index.html`, `about.html`, `services.html`, `gallery.html`, `products.html`, and `contact.html`.
* **Contact Email:** Search and replace `Bsabity@gmail.com` in all HTML files.
* **Localization Dictionary:** If you want to update Kinyarwanda translations or add new languages, open `/js/app.js` and modify the values inside the `TRANSLATIONS` dictionary object. Any element with a `data-i18n` attribute will be translated instantly in real-time.

---

## 🛠️ How to Add, Edit, or Delete Products & Prices

To prevent the need for a complex database, Bsabity Furniture uses an elegant **Client-Side Admin Panel** with automatic browser backup:

1. Open `admin.html` in your browser.
2. Enter the default master password: **`admin123`**.
3. **Adding Products:** Fill out the "Add New Product" form (Name, Category, Description, Base Price, and Availability Status) and upload a preview image. Clicking **Save** will write it to the browser's persistent LocalStorage database instantly.
4. **Editing Products:** Click the blue edit pencil icon next to any product in the inventory list. The details will populate the edit form. Make your modifications (such as updating price or changing availability) and click **Save**.
5. **Deleting Products:** Click the red trash icon next to any product inside the dashboard list to instantly remove it from the public directory.
6. **Live Synchronization:** All changes made in the Admin Panel update the standard catalogs, cards, and pricing guide tables across the website in real-time!
