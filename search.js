document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q")?.toLowerCase().trim() || "";

    const productLinks = document.querySelectorAll(".featured-card-link");
    const noResults = document.getElementById("noResults");
    const title = document.getElementById("searchTitle");

    title.textContent = `Search results for "${query}"`;

    let found = false;

    productLinks.forEach(link => {
        const card = link.querySelector(".featured-card");
        // Prefer h3 text for name, fallback to data-name
        const name = (card.querySelector("h3")?.textContent || card.querySelector(".add-cart-btn")?.dataset.name || "").toLowerCase();

        if (name.includes(query)) {
            link.style.display = "block";
            found = true;
        } else {
            link.style.display = "none";
        }
    });

    noResults.style.display = found ? "none" : "block";
});