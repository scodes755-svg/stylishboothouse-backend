// ==========================
// 1. MOBILE MENU & NAVIGATION
// ==========================
const menu = document.querySelector('#mobile-menu');
const navLinksContainer = document.querySelector('.nav-links'); // Variable name fixed

if (menu && navLinksContainer) {
    menu.addEventListener('click', () => {
        navLinksContainer.classList.toggle('active');
        menu.classList.toggle('is-active');
    });

    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            navLinksContainer.classList.remove("active");
            menu.classList.remove("is-active");
        });
    });
}

// Location Dropdown Logic
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
// 2. SEARCH FUNCTIONALITY
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.querySelector(".search-input");
    const searchBtn = document.querySelector(".search-btn");
    const searchWrap = document.querySelector(".search-wrap");

    function goToSearchPage() {
        const query = searchInput.value.trim();
        if (query !== "") {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (searchWrap.classList.contains("active") && searchInput.value !== "") {
                goToSearchPage();
            } else {
                searchWrap.classList.toggle("active");
                if (searchWrap.classList.contains("active")) {
                    setTimeout(() => searchInput.focus(), 300);
                }
            }
        });

        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                goToSearchPage();
            }
        });
    }

    // Close search on outside click or ESC
    document.addEventListener("click", (e) => {
        if (searchWrap && !searchWrap.contains(e.target)) {
            searchWrap.classList.remove("active");
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && searchWrap) {
            searchWrap.classList.remove("active");
        }
    });
});

// ==========================
// 3. CART SYSTEM (LocalStorage)
// ==========================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartBtn = document.getElementById("cartBtn");
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartContent = document.querySelector(".cart-content");
const cartTotal = document.getElementById("cartTotal");

function openCart() {
    if (cartPanel && cartOverlay) {
        cartPanel.classList.add("active");
        cartOverlay.classList.add("active");
    }
}

function closeCartPanel() {
    if (cartPanel && cartOverlay) {
        cartPanel.classList.remove("active");
        cartOverlay.classList.remove("active");
    }
}

if (cartBtn) cartBtn.onclick = openCart;
if (closeCart) closeCart.onclick = closeCartPanel;
if (cartOverlay) cartOverlay.onclick = closeCartPanel;

// Global Add to Cart
window.addToCart = function (name, price, image, color = "Standard", size = "N/A", qty = 1) {
    const product = {
        id: name.replace(/\s+/g, '-').toLowerCase(), // Unique ID generation
        name,
        price: parseInt(price),
        image,
        color,
        size,
        qty: parseInt(qty)
    };

    const existing = cart.find(item => item.name === product.name);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push(product);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
    openCart();
};

window.removeFromCart = function (index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
};

function updateCartUI() {
    if (!cartContent || !cartTotal) return;

    cartContent.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartContent.innerHTML = "<p style='text-align:center; padding:20px;'>No items yet</p>";
        cartTotal.innerText = "Rs 0";
        return;
    }

    cart.forEach((item, index) => {
        total += item.price * item.qty;
        cartContent.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" onerror="this.src='https://via.placeholder.com/50'">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Size: ${item.size || "—"} | Color: ${item.color || "—"}</p>
                    <p>Rs ${item.price} × ${item.qty}</p>
                </div>
                <button class="remove-item" onclick="removeFromCart(${index})">✖</button>
            </div>
        `;
    });
    cartTotal.innerText = "Rs " + total;
}

// Initial UI load
updateCartUI();

// ==========================
// 4. ORDER & API CALLS (Fixed for Live Site)
// ==========================

// Place Order Function
async function placeOrder(orderData) {
    try {
        console.log("Sending order to server...");
        // FIXED: Localhost removed for Live Support
        // Galti: const response = await fetch("/order", ...
        // Sahi (Isko try karein):
        const response = await fetch("https://stylishboothouse.store/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (result.success) {
            alert("Mubarak ho! Order place ho gaya hai.");
            cart = [];
            localStorage.setItem("cart", JSON.stringify(cart));
            window.location.href = "success.html";
        } else {
            alert("Masla aaya: " + result.message);
        }
    } catch (error) {
        console.error("Error sending order:", error);
        alert("Server se connect nahi ho pa raha! Make sure backend is live.");
    }
}

// Load Home Featured Products
async function loadHomeFeatured() {
    try {
        console.log("Fetching products for home...");
        // FIXED: Localhost removed for Live Support
        // loadHomeFeatured mein bhi ye line update kar dein:
        const res = await fetch('https://stylishboothouse.store/api/get-all-products');
        const allProducts = await res.json();

        allProducts.reverse();

        // Filters
        const ladiesProducts = allProducts.filter(p => {
            const cat = p.category.toLowerCase();
            return cat === 'heels' || cat === 'sandals' || cat === 'slippers' || cat === 'super-softs' || cat === 'ladies';
        }).slice(0, 6);

        const kidsProducts = allProducts.filter(p => p.category.toLowerCase() === 'kids').slice(0, 6);

        const ladiesContainer = document.getElementById('ladies-featured');
        const kidsContainer = document.getElementById('kids-featured');

        const createCard = (product) => `
            <div class="featured-card" 
                 onclick="window.location.href='product-detail.html?id=${product._id}'"
                 style="background: #ffffff; border-radius: 20px; padding: 15px; margin: 10px; display: inline-block; width: 100%; max-width: 250px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: 0.3s; cursor:pointer;">
                <div style="position: relative; height: 180px; overflow: hidden; border-radius: 15px; background: #f0f0f0; margin-bottom: 10px;">
                    <img src="${product.image}" onerror="this.src='https://via.placeholder.com/200x180?text=No+Image'" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <h3 style="font-size: 1.1rem; margin: 10px 0; color: #333; font-weight: 600;">${product.title}</h3>
                <div style="margin-bottom: 15px;">
                    <span style="color: #888; text-decoration: line-through; font-size: 0.85rem;">Rs. ${Math.round(product.price * 1.2)}</span>
                    <span style="color: #b02a37; font-weight: bold; margin-left: 10px; font-size: 1rem;">Rs. ${product.price}</span>
                </div>
                <button onclick="event.stopPropagation(); addToCart('${product.title}', ${product.price}, '${product.image}')" 
                        style="width: 100%; padding: 12px; background: #b02a37; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold;">
                    Add to Cart
                </button>
            </div>
        `;

        if (ladiesContainer) {
            ladiesContainer.innerHTML = ladiesProducts.length > 0 ? ladiesProducts.map(p => createCard(p)).join('') : "<p class='text-white'>No Ladies Shoes Found</p>";
        }
        if (kidsContainer) {
            kidsContainer.innerHTML = kidsProducts.length > 0 ? kidsProducts.map(p => createCard(p)).join('') : "<p class='text-white'>No Kids Shoes Found</p>";
        }
    } catch (err) {
        console.error("Data load nahi ho raha:", err);
    }
}

// ==========================
// 5. UI EFFECTS (Slides, Info bar)
// ==========================
const messages = ["🚚 Free Delivery All Over Pakistan", "⚡ Cash on Delivery Available Nationwide"];
let msgIndex = 0;
const infoText = document.getElementById("infoText");

if (infoText) {
    setInterval(() => {
        infoText.style.opacity = "0";
        setTimeout(() => {
            msgIndex = (msgIndex + 1) % messages.length;
            infoText.textContent = messages[msgIndex];
            infoText.style.opacity = "1";
        }, 400);
    }, 3000);
}

// Hero Slider
const slides = document.querySelectorAll('.hero-slide');
let currentSlide = 0;

if (slides.length > 0) {
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        slides[currentSlide].classList.add('prev');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
        slides.forEach((slide, idx) => { if (idx !== currentSlide) slide.classList.remove('prev'); });
    }, 4000);
}

// Category Toggle
document.querySelectorAll('[data-toggle]').forEach(card => {
    card.addEventListener('click', () => {
        const subGrid = card.nextElementSibling;
        if (subGrid) subGrid.classList.toggle('active');
    });
});

// Run on Load
document.addEventListener('DOMContentLoaded', loadHomeFeatured);
