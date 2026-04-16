// ==========================
// 1. MOBILE MENU & NAVIGATION
// ==========================
const menu = document.querySelector('#mobile-menu');
const navLinksContainer = document.querySelector('.nav-links');

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
    
    // --- FIX: Categories Toggle Logic ---
    const categoryCards = document.querySelectorAll('.category-card[data-toggle]');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const subGrid = this.nextElementSibling;
            if (subGrid && subGrid.classList.contains('sub-category-grid')) {
                // Toggle display between none and grid
                const isHidden = window.getComputedStyle(subGrid).display === 'none';
                subGrid.style.display = isHidden ? 'grid' : 'none';
                // Add active class for CSS animations if you have them
                subGrid.classList.toggle('active');
            }
        });
    });
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

window.addToCart = function (name, price, image, color = "Standard", size = "N/A", qty = 1) {
    const product = {
        id: name.replace(/\s+/g, '-').toLowerCase(),
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

// ==========================
// 4. ORDER & API CALLS (Fixed for Live Site)
// ==========================

const API_URL = "https://stylishboothouse-backend.onrender.com";

async function placeOrder(orderData) {
    try {
        const response = await fetch(`${API_URL}/order`, {
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
        alert("Server se connect nahi ho pa raha!");
    }
}

async function loadHomeFeatured() {
    try {
        const res = await fetch(`${API_URL}/api/get-all-products`);
        const allProducts = await res.json();

        allProducts.reverse();

        const ladiesProducts = allProducts.filter(p => {
            const cat = p.category.toLowerCase();
            return cat === 'heels' || cat === 'sandals' || cat === 'slippers' || cat === 'super-softs' || cat === 'ladies';
        }).slice(0, 6);

        const kidsProducts = allProducts.filter(p => p.category.toLowerCase() === 'kids').slice(0, 6);

        const ladiesContainer = document.getElementById('ladies-featured');
        const kidsContainer = document.getElementById('kids-featured');

        // --- FIX: Card Layout and Image Styling ---
        const createCard = (product) => `
            <div class="featured-card" 
                 onclick="window.location.href='product-detail.html?id=${product._id}'"
                 style="background: #fff; border-radius: 15px; padding: 12px; margin: 10px; display: inline-block; width: 220px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); vertical-align: top; cursor:pointer;">
                <div style="width: 100%; height: 180px; overflow: hidden; border-radius: 10px; background: #f8f8f8; margin-bottom: 10px;">
                    <img src="${product.image}" onerror="this.src='https://via.placeholder.com/200x180?text=Shoes'" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <h3 style="font-size: 0.95rem; margin: 8px 0; color: #333; height: 40px; overflow: hidden; font-weight: 600;">${product.title}</h3>
                <div style="margin-bottom: 12px;">
                    <span style="color: #b02a37; font-weight: bold; font-size: 1rem;">Rs. ${product.price}</span>
                </div>
                <button onclick="event.stopPropagation(); addToCart('${product.title}', ${product.price}, '${product.image}')" 
                        style="width: 100%; padding: 10px; background: #222; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem;">
                    Add to Cart
                </button>
            </div>
        `;

        if (ladiesContainer) ladiesContainer.innerHTML = ladiesProducts.map(p => createCard(p)).join('');
        if (kidsContainer) kidsContainer.innerHTML = kidsProducts.map(p => createCard(p)).join('');

    } catch (err) {
        console.error("Data load error:", err);
    }
}

document.addEventListener('DOMContentLoaded', loadHomeFeatured);
updateCartUI(); // Initial UI update
