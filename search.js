/* ==========================================
   Study Circle Explorer
   Search v4.0
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
   Load Search Database
========================================== */

async function loadSearchData() {

    try {

        loadingState.style.display = "grid";
        emptyState.style.display = "none";

        const response = await fetch("content.json");

        if (!response.ok) {
            throw new Error("Unable to load content.json");
        }

        const json = await response.json();

        searchData = json.articles || [];
        filteredData = [...searchData];

        articleCount.textContent = searchData.length;
        pdfCount.textContent = "0";
        videoCount.textContent = "0";
        resourceCount.textContent = searchData.length;

        loadingState.style.display = "none";

        renderResults(searchData);

    }

    catch(error){

        console.error(error);

        loadingState.style.display = "none";

        resultTitle.textContent = "Search Error";

        resultCount.textContent =
        "Unable to load content.";

    }

}

/* ==========================================
   Start
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    loadSearchData();

});

/* ==========================================
   Render Results
========================================== */

function renderResults(data){

    searchResults.innerHTML = "";

    if(data.length === 0){

        emptyState.style.display = "flex";

        resultCount.textContent = "0 Results Found";

        return;

    }

    emptyState.style.display = "none";

    resultCount.textContent =
    `${data.length} Result${data.length!==1?"s":""}`;

    data.forEach(article=>{

        const card=document.createElement("a");

        card.className="search-card";

        card.href=article.url || "#";

        card.innerHTML=`

        <img
        src="${article.image || 'images/default.jpg'}"
        alt="${article.title}">

        <div class="search-category">

        ${article.category || "Space"}

        </div>

        <h2>

        ${article.title}

        </h2>

        <p>

        ${article.description || article.excerpt || ""}

        </p>

        <span>

        Read Article

        <i class="fas fa-arrow-right"></i>

        </span>

        `;

        searchResults.appendChild(card);

    });

}

/* ==========================================
   Search Function
========================================== */

function performSearch(){

    const keyword =
    searchInput.value.trim().toLowerCase();

    filteredData = searchData.filter(item=>{

        const title =
        (item.title||"").toLowerCase();

        const description =
        (item.description||"").toLowerCase();

        const excerpt =
        (item.excerpt||"").toLowerCase();

        const keywords =
        (item.keywords||"").toLowerCase();

        const category =
        (item.category||"").toLowerCase();

        const matchKeyword =

        title.includes(keyword) ||

        description.includes(keyword) ||

        excerpt.includes(keyword) ||

        keywords.includes(keyword) ||

        category.includes(keyword);

        const matchCategory =

        currentCategory==="all" ||

        category===currentCategory.toLowerCase();

        return matchKeyword && matchCategory;

    });

    resultTitle.textContent =

    keyword===""
    ? "All Resources"
    : `Results for "${searchInput.value}"`;

    renderResults(filteredData);

}

/* ==========================================
   Live Search
========================================== */

searchInput.addEventListener("input",()=>{

    performSearch();

});

/* ==========================================
   Clear Button
========================================== */

clearSearch.addEventListener("click",()=>{

    searchInput.value="";

    performSearch();

    searchInput.focus();

});

/* ==========================================
   Render Results
========================================== */

function renderResults(data){

    searchResults.innerHTML = "";

    if(data.length === 0){

        emptyState.style.display = "flex";

        resultCount.textContent = "0 Results Found";

        return;

    }

    emptyState.style.display = "none";

    resultCount.textContent =
    `${data.length} Result${data.length!==1?"s":""}`;

    data.forEach(article=>{

        const card=document.createElement("a");

        card.className="search-card";

        card.href=article.url || "#";

        card.innerHTML=`

        <img
        src="${article.image || 'images/default.jpg'}"
        alt="${article.title}">

        <div class="search-category">

        ${article.category || "Space"}

        </div>

        <h2>

        ${article.title}

        </h2>

        <p>

        ${article.description || article.excerpt || ""}

        </p>

        <span>

        Read Article

        <i class="fas fa-arrow-right"></i>

        </span>

        `;

        searchResults.appendChild(card);

    });

}

/* ==========================================
   Search Function
========================================== */

function performSearch(){

    const keyword =
    searchInput.value.trim().toLowerCase();

    filteredData = searchData.filter(item=>{

        const title =
        (item.title||"").toLowerCase();

        const description =
        (item.description||"").toLowerCase();

        const excerpt =
        (item.excerpt||"").toLowerCase();

        const keywords =
        (item.keywords||"").toLowerCase();

        const category =
        (item.category||"").toLowerCase();

        const matchKeyword =

        title.includes(keyword) ||

        description.includes(keyword) ||

        excerpt.includes(keyword) ||

        keywords.includes(keyword) ||

        category.includes(keyword);

        const matchCategory =

        currentCategory==="all" ||

        category===currentCategory.toLowerCase();

        return matchKeyword && matchCategory;

    });

    resultTitle.textContent =

    keyword===""
    ? "All Resources"
    : `Results for "${searchInput.value}"`;

    renderResults(filteredData);

}

/* ==========================================
   Live Search
========================================== */

searchInput.addEventListener("input",()=>{

    performSearch();

});

/* ==========================================
   Clear Button
========================================== */

clearSearch.addEventListener("click",()=>{

    searchInput.value="";

    performSearch();

    searchInput.focus();

});