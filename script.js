// ==========================================
// 1. CONFIGURATION (Render Backend URL)
// ==========================================
const API_URL = "https://stylishboothouse-backend.onrender.com";

// ==========================================
// 2. INITIALIZE ON PAGE LOAD
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    loadHomeProducts(); // Home page ke products load karega
    updateCartUI();     // Cart ki halat check karega
    setupEventListeners(); // Saare clicks aur buttons handle karega
});

// ==========================================
// 3. ALL EVENT LISTENERS (Menu, Search, Categories)
// ==========================================
function setupEventListeners() {
    // Mobile Menu Toggle
    const menu = document.querySelector('#mobile-menu');
    const navLinksContainer = document.querySelector('.nav-links');
    if (menu && navLinksContainer) {
        menu.onclick = () => {
            navLinksContainer.classList.toggle('active');
            menu.classList.toggle('is-active');
        };
    }

    // Category Section Toggle (Shop by Category fix)
    const categoryCards = document.querySelectorAll('.category-card[data-toggle]');
    categoryCards.forEach(card => {
        card.onclick = function () {
            const subGrid = this.nextElementSibling;
            if (subGrid && subGrid.classList.contains('sub-category-grid')) {
                // Pehle baaki sab band karo (Safayi)
                document.querySelectorAll('.sub-category-grid').forEach(grid => {
                    if (grid !== subGrid) grid.style.display = 'none';
                });
                // Toggle current grid
                const isHidden = window.getComputedStyle(subGrid).display === 'none';
                subGrid.style.display = isHidden ? 'grid' : 'none';
            }
        };
    });

    // Search Logic
    const searchBtn = document.querySelector(".search-btn");
    const searchInput = document.querySelector(".search-input");
    const searchWrap = document.querySelector(".search-wrap");
    if (searchBtn && searchInput) {
        searchBtn.onclick = () => {
            if (searchWrap.classList.contains("active") && searchInput.value.trim() !== "") {
                window.location.href = `search.html?q=${encodeURIComponent(searchInput.value.trim())}`;
            } else {
                searchWrap.classList.toggle("active");
                if (searchWrap.classList.contains("active")) searchInput.focus();
            }
        };
        searchInput.onkeydown = (e) => {
            if (e.key === "Enter") window.location.href = `search.html?q=${encodeURIComponent(searchInput.value.trim())}`;
        };
    }

    // Cart Panel Controls
    const cartBtn = document.getElementById("cartBtn");
    const cartPanel = document.getElementById("cartPanel");
    const closeCart = document.getElementById("closeCart");
    const cartOverlay = document.getElementById("cartOverlay");

    if (cartBtn) cartBtn.onclick = () => { cartPanel.classList.add("active"); cartOverlay.classList.add("active"); };
    if (closeCart) closeCart.onclick = () => { cartPanel.classList.remove("active"); cartOverlay.classList.remove("active"); };
    if (cartOverlay) cartOverlay.onclick = () => { cartPanel.classList.remove("active"); cartOverlay.classList.remove("active"); };
}

// ==========================================
// 4. PRODUCT CARD TEMPLATE (Professional Look)
// ==========================================
function createProductCard(p) {
    const imgSrc = p.image.startsWith('http') ? p.image : `images/${p.image}`;
    return `
        <div class="product-card" onclick="window.location.href='detailed-products.html?id=${p._id}'" 
             style="cursor:pointer; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08); transition:0.3s; position:relative;">
            <div style="width:100%; height:220px; background:#f5f5f5; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                <img src="${imgSrc}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/250x250?text=Shoes'" 
                     style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div style="padding:15px; text-align:center;">
                <h3 style="font-size:1rem; margin:0 0 8px 0; color:#222; font-weight:600;">${p.title}</h3>
                <p style="color:#b02a37; font-weight:700; font-size:1.1rem; margin:0 0 12px 0;">Rs. ${p.price}</p>
                <button class="view-btn" style="width:100%; padding:10px; border-radius:6px; border:none; background:#222; color:white; font-size:0.9rem; font-weight:bold; cursor:pointer;">
                    View Details
                </button>
            </div>
        </div>
    `;
}

// ==========================================
// 5. FETCH & LOAD PRODUCTS
// ==========================================
async function loadHomeProducts() {
    try {
        const res = await fetch(`${API_URL}/api/get-all-products`);
        const products = await res.json();
        if (!products || products.length === 0) return;

        // Ladies Section (Heels, Sandals, Slippers, Super Softs)
        const ladiesContainer = document.getElementById('ladies-featured');
        if (ladiesContainer) {
            const ladiesList = products.filter(p =>
                ['heels', 'sandals', 'slippers', 'super-softs', 'ladies'].includes(p.category.toLowerCase())
            ).reverse().slice(0, 6);
            ladiesContainer.innerHTML = ladiesList.map(p => createProductCard(p)).join('');
        }

        // Kids Section
        const kidsContainer = document.getElementById('kids-featured');
        if (kidsContainer) {
            const kidsList = products.filter(p => p.category.toLowerCase() === 'kids').reverse().slice(0, 6);
            kidsContainer.innerHTML = kidsList.map(p => createProductCard(p)).join('');
        }
    } catch (err) {
        console.error("Home Load Error:", err);
    }
}

// ==========================================
// 6. CART SYSTEM (LocalStorage)
// ==========================================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

window.addToCart = function (name, price, image) {
    const product = { name, price: parseInt(price), image, qty: 1 };
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push(product);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
    alert(name + " cart mein add ho gaya!");
};

window.removeFromCart = function (index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
};

function updateCartUI() {
    const cartContent = document.querySelector(".cart-content");
    const cartTotal = document.getElementById("cartTotal");
    if (!cartContent || !cartTotal) return;

    let total = 0;
    cartContent.innerHTML = cart.length === 0 ? "<p style='text-align:center; padding:20px;'>No items yet</p>" : "";

    cart.forEach((item, index) => {
        total += item.price * item.qty;
        cartContent.innerHTML += `
            <div class="cart-item" style="display:flex; align-items:center; gap:12px; padding:12px; border-bottom:1px solid #eee;">
                <img src="${item.image}" width="55" height="55" style="border-radius:6px; object-fit:cover;">
                <div style="flex:1;">
                    <h4 style="font-size:0.9rem; margin:0; color:#333;">${item.name}</h4>
                    <p style="margin:2px 0; font-size:0.85rem; color:#666;">Rs ${item.price} x ${item.qty}</p>
                </div>
                <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#b02a37; font-size:1.2rem; cursor:pointer;">&times;</button>
            </div>
        `;
    });
    cartTotal.innerText = "Rs " + total;
}
