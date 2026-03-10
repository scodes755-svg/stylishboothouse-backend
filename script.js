const menu = document.querySelector('#mobile-menu');
const navLinks = document.querySelector('#nav-list');

menu.addEventListener('click', () => {
    navlinks.classList.toggle('active');

    // Hamburger icon ko "X" banane ke liye animation (Optional)
    menu.classList.toggle('is-active');
});

document.addEventListener("DOMContentLoaded", function () {

    // --------------------------
    // MOBILE MENU
    // --------------------------
    const mobileMenuBtn = document.getElementById("mobile-menu");
    const navLinks = document.querySelector(".nav-links");

    mobileMenuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        mobileMenuBtn.classList.toggle("is-active"); // hamburger X animation
    });

    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            navLinks.classList.remove("active");
            mobileMenuBtn.classList.remove("is-active");
        });
    });

    // --------------------------
    // CART PANEL
    // --------------------------
    const cartBtn = document.getElementById("cartBtn"); // 🛒 icon
    const cartPanel = document.getElementById("cartPanel");
    const cartOverlay = document.getElementById("cartOverlay");
    const closeCart = document.getElementById("closeCart");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");

    let total = 0;

    // Open cart
    cartBtn.addEventListener("click", () => {
        cartPanel.classList.add("active");
        cartOverlay.classList.add("active");

        // Close mobile menu if open
        navLinks.classList.remove("active");
        mobileMenuBtn.classList.remove("is-active");
    });

    // Close cart
    function closeCartPanel() {
        cartPanel.classList.remove("active");
        cartOverlay.classList.remove("active");
    }

    closeCart.addEventListener("click", closeCartPanel);
    cartOverlay.addEventListener("click", closeCartPanel);

    // Add item to cart function
    window.addToCart = function (name, price, image, color, size, qty = 1) {
        const item = document.createElement("div");
        item.className = "cart-item";

        item.innerHTML = `
            <img src="${image}" alt="${name}">
            <div>
                <h4>${name}</h4>
                <p>Color: ${color} | Size: ${size} | Qty: ${qty}</p>
                <span>Rs ${price * qty}</span>
            </div>
        `;

        cartItems.appendChild(item);
        total += price * qty;
        cartTotal.textContent = `Rs ${total}`;
    }

    // Checkout button
    checkoutBtn.addEventListener("click", () => {
        if (cartItems.children.length === 0) {
            alert("Cart is empty!");
            return;
        }
        window.location.href = "checkout.html";
    });

});

// Mobile toggle for location map
document.addEventListener("DOMContentLoaded", () => {
    const locationDropdown = document.querySelector(".location-dropdown > .nav-item");
    const dropdownMap = document.querySelector(".location-dropdown .dropdown-map");

    locationDropdown.addEventListener("click", (e) => {
        e.preventDefault();
        dropdownMap.style.display = dropdownMap.style.display === "block" ? "none" : "block";
    });
});

document.addEventListener("DOMContentLoaded", function () {

    // -------------------------
    // MOBILE MENU TOGGLE
    // -------------------------
    const mobileMenuBtn = document.getElementById("mobile-menu");
    const navLinks = document.querySelector(".nav-links");

    mobileMenuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");  // show/hide mobile links
        mobileMenuBtn.classList.toggle("is-active"); // hamburger X animation
    });

    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            navLinks.classList.remove("active");
            mobileMenuBtn.classList.remove("is-active");
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {

    // 1️⃣ Elements
    const searchInput = document.querySelector(".search-input");
    const searchBtn = document.querySelector(".search-btn");

    // 2️⃣ Function to redirect to search page
    function goToSearchPage() {
        const query = searchInput.value.trim();
        if (query !== "") {
            // Redirect to search.html with query as URL parameter
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
    }

    // 3️⃣ Search button click
    searchBtn.addEventListener("click", (e) => {
        e.preventDefault();
        goToSearchPage();
    });

    // 4️⃣ Enter key press in input
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            goToSearchPage();
        }
    });

    // 5️⃣ Optional: toggle search input for small screens
    const searchWrap = document.querySelector(".search-wrap");
    searchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        searchWrap.classList.toggle("active");
        if (searchWrap.classList.contains("active")) {
            setTimeout(() => searchInput.focus(), 300);
        }
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
        if (!searchWrap.contains(e.target)) {
            searchWrap.classList.remove("active");
        }
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            searchWrap.classList.remove("active");
        }
    });

});

const messages = [
    "🚚 Free Delivery All Over Pakistan",
    "⚡ Cash on Delivery Available Nationwide"
];

document.addEventListener("DOMContentLoaded", function () {

    // --------------------------
    // MOBILE MENU
    // --------------------------
    const mobileMenuBtn = document.getElementById("mobile-menu"); // 3-line hamburger
    const navLinks = document.querySelector(".nav-links"); // ul nav items

    mobileMenuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active"); // show/hide links
        mobileMenuBtn.classList.toggle("is-active"); // animate hamburger → X
    });

    // Close mobile menu on nav item click
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            navLinks.classList.remove("active");
            mobileMenuBtn.classList.remove("is-active");
        });
    });

});

document.querySelectorAll(".dropdown > a").forEach(item => {
    item.addEventListener("click", e => {
        e.preventDefault();
        item.parentElement.classList.toggle("active");
    });
});

let index = 0;
const infoText = document.getElementById("infoText");

setInterval(() => {
    infoText.style.opacity = "0";
    infoText.style.transform = "translateY(10px)";

    setTimeout(() => {
        index = (index + 1) % messages.length;
        infoText.textContent = messages[index];
        infoText.style.opacity = "1";
        infoText.style.transform = "translateY(0)";
    }, 400);

}, 3000);

// HERO SLIDER SCRIPT
const slides = document.querySelectorAll('.hero-slide');
let current = 0;

setInterval(() => {
    slides[current].classList.remove('active');
    slides[current].classList.add('prev');

    current = (current + 1) % slides.length;

    slides[current].classList.add('active');

    slides.forEach((slide, index) => {
        if (index !== current) {
            slide.classList.remove('prev');
        }
    });

}, 4000);

// CATEGORY TOGGLE SCRIPT
document.querySelectorAll('[data-toggle]').forEach(card => {
    card.addEventListener('click', () => {

        // next element is the sub-category grid
        const subGrid = card.nextElementSibling;

        // toggle only this category
        subGrid.classList.toggle('active');

    });
});

// Why Choose Animations
const boxes = document.querySelectorAll('.why-box');

const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.style.opacity = 1;
            e.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.25 });

boxes.forEach(box => {
    box.style.opacity = 0;
    box.style.transform = 'translateY(25px)';
    obs.observe(box);
});

const cartBtn = document.getElementById("cartBtn"); // navbar cart button
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

let total = 0;

/* OPEN CART */
cartBtn.addEventListener("click", () => {
    cartPanel.classList.add("active");
    cartOverlay.classList.add("active");
});

/* CLOSE CART */
closeCart.addEventListener("click", closeCartPanel);
cartOverlay.addEventListener("click", closeCartPanel);

function closeCartPanel() {
    cartPanel.classList.remove("active");
    cartOverlay.classList.remove("active");
}

/* ADD TO CART FUNCTION */
function addToCart(name, price, image) {
    const item = document.createElement("div");
    item.className = "cart-item";

    item.innerHTML = `
    <img src="${image}">
    <div>
      <h4>${name}</h4>
      <span>Rs ${price}</span>
    </div>
  `;

    cartItems.appendChild(item);
    total += price;
    cartTotal.textContent = `Rs ${total}`;
}

// CART FUNCTIONALITY
let cart = JSON.parse(localStorage.getItem("cart")) || [];

document.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => {

        const product = {
            id: btn.dataset.id,
            name: btn.dataset.name,
            price: parseInt(btn.dataset.price),
            image: btn.dataset.image,
            qty: 1
        };

        const existing = cart.find(item => item.id === product.id);

        if (existing) {
            existing.qty += 1;
        } else {
            cart.push(product);
        }

        localStorage.setItem("cart", JSON.stringify(cart));

        openCart();
        updateCartUI();
    });
});

function updateCartUI() {
    const cartContent = document.querySelector(".cart-content");
    const totalBox = document.getElementById("cartTotal");

    cartContent.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.qty;

        cartContent.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}">
                <div>
                    <h4>${item.name}</h4>
                    <p>Rs ${item.price} × ${item.qty}</p>
                </div>
            </div>
        `;
    });

    totalBox.innerText = "Rs " + total;
}

function openCart() {
    document.getElementById("cartOverlay").classList.add("active");
    document.getElementById("cartPanel").classList.add("active");
}

document.getElementById("closeCart").onclick = () => {
    document.getElementById("cartOverlay").classList.remove("active");
    document.getElementById("cartPanel").classList.remove("active");
}

document.getElementById("cartBtn").onclick = openCart;

updateCartUI();

function removeFromCart(index) {
    // 1. Cart array se item remove karo
    cart.splice(index, 1);

    // 2. LocalStorage update karo
    localStorage.setItem("cart", JSON.stringify(cart));

    // 3. Cart UI refresh karo
    updateCartUI();
}

function updateCartUI() {
    const cartContent = document.querySelector(".cart-content");
    const totalBox = document.getElementById("cartTotal");

    cartContent.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartContent.innerHTML = "<p>No items yet</p>";
        totalBox.innerText = "Rs 0";
        return;
    }

    cart.forEach((item, index) => {
        total += item.price * item.qty;

        cartContent.innerHTML += `
        <div class="cart-item">
            <img src="${item.image}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>Size: ${item.size || "—"}</p>
                <p>Color: ${item.color || "—"}</p>
                <p>Rs ${item.price} × ${item.qty}</p>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})">✖</button>
        </div>
    `;
    });
}
