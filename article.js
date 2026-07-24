/* =====================================================
   STUDY CIRCLE EXPLORER
   ARTICLE.JS V2
   Part 1 - Foundation
===================================================== */

"use strict";

/* =====================================================
   CONFIG
===================================================== */

const CONFIG = {

    DATA_FILE: "data/content.json",

    SITE_NAME: "Study Circle Explorer",

    ARTICLE_FOLDER: "articles/",

    SCROLL_OFFSET: 110,

    RELATED_LIMIT: 4

};


/* =====================================================
   GLOBAL STATE
===================================================== */

const state = {

    articles: [],

    currentArticle: null,

    currentSlug: null

};


/* =====================================================
   DOM ELEMENTS
===================================================== */

const DOM = {

    heroImage: document.getElementById("heroImage"),

    title: document.getElementById("title"),

    description: document.getElementById("description"),

    category: document.getElementById("category"),

    author: document.getElementById("author"),

    published: document.getElementById("published"),

    readingTime: document.getElementById("readingTime"),

    breadcrumbTitle:
        document.getElementById("breadcrumbTitle"),

    articleContent:
        document.getElementById("articleContent"),

    tableOfContents:
        document.getElementById("tableOfContents"),

    relatedArticles:
        document.getElementById("relatedArticles"),

    previousArticle:
        document.getElementById("previousArticle"),

    nextArticle:
        document.getElementById("nextArticle"),

    progress:
        document.getElementById("readingProgress"),

    backToTop:
        document.getElementById("backToTop"),

    loader:
        document.querySelector(".page-loader"),

    shareButtons:
        document.querySelectorAll(".share-btn")

};


/* =====================================================
   HELPERS
===================================================== */

const Helpers = {

    slug() {

        const params =
            new URLSearchParams(
                window.location.search
            );

        return params.get("slug");

    },

    showLoader() {

        if (DOM.loader) {

            DOM.loader.style.display = "flex";

        }

    },

    hideLoader() {

        if (DOM.loader) {

            DOM.loader.style.display = "none";

        }

    },

    async fetchJSON(url) {

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(

                `Unable to load ${url}`

            );

        }

        return await response.json();

    },

    async fetchText(url) {

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(

                `Unable to load ${url}`

            );

        }

        return await response.text();

    }

};


/* =====================================================
   ERROR PAGE
===================================================== */

function show404(message = "Article Not Found") {

    Helpers.hideLoader();

    document.title =

        "404 | Study Circle Explorer";

    DOM.articleContent.innerHTML = `

        <section class="error-page">

            <h2>${message}</h2>

            <p>

                Sorry, this article does not exist.

            </p>

            <a href="articles.html">

                ← Browse Articles

            </a>

        </section>

    `;

}


/* =====================================================
   LOAD DATABASE
===================================================== */

async function loadDatabase() {

    try {

        state.articles =

            await Helpers.fetchJSON(

                CONFIG.DATA_FILE

            );

    }

    catch (error) {

        console.error(error);

        show404(

            "Unable to load database."

        );

    }

}


/* =====================================================
   FIND CURRENT ARTICLE
===================================================== */

function findCurrentArticle() {

    state.currentSlug =

        Helpers.slug();

    if (!state.currentSlug) {

        show404(

            "Invalid article URL."

        );

        return false;

    }

    state.currentArticle =

        state.articles.find(

            article =>

            article.slug ===

            state.currentSlug

        );

    if (!state.currentArticle) {

        show404();

        return false;

    }

    return true;

}

/* =====================================================
   STUDY CIRCLE EXPLORER
   ARTICLE.JS V2
   Part 2 - SEO + Hero Renderer
===================================================== */


/* =====================================================
   META TAGS
===================================================== */

function updateMeta(name, value, property = false) {

    if (!value) return;

    let tag;

    if (property) {

        tag = document.querySelector(

            `meta[property="${name}"]`

        );

    } else {

        tag = document.querySelector(

            `meta[name="${name}"]`

        );

    }

    if (!tag) {

        tag = document.createElement("meta");

        if (property) {

            tag.setAttribute("property", name);

        } else {

            tag.setAttribute("name", name);

        }

        document.head.appendChild(tag);

    }

    tag.content = value;

}


/* =====================================================
   CANONICAL URL
===================================================== */

function updateCanonical(url) {

    if (!url) return;

    let canonical =

        document.querySelector(

            'link[rel="canonical"]'

        );

    if (!canonical) {

        canonical =

            document.createElement("link");

        canonical.rel = "canonical";

        document.head.appendChild(canonical);

    }

    canonical.href = url;

}


/* =====================================================
   HERO RENDER
===================================================== */

function renderHero() {

    const article = state.currentArticle;

    if (!article) return;

    DOM.title.textContent =
        article.title || "";

    DOM.description.textContent =
        article.description || "";

    DOM.category.textContent =
        article.category || "";

    DOM.author.textContent =
        article.author ||
        CONFIG.SITE_NAME;

    DOM.published.textContent =
        article.published || "";

    DOM.readingTime.textContent =
        article.readingTime || "";

    DOM.breadcrumbTitle.textContent =
        article.title || "";

    if (article.image) {

        DOM.heroImage.src =
            article.image;

        DOM.heroImage.alt =
            article.title;

    }

}


/* =====================================================
   PAGE SEO
===================================================== */

function updateSEO() {

    const article =

        state.currentArticle;

    if (!article) return;

    document.title =

        `${article.title} | ${CONFIG.SITE_NAME}`;


    updateMeta(

        "description",

        article.description

    );

    updateMeta(

        "keywords",

        article.keywords

    );

    updateMeta(

        "author",

        article.author

    );


    updateMeta(

        "og:title",

        article.title,

        true

    );

    updateMeta(

        "og:description",

        article.description,

        true

    );

    updateMeta(

        "og:image",

        article.image,

        true

    );

    updateMeta(

        "og:type",

        "article",

        true

    );

    updateMeta(

        "og:url",

        window.location.href,

        true

    );


    updateMeta(

        "twitter:card",

        "summary_large_image"

    );

    updateMeta(

        "twitter:title",

        article.title

    );

    updateMeta(

        "twitter:description",

        article.description

    );

    updateMeta(

        "twitter:image",

        article.image

    );


    if (article.canonical) {

        updateCanonical(

            article.canonical

        );

    }

}


/* =====================================================
   JSON-LD
===================================================== */

function generateSchema() {

    const article =

        state.currentArticle;

    if (!article) return;

    const schema = {

        "@context":
        "https://schema.org",

        "@type":
        "Article",

        headline:
        article.title,

        description:
        article.description,

        image:
        article.image,

        author: {

            "@type":"Organization",

            name:
            article.author ||
            CONFIG.SITE_NAME

        },

        publisher:{

            "@type":"Organization",

            name:
            CONFIG.SITE_NAME

        },

        datePublished:
        article.published,

        mainEntityOfPage:
        window.location.href

    };

    const script =

        document.getElementById(

            "articleSchema"

        );

    if (script) {

        script.textContent =

            JSON.stringify(

                schema,

                null,

                2

            );

    }

}


/* =====================================================
   STUDY CIRCLE EXPLORER
   ARTICLE.JS V2
   Part 3 - Article Loader & Renderer
===================================================== */


/* =====================================================
   LOAD ARTICLE HTML
===================================================== */

async function loadArticleHTML() {

    try {

        const article = state.currentArticle;

        const file =

            article.url ||

            `${CONFIG.ARTICLE_FOLDER}${article.slug}.html`;

        const html =

            await Helpers.fetchText(file);

        renderArticle(html);

    }

    catch(error){

        console.error(error);

        show404(

            "Unable to load article."

        );

    }

}


/* =====================================================
   PARSE HTML
===================================================== */

function parseHTML(html){

    const parser =

        new DOMParser();

    return parser.parseFromString(

        html,

        "text/html"

    );

}


/* =====================================================
   EXTRACT ARTICLE BODY
===================================================== */

function extractArticle(documentHTML){

    return(

        documentHTML.querySelector("main") ||

        documentHTML.querySelector("article") ||

        documentHTML.querySelector(".article-content") ||

        documentHTML.body

    );

}


/* =====================================================
   REMOVE DUPLICATE ELEMENTS
===================================================== */

function cleanArticle(container){

    const removeSelectors=[

        "header",

        "footer",

        "nav",

        ".header",

        ".footer",

        ".newsletter",

        ".breadcrumb",

        ".share-section",

        "script",

        "style"

    ];

    removeSelectors.forEach(selector=>{

        container

        .querySelectorAll(selector)

        .forEach(node=>node.remove());

    });

}


/* =====================================================
   RENDER ARTICLE
===================================================== */

function renderArticle(html){

    const documentHTML=

        parseHTML(html);

    const article=

        extractArticle(documentHTML);

    if(!article){

        show404(

            "Article content not found."

        );

        return;

    }

    cleanArticle(article);

    DOM.articleContent.innerHTML=

        article.innerHTML;

    Helpers.hideLoader();

}


/* =====================================================
   IMAGE OPTIMIZATION
===================================================== */

function optimizeImages(){

    const images=

        DOM.articleContent.querySelectorAll("img");

    images.forEach(image=>{

        image.loading="lazy";

        image.decoding="async";

        image.referrerPolicy="no-referrer";

    });

}


/* =====================================================
   EXTERNAL LINKS
===================================================== */

function optimizeLinks(){

    const links=

        DOM.articleContent.querySelectorAll("a");

    links.forEach(link=>{

        if(

            link.hostname &&

            link.hostname!==location.hostname

        ){

            link.target="_blank";

            link.rel=

                "noopener noreferrer";

        }

    });

}



/* =====================================================
   STUDY CIRCLE EXPLORER
   ARTICLE.JS V2
   Part 4 - TOC + Scroll Spy
===================================================== */


/* =====================================================
   GENERATE HEADING ID
===================================================== */

function createHeadingID(text) {

    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

}


/* =====================================================
   GENERATE TABLE OF CONTENTS
===================================================== */

function generateTOC() {

    if (!DOM.tableOfContents) return;

    const headings = DOM.articleContent.querySelectorAll(
        "h2, h3, h4"
    );

    if (!headings.length) {

        DOM.tableOfContents.innerHTML = `
            <p>No sections available.</p>
        `;

        return;

    }

    const ul = document.createElement("ul");

    headings.forEach((heading) => {

        if (!heading.id) {

            heading.id = createHeadingID(
                heading.textContent
            );

        }

        const li = document.createElement("li");

        li.className =
            heading.tagName.toLowerCase();

        const link = document.createElement("a");

        link.href = "#" + heading.id;

        link.textContent =
            heading.textContent;

        link.dataset.target =
            heading.id;

        li.appendChild(link);

        ul.appendChild(li);

    });

    DOM.tableOfContents.innerHTML = "";

    DOM.tableOfContents.appendChild(ul);

}


/* =====================================================
   SMOOTH SCROLL
===================================================== */

function enableTOCScroll() {

    DOM.tableOfContents
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                function (e) {

                    e.preventDefault();

                    const id =
                        this.dataset.target;

                    const section =
                        document.getElementById(id);

                    if (!section) return;

                    window.scrollTo({

                        top:
                            section.offsetTop -
                            CONFIG.SCROLL_OFFSET,

                        behavior: "smooth"

                    });

                }

            );

        });

}


/* =====================================================
   INITIALIZE TOC
===================================================== */

function initializeTOC() {

    generateTOC();

    enableTOCScroll();

}


/* =====================================================
   SCROLL SPY
===================================================== */

function initializeScrollSpy() {

    const headings =
        DOM.articleContent.querySelectorAll(
            "h2, h3, h4"
        );

    if (!headings.length) return;

    const observer =
        new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting)
                        return;

                    DOM.tableOfContents
                        .querySelectorAll("a")
                        .forEach(link => {

                            link.classList.remove(
                                "active"
                            );

                        });

                    const active =
                        DOM.tableOfContents.querySelector(

                            `a[data-target="${entry.target.id}"]`

                        );

                    if (active) {

                        active.classList.add(
                            "active"
                        );

                    }

                });

            },

            {

                rootMargin:
                    "-25% 0px -60% 0px",

                threshold: 0

            }

        );

    headings.forEach(h => observer.observe(h));

}


/* =====================================================
   EXPAND ACTIVE TOC (OPTIONAL)
===================================================== */

function activateFirstHeading() {

    const first =
        DOM.tableOfContents.querySelector("a");

    if (first) {

        first.classList.add("active");

    }

}

/* =====================================================
   STUDY CIRCLE EXPLORER
   ARTICLE.JS V2
   Part 5 - Reading Experience
===================================================== */


/* =====================================================
   READING PROGRESS
===================================================== */

function updateReadingProgress() {

    if (!DOM.progress) return;

    const article = DOM.articleContent;

    if (!article) return;

    const articleTop =
        article.offsetTop;

    const articleHeight =
        article.offsetHeight;

    const viewport =
        window.innerHeight;

    const scroll =
        window.scrollY;

    const total =
        articleHeight - viewport;

    if (total <= 0) {

        DOM.progress.style.width = "100%";

        return;

    }

    const current =
        Math.min(
            Math.max(
                scroll - articleTop,
                0
            ),
            total
        );

    const percent =
        (current / total) * 100;

    DOM.progress.style.width =
        percent + "%";

}


/* =====================================================
   BACK TO TOP BUTTON
===================================================== */

function toggleBackToTop() {

    if (!DOM.backToTop) return;

    if (window.scrollY > 500) {

        DOM.backToTop.classList.add(
            "show"
        );

    } else {

        DOM.backToTop.classList.remove(
            "show"
        );

    }

}


function initializeBackToTop() {

    if (!DOM.backToTop) return;

    DOM.backToTop.addEventListener(

        "click",

        () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }

    );

}


/* =====================================================
   READING COMPLETE
===================================================== */

let readingCompleted = false;

function checkReadingComplete() {

    if (readingCompleted) return;

    const scrollBottom =
        window.scrollY +
        window.innerHeight;

    const pageHeight =
        document.documentElement.scrollHeight;

    if (scrollBottom >= pageHeight - 150) {

        readingCompleted = true;

        console.log(
            "Article reading completed."
        );

        document.dispatchEvent(

            new CustomEvent(

                "articleCompleted",

                {

                    detail: state.currentArticle

                }

            )

        );

    }

}


/* =====================================================
   SCROLL HANDLER
===================================================== */

function handleArticleScroll() {

    updateReadingProgress();

    toggleBackToTop();

    checkReadingComplete();

}


/* =====================================================
   INITIALIZE READING FEATURES
===================================================== */

function initializeReadingFeatures() {

    updateReadingProgress();

    toggleBackToTop();

    initializeBackToTop();

    window.addEventListener(

        "scroll",

        handleArticleScroll,

        {

            passive: true

        }

    );

    window.addEventListener(

        "resize",

        updateReadingProgress

    );

}

/* =====================================================
   STUDY CIRCLE EXPLORER
   ARTICLE.JS V2
   Part 6 - Related Articles + Navigation + Share
===================================================== */


/* =====================================================
   RELATED ARTICLES
===================================================== */

function getRelatedArticles(limit = CONFIG.RELATED_LIMIT) {

    if (!state.currentArticle) return [];

    return state.articles

        .filter(article => article.slug !== state.currentArticle.slug)

        .map(article => {

            let score = 0;

            if (article.category === state.currentArticle.category) {
                score += 5;
            }

            if (article.tags && state.currentArticle.tags) {

                article.tags.forEach(tag => {

                    if (state.currentArticle.tags.includes(tag)) {
                        score += 2;
                    }

                });

            }

            return {
                ...article,
                score
            };

        })

        .sort((a, b) => b.score - a.score)

        .slice(0, limit);

}


function renderRelatedArticles() {

    if (!DOM.relatedArticles) return;

    const articles = getRelatedArticles();

    if (!articles.length) {

        DOM.relatedArticles.innerHTML =
            "<p>No related articles found.</p>";

        return;

    }

    DOM.relatedArticles.innerHTML = articles.map(article => `

        <div class="related-card">

            <a href="article.html?slug=${article.slug}">

                <img src="${article.image}"
                     alt="${article.title}"
                     loading="lazy">

                <h4>${article.title}</h4>

            </a>

        </div>

    `).join("");

}


/* =====================================================
   PREVIOUS / NEXT ARTICLE
===================================================== */

function renderArticleNavigation() {

    const index = state.articles.findIndex(

        article => article.slug === state.currentArticle.slug

    );

    if (DOM.previousArticle) {

        if (index > 0) {

            const previous = state.articles[index - 1];

            DOM.previousArticle.innerHTML = `

                <a href="article.html?slug=${previous.slug}">

                    ← ${previous.title}

                </a>

            `;

        } else {

            DOM.previousArticle.innerHTML = "";

        }

    }

    if (DOM.nextArticle) {

        if (index < state.articles.length - 1) {

            const next = state.articles[index + 1];

            DOM.nextArticle.innerHTML = `

                <a href="article.html?slug=${next.slug}">

                    ${next.title} →

                </a>

            `;

        } else {

            DOM.nextArticle.innerHTML = "";

        }

    }

}


/* =====================================================
   SHARE ENGINE
===================================================== */

function getShareData() {

    return {

        title: state.currentArticle.title,

        text: state.currentArticle.description,

        url: window.location.href

    };

}


function copyArticleLink() {

    navigator.clipboard

        .writeText(window.location.href)

        .then(() => {

            alert("Article link copied!");

        });

}


function shareFacebook() {

    window.open(

        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,

        "_blank"

    );

}


function shareTwitter() {

    const data = getShareData();

    window.open(

        `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.title)}&url=${encodeURIComponent(data.url)}`,

        "_blank"

    );

}


function shareWhatsApp() {

    const data = getShareData();

    window.open(

        `https://wa.me/?text=${encodeURIComponent(data.title + " " + data.url)}`,

        "_blank"

    );

}


function shareTelegram() {

    const data = getShareData();

    window.open(

        `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.title)}`,

        "_blank"

    );

}


async function nativeShare() {

    if (!navigator.share) return;

    try {

        await navigator.share(getShareData());

    }

    catch (error) {

        console.log(error);

    }

}


function initializeShareButtons() {

    DOM.shareButtons.forEach(button => {

        button.addEventListener("click", () => {

            const type = button.dataset.share;

            switch (type) {

                case "facebook":
                    shareFacebook();
                    break;

                case "twitter":
                    shareTwitter();
                    break;

                case "whatsapp":
                    shareWhatsApp();
                    break;

                case "telegram":
                    shareTelegram();
                    break;

                case "copy":
                    copyArticleLink();
                    break;

                case "native":
                    nativeShare();
                    break;

            }

        });

    });

}

/* =====================================================
   STUDY CIRCLE EXPLORER
   ARTICLE.JS V2
   Part 7 - Production Polish
===================================================== */


/* =====================================================
   NEWSLETTER
===================================================== */

function initializeNewsletter() {

    const form =
        document.getElementById("newsletterForm");

    if (!form) return;

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const email =
            document.getElementById("newsletterEmail");

        if (!email) return;

        const value = email.value.trim();

        if (!value) {

            alert("Please enter your email.");

            email.focus();

            return;

        }

        const pattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!pattern.test(value)) {

            alert("Please enter a valid email.");

            email.focus();

            return;

        }

        alert("Thank you for subscribing!");

        form.reset();

    });

}


/* =====================================================
   KEYBOARD ACCESSIBILITY
===================================================== */

function initializeKeyboardAccessibility() {

    document.addEventListener("keydown", function (event) {

        if (event.key === "Home") {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }

    });

}


/* =====================================================
   IMAGE FALLBACK
===================================================== */

function initializeImageFallback() {

    document.querySelectorAll("img").forEach(image => {

        image.addEventListener("error", function () {

            this.src = "images/placeholder.webp";

        });

    });

}


/* =====================================================
   EXTERNAL LINKS
===================================================== */

function secureExternalLinks() {

    document.querySelectorAll("a").forEach(link => {

        if (

            link.hostname &&

            link.hostname !== location.hostname

        ) {

            link.target = "_blank";

            link.rel = "noopener noreferrer";

        }

    });

}


/* =====================================================
   PERFORMANCE
===================================================== */

function initializePerformance() {

    window.addEventListener(

        "pageshow",

        () => {

            updateReadingProgress();

        }

    );

}


/* =====================================================
   PRODUCTION CHECK
===================================================== */

function productionCheck() {

    if (!state.currentArticle) {

        console.error(

            "Current article not loaded."

        );

    }

}


/* =====================================================
   INITIALIZATION
===================================================== */

function initializeModules() {

    initializeTOC();

    activateFirstHeading();

    initializeScrollSpy();

    initializeReadingFeatures();

    renderRelatedArticles();

    renderArticleNavigation();

    initializeShareButtons();

    initializeNewsletter();

    initializeKeyboardAccessibility();

    initializeImageFallback();

    secureExternalLinks();

    initializePerformance();

}


/* =====================================================
   POST RENDER
===================================================== */

function postRender() {

    optimizeImages();

    optimizeLinks();

    initializeModules();

    productionCheck();

}


/* =====================================================
   INITIALIZE APP
===================================================== */

async function initialize() {

    Helpers.showLoader();

    await loadDatabase();

    if (!findCurrentArticle()) {

        return;

    }

    renderHero();

    updateSEO();

    generateSchema();

    await loadArticleHTML();

    postRender();

}

document.addEventListener(

    "DOMContentLoaded",

    initialize

);