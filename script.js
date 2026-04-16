// ==========================
// 1. CONFIGURATION & URLS
// ==========================
const API_URL = "https://stylishboothouse-backend.onrender.com";

// ==========================
// 2. MOBILE MENU & UI
// ==========================
const menu = document.querySelector('#mobile-menu');
const navLinksContainer = document.querySelector('.nav-links');

if (menu && navLinksContainer) {
    menu.addEventListener('click', () => {
        navLinksContainer.classList.toggle('active');
        menu.classList.toggle('is-active');
    });
}

// Location Dropdown
document.addEventListener("DOMContentLoaded", () => {
    const locationDropdown = document.querySelector(".location-dropdown > .nav-item");
    const dropdownMap = document.querySelector(".location-dropdown .dropdown-map");

    if (locationDropdown && dropdownMap) {
        locationDropdown.addEventListener("click", (e) => {
            e.preventDefault();
            dropdownMap.style.display = dropdownMap.style.display === "block" ? "none" : "block";
        });
    }
});

// ==========================
// 3. PRODUCT RENDERING (HTML Template)
// ==========================
function createProductCard(p) {
    // Agar image URL hai to theek, warna placeholder
    const imgSrc = p.image.startsWith('http') ? p.image : `/images/${p.image}`;

    return `
        <div class="product-card" onclick="window.location.href='detailed-products.html?id=${p._id}'">
            <img src="${imgSrc}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
            <h3>${p.title}</h3>
            <p class="price">Rs. ${p.price}</p>
            <button class="view-btn">View Details</button>
            <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${p.title}', ${p.price}, '${imgSrc}')" 
                style="margin-top:10px; background:#b02a37; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">
                Add to Cart
            </button>
        </div>
    `;
}

// ==========================
// 4. LOAD PRODUCTS FROM DATABASE
// ==========================
async function loadHomeProducts() {
    try {
        console.log("Fetching products from Live Server...");
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
        console.error("Error loading products:", err);
    }
}

// ==========================
// 5. SEARCH LOGIC
// ==========================
const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-btn");
const searchWrap = document.querySelector(".search-wrap");

if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (searchWrap.classList.contains("active") && query !== "") {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        } else {
            searchWrap.classList.toggle("active");
            searchInput.focus();
        }
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            window.location.href = `search.html?q=${encodeURIComponent(searchInput.value.trim())}`;
        }
    });
}

// ==========================
// 6. CART SYSTEM (LocalStorage)
// ==========================
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
    alert(`${name} cart mein add ho gaya!`);
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
    cartContent.innerHTML = cart.length === 0 ? "<p>No items yet</p>" : "";

    cart.forEach((item, index) => {
        total += item.price * item.qty;
        cartContent.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" width="50">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Rs ${item.price} × ${item.qty}</p>
                </div>
                <button onclick="removeFromCart(${index})">✖</button>
            </div>
        `;
    });
    cartTotal.innerText = "Rs " + total;
}

// Cart Panel Controls
const cartBtn = document.getElementById("cartBtn");
const cartPanel = document.getElementById("cartPanel");
const closeCart = document.getElementById("closeCart");
const cartOverlay = document.getElementById("cartOverlay");

if (cartBtn) cartBtn.onclick = () => { cartPanel.classList.add("active"); cartOverlay.classList.add("active"); };
if (closeCart) closeCart.onclick = () => { cartPanel.classList.remove("active"); cartOverlay.classList.remove("active"); };
if (cartOverlay) cartOverlay.onclick = () => { cartPanel.classList.remove("active"); cartOverlay.classList.remove("active"); };

// ==========================
// 7. INITIALIZE ON LOAD
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    loadHomeProducts();
    updateCartUI();
});
