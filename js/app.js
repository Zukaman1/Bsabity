/**
 * ==========================================================================
 * Bsabity Furniture Workshop - Main Application Logic
 * ==========================================================================
 */

// Kinyarwanda & English Translation Dictionary
const TRANSLATIONS = {
    en: {
        "nav-home": "Home",
        "nav-about": "About Us",
        "nav-services": "Services",
        "nav-gallery": "Gallery",
        "nav-products": "Products",
        "nav-contact": "Contact Us",
        "nav-admin": "Admin Panel",
        "hero-sub": "Master Artisans of Rwanda",
        "hero-title": "Premium Metal & Wooden Masterpieces",
        "hero-desc": "Transforming spaces with custom-crafted, high-durability interior and outdoor furniture. Manufactured in Kigali, built to last a lifetime.",
        "btn-explore": "Explore Products",
        "btn-quote": "Request Custom Quote",
        "about-sub": "Our Story",
        "about-title": "Crafting Elegance Since 2012",
        "about-para1": "At Bsabity Furniture Workshop, we blend traditional craftsmanship with modern design aesthetics. From custom dining sets to resilient metal bed frames, our mission is to manufacture premium furniture tailored specifically to your lifestyle and architectural goals.",
        "about-para2": "Based in Rwanda, our dedicated team of carpenters, welders, and interior designers utilize the highest-grade wood, state-of-the-art metal finishing, and sustainable resources to deliver outstanding quality.",
        "mission-title": "Our Mission",
        "mission-desc": "To design and manufacture durable, exquisite furniture that enriches Rwandese homes and corporate spaces with lasting comfort.",
        "vision-title": "Our Vision",
        "vision-desc": "To be the leading indigenous furniture maker in East Africa, recognized for unmatched engineering, design, and integrity.",
        "why-sub": "Why Bsabity?",
        "why-title": "Built Different, Crafted Better",
        "why-quality-title": "Rwanda Quality Standards",
        "why-quality-desc": "Engineered from verified premium timbers (Mahogany, Teak, Eucalyptus) and heavy-duty structural steel.",
        "why-custom-title": "100% Tailored Designs",
        "why-custom-desc": "Bring your sketches, dimensions, or Pinterest designs. We manufacture exactly to your custom specifications.",
        "why-price-title": "Factory-Direct Pricing",
        "why-price-desc": "No middlemen. You buy directly from our workshop, obtaining premium products at optimal rates.",
        "why-delivery-title": "Local Delivery & Setup",
        "why-delivery-desc": "We deliver, assemble, and position your furniture securely anywhere across Kigali and Rwandan provinces.",
        "services-sub": "Our Services",
        "services-title": "Comprehensive Manufacture & Fabrication",
        "gallery-sub": "Aesthetic Display",
        "gallery-title": "Selected Pieces from Our Workshop",
        "products-sub": "Catalog",
        "products-title": "Featured Collections",
        "contact-sub": "Get in Touch",
        "contact-title": "Start Your Furniture Project Today",
        "contact-phone-sub": "Call Workshop",
        "contact-email-sub": "Send Email",
        "contact-whatsapp-sub": "Chat on WhatsApp",
        "contact-form-title": "Send a Message",
        "form-name": "Your Name",
        "form-email": "Your Email Address",
        "form-phone": "Phone Number",
        "form-msg": "Tell Us About Your Project (Dimensions, Materials...)",
        "btn-send": "Submit Inquiry"
    },
    rw: {
        "nav-home": "Ahabanza",
        "nav-about": "Abo Turi Bo",
        "nav-services": "Serivisi",
        "nav-gallery": "Inzu y'Amafoto",
        "nav-products": "Ibikoresho",
        "nav-contact": "Twandikire",
        "nav-admin": "Ubuyobozi",
        "hero-sub": "Abahanga mu Gukora Ibikoresho mu Rwanda",
        "hero-title": "Ibikoresho Byiza cyane by'Imbaho n'Ibyuma",
        "hero-desc": "Guhindura imyanya yawe dukoresheje ibikoresho by'imbaho n'ibyuma byakorewe mu gihugu kandi biramba.",
        "btn-explore": "Reba Ibikoresho",
        "btn-quote": "Saba Igiciro",
        "about-sub": "Amateka Yacu",
        "about-title": "Gukora Ibyiza kuva mu 2012",
        "about-para1": "Kuri Bsabity Furniture Workshop, duhuza ubumenyi gakondo bwo kubaza n'imyubakire igezweho. Kuva ku meza yo kuriraho kugeza ku buriri bw'ibyuma bukomeye, intego yacu ni ukubakorera ibikoresho byiza bihuje neza n'ubuzima bwanyu.",
        "about-para2": "I Kigali mu Rwanda, itsinda ryacu ry'abanyamashanyarazi, abasudizi, n'abashushanyi bakoresha imbaho z'akanyabugabo, ibyuma bikomeye n'ibikoresho bidahumanya ibidukikije.",
        "mission-title": "Intego Yacu",
        "mission-desc": "Gukora ibikoresho biramba kandi byiza bitera ishema ingo n'ibiro by'Abanyarwanda.",
        "vision-title": "Icyerekezo Cyacu",
        "vision-desc": "Kuba uruganda rwa mbere rwa kinyarwanda mu gukora ibikoresho byiza muri Afurika y'Iburasirazuba.",
        "why-sub": "Kuki Twe?",
        "why-title": "Ubwiza Budasanzwe, Imikorere Inoze",
        "why-quality-title": "Ibipimo by'Ubuziranenge",
        "why-quality-desc": "Bikoze mu mbaho zizewe kandi zatoranyijwe neza (Mahogany, Teak, Eucalyptus) n'ibyuma bikomeye.",
        "why-custom-title": "Uko Ubyifuza 100%",
        "why-custom-desc": "Zana igishushanyo cyawe cyangwa ibipimo, tugukorere neza nk'uko ubyifuza.",
        "why-price-title": "Ibiciro Biturutse ku Ruganda",
        "why-price-desc": "Nta bantu bapakira hagati. Ugura neza ku ruganda rwacu ku giciro cyiza.",
        "why-delivery-title": "Kugeza n'Umutekano",
        "why-delivery-desc": "Tugeza ibikoresho i Kigali n'ahandi mu ntara zose z'u Rwanda tukabiteranya mu mutekano.",
        "services-sub": "Serivisi Zacu",
        "services-title": "Gukora Ibikoresho no Gusudira Bitandukanye",
        "gallery-sub": "Ibyerekanwa",
        "gallery-title": "Ibyatoranyijwe mu Ruganda Rwacu",
        "products-sub": "Ibyo Dukora",
        "products-title": "Ibyiciro Bitandukanye",
        "contact-sub": "Twandikire",
        "contact-title": "Tangira Umushinga Wawe Natwe Uyu Munsi",
        "contact-phone-sub": "Hamagara Uruganda",
        "contact-email-sub": "Ohereza Imejili",
        "contact-whatsapp-sub": "Tuvugishe kuri WhatsApp",
        "contact-form-title": "Ohereza Ubutumwa",
        "form-name": "Izina Ryawe",
        "form-email": "Imejili Yawe",
        "form-phone": "Inomero ya Telefone",
        "form-msg": "Sobanura Umushinga Wawe (Ibipimo, Imbaho...)",
        "btn-send": "Ohereza Inyandiko"
    }
};

// Comprehensive Furniture Catalog Categories
const FURNITURE_CATEGORIES = [
    { id: "metal-beds", name: "Metal Beds" },
    { id: "wooden-beds", name: "Wooden Beds" },
    { id: "bunk-beds", name: "Bunk Beds" },
    { id: "single-beds", name: "Single Beds" },
    { id: "double-beds", name: "Double Beds" },
    { id: "king-beds", name: "King Size Beds" },
    { id: "dining-tables", name: "Dining Tables" },
    { id: "coffee-tables", name: "Coffee Tables" },
    { id: "office-tables", name: "Office Tables" },
    { id: "study-tables", name: "Study Tables" },
    { id: "tv-stands", name: "TV Stands" },
    { id: "wardrobes", name: "Wardrobes" },
    { id: "kitchen-cabinets", name: "Kitchen Cabinets" },
    { id: "bathroom-cabinets", name: "Bathroom Cabinets" },
    { id: "bookshelves", name: "Bookshelves" },
    { id: "wall-shelves", name: "Wall Shelves" },
    { id: "office-furniture", name: "Office Furniture" },
    { id: "reception-desks", name: "Reception Desks" },
    { id: "conference-tables", name: "Conference Tables" },
    { id: "office-chairs", name: "Office Chairs" },
    { id: "dining-chairs", name: "Dining Chairs" },
    { id: "sofas", name: "Sofas" },
    { id: "sofa-sets", name: "Sofa Sets" },
    { id: "outdoor-furniture", name: "Outdoor Furniture" },
    { id: "metal-doors", name: "Metal Doors" },
    { id: "wooden-doors", name: "Wooden Doors" },
    { id: "windows", name: "Windows" },
    { id: "gates", name: "Gates" },
    { id: "railings", name: "Railings" },
    { id: "kitchen-room", name: "Kitchen Room" },
    { id: "bedroom-furniture", name: "Bedroom Furniture" },
    { id: "living-furniture", name: "Living Room Furniture" },
    { id: "restaurant-furniture", name: "Restaurant Furniture" },
    { id: "hotel-furniture", name: "Hotel Furniture" },
    { id: "school-furniture", name: "School Furniture" },
    { id: "hospital-furniture", name: "Hospital Furniture" },
    { id: "custom-furniture", name: "Custom Furniture" },
    { id: "metal-fabrication", name: "Metal Fabrication" },
    { id: "wood-fabrication", name: "Wood Fabrication" },
    { id: "interior-decoration", name: "Interior Decoration" },
    { id: "home-accessories", name: "Home Accessories" },
    { id: "other", name: "Other" }
];
window.FURNITURE_CATEGORIES = FURNITURE_CATEGORIES;

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initScrollEffects();
    initTranslation();
    dismissLoader();
});

/**
 * Theme Toggle & Light/Dark Mode Handlers
 */
function initTheme() {
    const themeBtn = document.getElementById('theme-toggle');
    // Default to 'dark' for the Sophisticated Dark experience
    const activeTheme = localStorage.getItem('bsabity_theme') || 'dark';
    
    document.documentElement.setAttribute('data-theme', activeTheme);
    updateThemeIcon(themeBtn, activeTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('bsabity_theme', newTheme);
            updateThemeIcon(themeBtn, newTheme);
        });
    }
}

function updateThemeIcon(btn, theme) {
    if (!btn) return;
    const icon = btn.querySelector('i');
    if (icon) {
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
}

/**
 * Mobile Navigation Drawer Toggle
 */
function initMobileMenu() {
    const toggleBtn = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (toggleBtn && navLinks) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.className = navLinks.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
            }
        });

        // Close when clicking outside or clicking any nav item
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                const icon = toggleBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = toggleBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            });
        });
    }
}

/**
 * Scroll effects: Sticky header and Scroll-to-Top Button
 */
function initScrollEffects() {
    const header = document.querySelector('header');
    const scrollTopBtn = document.getElementById('scroll-top');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '0.5rem 0';
            header.style.boxShadow = 'var(--shadow-md)';
        } else {
            header.style.padding = '';
            header.style.boxShadow = '';
        }

        if (window.scrollY > 400) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Multi-Language Engine (English / Kinyarwanda)
 */
function initTranslation() {
    const langBtn = document.getElementById('lang-toggle');
    const currentLang = localStorage.getItem('bsabity_lang') || 'en';
    
    setLanguage(currentLang);

    if (langBtn) {
        langBtn.addEventListener('click', () => {
            const nextLang = localStorage.getItem('bsabity_lang') === 'en' ? 'rw' : 'en';
            setLanguage(nextLang);
        });
    }
}

function setLanguage(lang) {
    localStorage.setItem('bsabity_lang', lang);
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = TRANSLATIONS[lang][key];
            } else {
                el.textContent = TRANSLATIONS[lang][key];
            }
        }
    });

    // Update language button text
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.innerHTML = lang === 'en' 
            ? '<i class="fas fa-globe"></i> EN <span>/ RW</span>' 
            : '<i class="fas fa-globe"></i> RW <span>/ EN</span>';
    }
}

/**
 * Loading Dismiss Action
 */
function dismissLoader() {
    const loader = document.getElementById('loader-wrapper');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
        }, 300);
    }
}

/**
 * Custom Alert Notification Banner
 */
function showAlertBanner(message, type = 'success') {
    let banner = document.getElementById('alert-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'alert-banner';
        banner.className = 'alert-banner';
        document.body.appendChild(banner);
    }
    banner.textContent = message;
    banner.className = `alert-banner show ${type}`;
    setTimeout(() => {
        banner.classList.remove('show');
    }, 4000);
}
