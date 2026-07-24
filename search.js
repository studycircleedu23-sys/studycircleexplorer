"use strict";

/* ==========================================================
   APP STATE
========================================================== */

let articles = [];
let filteredArticles = [];
let currentCategory = "all";

/* ==========================================================
   DOM ELEMENTS
========================================================== */

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");

const resultTitle = document.getElementById("resultTitle");
const resultCount = document.getElementById("resultCount");

const articleCount = document.getElementById("articleCount");
const pdfCount = document.getElementById("pdfCount");
const videoCount = document.getElementById("videoCount");

const clearSearch = document.getElementById("clearSearch");

const filterButtons = document.querySelectorAll(".filter-btn");
const trendingButtons = document.querySelectorAll(".search-chip");

/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeSearch();

});

/* ==========================================================
   INITIALIZE APP
========================================================== */

async function initializeSearch() {

    showLoading();

    await loadContent();

    renderStatistics();

    renderResults(articles);

    hideLoading();

}

/* ==========================================================
   LOAD CONTENT
========================================================== */

async function loadContent() {

    try {

        const response = await fetch("content.json");

        if (!response.ok) {

            throw new Error("Unable to load content.json");

        }

        const data = await response.json();

        articles = data.articles || [];

        filteredArticles = [...articles];

    }

    catch (error) {

        console.error(error);

        showEmpty("Unable to load articles.");

    }

}

/* ==========================================================
   STATISTICS
========================================================== */

function renderStatistics() {

    articleCount.textContent = articles.length;

    pdfCount.textContent = 0;

    videoCount.textContent = 0;

    resultTitle.textContent = "All Articles";

    resultCount.textContent = `${articles.length} Articles`;

}

/* ==========================================================
   RENDER RESULTS
========================================================== */

function renderResults(data) {

    searchResults.innerHTML = "";

    if (!data.length) {

        showEmpty("No articles found.");

        return;

    }

    hideEmpty();

    resultCount.textContent = `${data.length} Articles`;

    data.forEach(article => {

        const card = createArticleCard(article);

        searchResults.appendChild(card);

    });

}

/* ==========================================================
   CREATE CARD
========================================================== */

function createArticleCard(article) {

    const card = document.createElement("a");

    card.className = "article-card";

    card.href = `article.html?slug=${article.slug}` || "#";

    card.innerHTML = `

        <div class="article-image">

            <img
                src="${article.image || 'images/default.jpg'}"
                alt="${article.title}">

        </div>

        <div class="article-content">

            <div class="article-category">

                ${article.category || "Astronomy"}

            </div>

            <h3 class="article-title">

                ${article.title}

            </h3>

            <p class="article-description">

                ${article.description || article.excerpt || ""}

            </p>

            <div class="article-footer">

                <span class="read-link">

                    Read Article →

                </span>

            </div>

        </div>

    `;

    return card;

}

/* ==========================================================
   UI HELPERS
========================================================== */

function showLoading() {

    loadingState.style.display = "grid";

}

function hideLoading() {

    loadingState.style.display = "none";

}

function showEmpty(message = "No articles found.") {

    emptyState.style.display = "flex";

    searchResults.innerHTML = "";

    resultCount.textContent = "0 Articles";

    const text = emptyState.querySelector("p");

    if (text) {

        text.textContent = message;

    }

}

function hideEmpty() {

    emptyState.style.display = "none";

}
/* ==========================================================
   SEARCH ENGINE
========================================================== */

function performSearch() {

    const keyword = searchInput.value
        .trim()
        .toLowerCase();

    filteredArticles = articles.filter(article => {

        const title = (article.title || "").toLowerCase();

        const description = (article.description || "").toLowerCase();

        const excerpt = (article.excerpt || "").toLowerCase();

        const keywords = (article.keywords || "").toLowerCase();

        const category = (article.category || "").toLowerCase();

        const tags = Array.isArray(article.tags)
            ? article.tags.join(" ").toLowerCase()
            : "";

        const matchesKeyword =

            title.includes(keyword) ||

            description.includes(keyword) ||

            excerpt.includes(keyword) ||

            keywords.includes(keyword) ||

            tags.includes(keyword) ||

            category.includes(keyword);

        const matchesCategory =

            currentCategory === "all" ||

            category === currentCategory.toLowerCase();

        return matchesKeyword && matchesCategory;

    });

    resultTitle.textContent =

        keyword === ""

        ? "All Articles"

        : `Search: "${searchInput.value}"`;

    renderResults(filteredArticles);

}

/* ==========================================================
   CATEGORY FILTER
========================================================== */

function applyCategory(category) {

    currentCategory = category;

    filterButtons.forEach(button => {

        button.classList.remove("active");

        if (button.dataset.category === category) {

            button.classList.add("active");

        }

    });

    performSearch();

}

/* ==========================================================
   FILTER BUTTON EVENTS
========================================================== */

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        applyCategory(button.dataset.category);

    });

});

/* ==========================================================
   TRENDING CHIPS
========================================================== */

trendingButtons.forEach(chip => {

    chip.addEventListener("click", () => {

        const keyword = chip.dataset.search;

        searchInput.value = keyword;

        performSearch();

        searchInput.focus();

    });

});

/* ==========================================================
   LIVE SEARCH
========================================================== */

searchInput.addEventListener("input", () => {

    performSearch();

});

/* ==========================================================
   CLEAR BUTTON
========================================================== */

clearSearch.addEventListener("click", () => {

    searchInput.value = "";

    currentCategory = "all";

    filterButtons.forEach(button => {

        button.classList.remove("active");

        if (button.dataset.category === "all") {

            button.classList.add("active");

        }

    });

    performSearch();

    searchInput.focus();

});

/* ==========================================================
   CLICKABLE ARTICLE CARD
========================================================== */

searchResults.addEventListener("click", event => {

    const card = event.target.closest(".article-card");

    if (!card) return;

});

/* ==========================================================
   CLICKABLE STAT CARD
========================================================== */

const allArticlesButton = document.getElementById("allArticles");

if (allArticlesButton) {

    allArticlesButton.addEventListener("click", () => {

        currentCategory = "all";

        searchInput.value = "";

        performSearch();

        document.querySelector(".results-wrapper")
            .scrollIntoView({

                behavior: "smooth"

            });

    });

}

/* ==========================================================
   IMAGE FALLBACK
========================================================== */

document.addEventListener("error", (event) => {

    if (
        event.target.tagName === "IMG" &&
        event.target.closest(".article-image")
    ) {

        event.target.src = "images/default.jpg";

    }

}, true);


/* ==========================================================
   LOADING SKELETON
========================================================== */

function showSkeleton(count = 6) {

    searchResults.innerHTML = "";

    hideEmpty();

    loadingState.style.display = "none";

    for (let i = 0; i < count; i++) {

        const skeleton = document.createElement("div");

        skeleton.className = "article-card skeleton-card";

        skeleton.innerHTML = `

            <div class="skeleton-image"></div>

            <div class="article-content">

                <div class="skeleton-category"></div>

                <div class="skeleton-title"></div>

                <div class="skeleton-text"></div>

                <div class="skeleton-text short"></div>

            </div>

        `;

        searchResults.appendChild(skeleton);

    }

}


/* ==========================================================
   FADE-IN ANIMATION
========================================================== */

function animateCards() {

    const cards = document.querySelectorAll(".article-card");

    cards.forEach((card, index) => {

        card.style.opacity = "0";

        card.style.transform = "translateY(20px)";

        setTimeout(() => {

            card.style.transition =
                "opacity .4s ease, transform .4s ease";

            card.style.opacity = "1";

            card.style.transform = "translateY(0)";

        }, index * 40);

    });

}


/* ==========================================================
   IMPROVED RENDER
========================================================== */

const originalRenderResults = renderResults;

renderResults = function (data) {

    originalRenderResults(data);

    animateCards();

};


/* ==========================================================
   SCROLL TO TOP AFTER SEARCH
========================================================== */

function scrollResultsIntoView() {

    const wrapper = document.querySelector(".results-wrapper");

    if (!wrapper) return;

    wrapper.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


/* ==========================================================
   ENTER KEY
========================================================== */

searchInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        performSearch();

        scrollResultsIntoView();

    }

});


/* ==========================================================
   ESC KEY
========================================================== */

document.addEventListener("keydown", (event) => {

    if (event.key !== "Escape") return;

    searchInput.value = "";

    currentCategory = "all";

    performSearch();

});


/* ==========================================================
   SCROLL TO TOP BUTTON (Future Ready)
========================================================== */

window.addEventListener("scroll", () => {

    // Reserved for future Back-to-Top button

});


/* ==========================================================
   PERFORMANCE
========================================================== */

function debounce(fn, delay = 250) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            fn(...args);

        }, delay);

    };

}

const debouncedSearch = debounce(() => {

    performSearch();

}, 200);


/* ==========================================================
   REPLACE INPUT EVENT
========================================================== */

searchInput.removeEventListener("input", performSearch);

searchInput.addEventListener("input", debouncedSearch);


/* ==========================================================
   SEARCH COMPLETE
========================================================== */

console.log(
    "%cSearch v5.0 Loaded",
    "color:#00d4ff;font-size:14px;font-weight:bold;"
);