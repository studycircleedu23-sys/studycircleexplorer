/* ==========================================
   Study Circle Explorer Search v3.0
========================================== */

let searchData = [];
let filteredData = [];
let currentCategory = "all";

/* ==========================================
   Elements
========================================== */

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");

const resultTitle = document.getElementById("resultTitle");
const resultCount = document.getElementById("resultCount");

const articleCount = document.getElementById("articleCount");
const pdfCount = document.getElementById("pdfCount");
const videoCount = document.getElementById("videoCount");
const resourceCount = document.getElementById("resourceCount");

const clearSearch = document.getElementById("clearSearch");

/* ==========================================
   Load Search Data
========================================== */

async function loadSearchData() {

    try {

        loadingState.style.display = "grid";

        const response = await fetch("content.json");

        if (!response.ok) {
            throw new Error("Unable to load content.json");
        }

        const json = await response.json();

        searchData = json.articles || [];
        filteredData = [...searchData];

        loadingState.style.display = "none";

        updateStatistics();

        initializeURLSearch();

    }

    catch (err) {

        console.error(err);

        loadingState.style.display = "none";

        resultTitle.textContent = "Search unavailable";

        resultCount.textContent =
            "Unable to load search database.";

    }

}

/* ==========================================
   Statistics
========================================== */

function updateStatistics() {

    articleCount.textContent = searchData.length;

    pdfCount.textContent = 0;

    videoCount.textContent = 0;

    resourceCount.textContent = searchData.length;

}

/* ==========================================
   Start
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadSearchData();

});

/* ==========================================
   Perform Search
========================================== */

function performSearch() {

    const query = searchInput.value
        .trim()
        .toLowerCase();

    filteredData = searchData.filter(item => {

        const title =
            (item.title || "").toLowerCase();

        const description =
            (item.description || "").toLowerCase();

        const category =
            (item.category || "").toLowerCase();

        const keywords =
            (item.keywords || "").toLowerCase();

        const matchSearch =
            title.includes(query) ||
            description.includes(query) ||
            category.includes(query) ||
            keywords.includes(query);

        const matchCategory =
            currentCategory === "all" ||
            category === currentCategory.toLowerCase();

        return matchSearch && matchCategory;

    });

    renderResults(filteredData);

}

/* ==========================================
   Render Results
========================================== */

function renderResults(data) {

    searchResults.innerHTML = "";

    if (data.length === 0) {

        emptyState.style.display = "flex";

        resultTitle.textContent = "No Results Found";

        resultCount.textContent =
            "Try another keyword.";

        return;

    }

    emptyState.style.display = "none";

    resultTitle.textContent = "Search Results";

    resultCount.textContent =
        `${data.length} result(s) found`;

    data.forEach(item => {

        const card =
            document.createElement("a");

        card.href = item.url || "#";

        card.className = "search-card";

        card.innerHTML = `

<img
src="${item.image || 'studycircle-logo.png'}"
alt="${item.title || ''}"
loading="lazy">

<div class="search-category">
${item.category || "Article"}
</div>

<h2>
${item.title || "Untitled"}
</h2>

<p>
${item.description || ""}
</p>

<span>

Read More

<i class="fa-solid fa-arrow-right"></i>

</span>

`;

        searchResults.appendChild(card);

    });

}

/* ==========================================
   Live Search
========================================== */

searchInput.addEventListener("input", () => {

    performSearch();

    updateSearchURL();

});

/* ==========================================
   Category Filters
========================================== */

const filterButtons =
document.querySelectorAll(".filter-btn");

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        currentCategory =
        button.dataset.category || "all";

        performSearch();

    });

});

/* ==========================================
   Trending Search Chips
========================================== */

document.querySelectorAll(".search-chip")
.forEach(chip => {

    chip.addEventListener("click", () => {

        const keyword =
        chip.dataset.search || "";

        searchInput.value = keyword;

        performSearch();

        updateSearchURL();

        searchInput.focus();

    });

});

/* ==========================================
   Clear Search
========================================== */

clearSearch.addEventListener("click", () => {

    searchInput.value = "";

    currentCategory = "all";

    filterButtons.forEach(btn =>
        btn.classList.remove("active")
    );

    const allBtn =
    document.querySelector(
        '.filter-btn[data-category="all"]'
    );

    if (allBtn) {
        allBtn.classList.add("active");
    }

    filteredData = [...searchData];

    renderResults(filteredData);

    resultTitle.textContent = "All Resources";

    resultCount.textContent =
    `${searchData.length} resource(s) available`;

    updateSearchURL();

    searchInput.focus();

});

/* ==========================================
   URL Search
========================================== */

function initializeURLSearch() {

    const params =
    new URLSearchParams(window.location.search);

    const query =
    params.get("q");

    if (query) {

        searchInput.value = query;

        performSearch();

    } else {

        renderResults(searchData);

        resultTitle.textContent = "All Resources";

        resultCount.textContent =
        `${searchData.length} resource(s) available`;

    }

}

/* ==========================================
   Update URL
========================================== */

function updateSearchURL() {

    const keyword =
    searchInput.value.trim();

    const url =
    new URL(window.location);

    if (keyword) {

        url.searchParams.set("q", keyword);

    } else {

        url.searchParams.delete("q");

    }

    window.history.replaceState({}, "", url);

}

/* ==========================================
   Keyboard Support
========================================== */

searchInput.addEventListener("keydown", e => {

    if (e.key === "Enter") {

        performSearch();

    }

});

document.addEventListener("keydown", e => {

    if ((e.ctrlKey || e.metaKey)
        && e.key.toLowerCase() === "k") {

        e.preventDefault();

        searchInput.focus();

        searchInput.select();

    }

});

document.addEventListener("keydown", e => {

    if (e.key === "Escape") {

        clearSearch.click();

    }

});

/* ==========================================
   Browser Navigation
========================================== */

window.addEventListener("popstate", () => {

    initializeURLSearch();

});