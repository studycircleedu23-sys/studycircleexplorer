/* ==========================================
   Study Circle Explorer Search v2.0
========================================== */

let searchData = [];
let filteredData = [];
let currentCategory = "all";

/* ---------- Elements ---------- */

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
   Load JSON Database
========================================== */

async function loadSearchData(){

    try{

        loadingState.style.display="grid";

        const response = await fetch("search-data.json");

        if(!response.ok){

            throw new Error("Unable to load search data.");

        }

        searchData = await response.json();

        filteredData = [...searchData];

        loadingState.style.display="none";

        updateStatistics();

        renderResults(filteredData);

        initializeURLSearch();

    }

    catch(error){

        console.error(error);

        loadingState.style.display="none";

        resultTitle.textContent="Search unavailable";

        resultCount.textContent="Unable to load search database.";

    }

}
/* ==========================================
   Start Application
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    loadSearchData();

});

/* ==========================================
   Live Search
========================================== */

function performSearch() {

    const query = searchInput.value.trim().toLowerCase();

    filteredData = searchData.filter(item => {

        const matchCategory =
            currentCategory === "all" ||
            item.category.toLowerCase() === currentCategory.toLowerCase();

        const matchSearch =

            item.title.toLowerCase().includes(query) ||

            item.description.toLowerCase().includes(query) ||

            item.category.toLowerCase().includes(query) ||

            item.type.toLowerCase().includes(query) ||

            item.keywords.some(keyword =>
                keyword.toLowerCase().includes(query)
            );

        return matchCategory && matchSearch;

    });

    renderResults(filteredData);

}

/* ==========================================
   Render Results
========================================== */

function renderResults(data){

    searchResults.innerHTML="";

    if(data.length===0){

        emptyState.style.display="flex";

        resultTitle.textContent="No Results Found";

        resultCount.textContent="Try another keyword.";

        return;

    }

    emptyState.style.display="none";

    resultTitle.textContent="Search Results";

    resultCount.textContent=`${data.length} result(s) found`;

    data.forEach(item=>{

        const card=document.createElement("a");

        card.href=item.url;

        card.className="search-card";

        card.innerHTML=`

            <div class="search-category">

                ${item.category}

            </div>

            <h2>

                ${item.title}

            </h2>

            <p>

                ${item.description}

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
   Live Typing
========================================== */

searchInput.addEventListener("input",()=>{

    performSearch();

});

/* ==========================================
   Category Filters
========================================== */

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        currentCategory = button.dataset.category;

        performSearch();

    });

});

/* ==========================================
   Trending Search Chips
========================================== */

const searchChips = document.querySelectorAll(".search-chip");

searchChips.forEach(chip => {

    chip.addEventListener("click", () => {

        const keyword = chip.dataset.search;

        searchInput.value = keyword;

        performSearch();

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

    document
        .querySelector('.filter-btn[data-category="all"]')
        .classList.add("active");

    renderResults(searchData);

    resultTitle.textContent = "All Resources";

    resultCount.textContent =
        `${searchData.length} resource(s) available`;

    searchInput.focus();

});

/* ==========================================
   Search On Enter
========================================== */

searchInput.addEventListener("keydown", e => {

    if (e.key === "Enter") {

        performSearch();

    }

});

/* ==========================================
   URL Search Support
========================================== */

function initializeURLSearch() {

    const params = new URLSearchParams(window.location.search);

    const query = params.get("q");

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
   Update URL While Searching
========================================== */

function updateSearchURL() {

    const keyword = searchInput.value.trim();

    const url = new URL(window.location);

    if (keyword) {

        url.searchParams.set("q", keyword);

    } else {

        url.searchParams.delete("q");

    }

    window.history.replaceState({}, "", url);

}

/* ==========================================
   Update URL Automatically
========================================== */

searchInput.addEventListener("input", () => {

    updateSearchURL();

});

/* ==========================================
   Keyboard Shortcut
========================================== */

document.addEventListener("keydown", e => {

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {

        e.preventDefault();

        searchInput.focus();

        searchInput.select();

    }

});

/* ==========================================
   Escape Key Clears Search
========================================== */

document.addEventListener("keydown", e => {

    if (e.key === "Escape") {

        clearSearch.click();

    }

});

/* ==========================================
   Browser Back / Forward Support
========================================== */

window.addEventListener("popstate", () => {

    initializeURLSearch();

});