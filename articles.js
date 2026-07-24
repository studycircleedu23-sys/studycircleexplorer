/* ==========================================
   GLOBAL VARIABLES
========================================== */

let articles = [];
let filteredArticles = [];
let currentCategory = "all";

/* ==========================================
   DOM ELEMENTS
========================================== */

const articleSearch = document.getElementById("articleSearch");

const articlesGrid = document.getElementById("articlesGrid");

const loadingState = document.getElementById("loadingState");

const emptyState = document.getElementById("emptyState");

const resultsTitle = document.getElementById("resultsTitle");

const resultsCount = document.getElementById("resultsCount");

const totalArticles = document.getElementById("totalArticles");

const totalCategories = document.getElementById("totalCategories");

const featuredTitle = document.getElementById("featuredTitle");

const featuredDescription = document.getElementById("featuredDescription");

const featuredImage = document.getElementById("featuredImage");

const featuredButton = document.getElementById("featuredButton");

const sortArticles = document.getElementById("sortArticles");

const resetFilters = document.getElementById("resetFilters");

/* ==========================================
   LOAD ARTICLES DATABASE
========================================== */

async function loadArticles() {

    loadingState.style.display = "grid";

    emptyState.style.display = "none";

    articlesGrid.innerHTML = "";

    try {

        const response = await fetch("articles-data.json");

        articles = await response.json();

        filteredArticles = [...articles];

        updateStatistics();

        loadFeaturedArticle();

        sortAndRender();

initializeURLSearch();
    } catch (error) {

        console.error("Unable to load articles:", error);

        loadingState.style.display = "none";

        articlesGrid.innerHTML = `
            <div class="error-message">
                <h2>⚠ Unable to Load Articles</h2>
                <p>Please try again later.</p>
            </div>
        `;
    }

}

/* ==========================================
   UPDATE STATISTICS
========================================== */

function updateStatistics() {

    totalArticles.textContent = articles.length;

    const categories = new Set(
        articles.map(article => article.category)
    );

    totalCategories.textContent = categories.size;

}

/* ==========================================
   FEATURED ARTICLE
========================================== */

function loadFeaturedArticle() {

    const featured = articles.find(article => article.featured);

    if (!featured) return;

    featuredTitle.textContent = featured.title;

    featuredDescription.textContent = featured.description;

    featuredImage.src = featured.image;

    featuredImage.alt = featured.title;

  featuredButton.href = `article.html?slug=${featured.slug}`;

}

/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadArticles();

});

/* ==========================================
   SEARCH ARTICLES
========================================== */

function searchArticles() {

    const keyword = articleSearch.value.trim().toLowerCase();

    filteredArticles = articles.filter(article => {

        const matchesKeyword =

            article.title.toLowerCase().includes(keyword) ||

            article.description.toLowerCase().includes(keyword) ||

            article.category.toLowerCase().includes(keyword) ||

            article.keywords.some(tag =>
                tag.toLowerCase().includes(keyword)
            );

        const matchesCategory =

            currentCategory === "all" ||

            article.category === currentCategory;

        return matchesKeyword && matchesCategory;

    });

    sortAndRender();

}

/* ==========================================
   SORT ARTICLES
========================================== */

function sortAndRender() {

    const sortType = sortArticles.value;

    switch (sortType) {

        case "latest":

            filteredArticles.sort(
                (a, b) =>
                    new Date(b.date) - new Date(a.date)
            );

            break;

        case "oldest":

            filteredArticles.sort(
                (a, b) =>
                    new Date(a.date) - new Date(b.date)
            );

            break;

        case "az":

            filteredArticles.sort((a, b) =>
                a.title.localeCompare(b.title)
            );

            break;

        case "za":

            filteredArticles.sort((a, b) =>
                b.title.localeCompare(a.title)
            );

            break;

    }

    renderArticles(filteredArticles);

}

/* ==========================================
   RENDER ARTICLES
========================================== */

function renderArticles(data) {

    loadingState.style.display = "none";

    articlesGrid.innerHTML = "";

    if (data.length === 0) {

        emptyState.style.display = "block";

        resultsTitle.textContent = "No Articles Found";

        resultsCount.textContent = "0 article(s)";

        return;

    }

    emptyState.style.display = "none";

    resultsTitle.textContent = "Latest Articles";

    resultsCount.textContent =
        `${data.length} article(s) found`;

    data.forEach(article => {

        articlesGrid.innerHTML += `

        <article class="article-card">

            <img
                src="${article.image}"
                alt="${article.title}"
                loading="lazy">

            <div class="article-content">

                <span class="article-category">

                    ${article.category}

                </span>

                <h3>

                    ${article.title}

                </h3>

                <p>

                    ${article.description}

                </p>

                <div class="article-meta">

                    <span>

                        📅 ${article.date}

                    </span>

                    <span>

                        ⏱ ${article.readingTime}

                    </span>

                </div>

                <a
                    href="article.html?slug=${article.slug}"
                    class="read-btn">

                    Read Article

                    <i class="fa-solid fa-arrow-right"></i>

                </a>

            </div>

        </article>

        `;

    });

}

/* ==========================================
   LIVE SEARCH
========================================== */

articleSearch.addEventListener("input", () => {

    searchArticles();

});

/* ==========================================
   SORT DROPDOWN
========================================== */

sortArticles.addEventListener("change", () => {

    sortAndRender();

});

/* ==========================================
   CATEGORY FILTERS
========================================== */

const categoryButtons = document.querySelectorAll(".category-btn");

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        categoryButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        currentCategory = button.dataset.category;

        searchArticles();

    });

});

/* ==========================================
   TRENDING TAGS
========================================== */

const tagButtons = document.querySelectorAll(".tag-btn");

tagButtons.forEach(button => {

    button.addEventListener("click", () => {

        articleSearch.value = button.dataset.tag;

        searchArticles();

        articleSearch.focus();

    });

});

/* ==========================================
   RESET FILTERS
========================================== */

resetFilters.addEventListener("click", () => {

    articleSearch.value = "";

    currentCategory = "all";

    categoryButtons.forEach(btn =>
        btn.classList.remove("active")
    );

    document
        .querySelector('.category-btn[data-category="all"]')
        .classList.add("active");

    filteredArticles = [...articles];

    sortAndRender();

    articleSearch.focus();

});

/* ==========================================
   URL SEARCH SUPPORT
========================================== */

function initializeURLSearch() {

    const params = new URLSearchParams(window.location.search);

    const query = params.get("q");

    if (query) {

        articleSearch.value = query;

        searchArticles();

    }

}

/* ==========================================
   UPDATE URL
========================================== */

function updateSearchURL() {

    const keyword = articleSearch.value.trim();

    const url = new URL(window.location);

    if (keyword) {

        url.searchParams.set("q", keyword);

    } else {

        url.searchParams.delete("q");

    }

    history.replaceState({}, "", url);

}

articleSearch.addEventListener("input", updateSearchURL);

/* ==========================================
   KEYBOARD SHORTCUTS
========================================== */

document.addEventListener("keydown", event => {

    if ((event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k") {

        event.preventDefault();

        articleSearch.focus();

        articleSearch.select();

    }

});

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        articleSearch.value = "";

        currentCategory = "all";

        categoryButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        document
            .querySelector('.category-btn[data-category="all"]')
            .classList.add("active");

        filteredArticles = [...articles];

        sortAndRender();

    }

});

/* ==========================================
   BROWSER HISTORY SUPPORT
========================================== */

window.addEventListener("popstate", () => {

    initializeURLSearch();

});