#!/usr/bin/env node

/**
 * ==========================================================
 * Study Circle Explorer
 * Content Generator
 * Part 1 - Core Engine
 * ==========================================================
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const ARTICLES_DIR = path.join(ROOT, "articles");
const OUTPUT_FILE = path.join(ROOT, "content.json");

const SITE_URL =
  "https://studycircleedu23-sys.github.io/studycircleexplorer/";

const DEFAULT_AUTHOR = "Study Circle Explorer";

const DEFAULT_IMAGE = "images/og-image.webp";

const DEFAULT_CATEGORY = "Space";
const CATEGORY_RULES = {
  NASA: [
    "nasa",
    "jwst",
    "james webb",
    "hubble",
    "roman space telescope",
    "roman telescope",
    "perseverance",
    "voyager"
  ],

  ISRO: [
    "isro",
    "aditya-l1",
    "chandrayaan",
    "gaganyaan",
    "mangalyaan",
    "nisar"
  ],

  "Black Holes": [
    "black hole",
    "event horizon",
    "singularity",
    "supermassive"
  ],

  Galaxies: [
    "galaxy",
    "galaxies",
    "milky way",
    "andromeda",
    "messier"
  ],

  Cosmology: [
    "big bang",
    "cosmic microwave background",
    "cmb",
    "cosmic inflation",
    "dark matter",
    "dark energy",
    "observable universe",
    "cosmic web"
  ],

  Stars: [
    "star",
    "stellar",
    "supernova",
    "neutron star",
    "white dwarf",
    "red giant"
  ],

  Planets: [
    "planet",
    "earth",
    "mars",
    "venus",
    "mercury",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "exoplanet"
  ],

  Moon: [
    "moon",
    "lunar"
  ],

  Astronomy: [
    "astronomy",
    "nebula",
    "telescope",
    "constellation"
  ]
};
const articles = [];

/* ==========================================================
   Utility Functions
========================================================== */

function safeRead(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch (err) {
    console.error("❌ Cannot read:", file);
    return "";
  }
}

function clean(text = "") {
  return text
    .replace(/\r/g, "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function match(html, regex) {
  const m = html.match(regex);
  return m ? clean(m[1]) : "";
}

function stripHTML(html) {
  return clean(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
  );
}

/* ==========================================================
   Reading Time
========================================================== */

function readingTime(text) {
  const words = text.split(/\s+/).filter(Boolean).length;

  const mins = Math.max(1, Math.ceil(words / 200));

  return `${mins} min read`;
}

/* ==========================================================
   Category Detection
========================================================== */

function detectCategory(html, filename) {

  const text = (html + " " + filename).toLowerCase();

  let bestCategory = DEFAULT_CATEGORY;
  let highestScore = 0;

  for (const category in CATEGORY_RULES) {

    let score = 0;

    for (const keyword of CATEGORY_RULES[category]) {

      const matches = text.match(
        new RegExp(
          keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "gi"
        )
      );

      if (matches) {
        score += matches.length;
      }

    }

    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
    }

  }

  return bestCategory;

}

/* ==========================================================
   Image Extraction
========================================================== */

function firstMatch(html, patterns) {

  for (const regex of patterns) {

    const value = match(html, regex);

    if (value) return value;

  }

  return "";

}

function detectImage(html) {

  let image = firstMatch(html, [

  /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,

  /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,

  /<img[^>]*class=["'][^"']*article-image[^"']*["'][^>]*src=["']([^"']+)["']/i,

  /<img[^>]*src=["']([^"']+)["'][^>]*class=["'][^"']*article-image[^"']*["']/i,

  /<img[^>]*src=["']([^"']+)["']/i

]);
image = image
  .replace(/^https?:\/\/[^/]+\//, "")
  .replace(/^(\.\.\/)+/, "")
  .replace(/^\/+/, "");
  if (
  image.endsWith("studycircle-logo.png") ||
  image.endsWith("logo.png")
) {
  return DEFAULT_IMAGE;
}
  if (!image)
    return DEFAULT_IMAGE;

  image = image
    .replace(/^https?:\/\/[^/]+\//, "")
    .replace(/^(\.\.\/)+/, "")
    .replace(/^\/+/, "");

  image = image.replace(/\\/g, "/");

  return image;

}

/* ==========================================================
   Meta Extraction
========================================================== */

function extractMeta(html, filename) {

  const title = firstMatch(html, [

    /<h1[^>]*class="hero-title"[^>]*>([\s\S]*?)<\/h1>/i,

    /<h1[^>]*>([\s\S]*?)<\/h1>/i,

    /<title>(.*?)<\/title>/i

  ]) || filename.replace(".html", "");

  const description = firstMatch(html, [

    /<p[^>]*class="hero-subtitle"[^>]*>([\s\S]*?)<\/p>/i,

    /<meta\s+name="description"\s+content="([^"]+)"/i

  ]);

  const keywords = firstMatch(html, [

    /<meta\s+name="keywords"\s+content="([^"]+)"/i

  ]);

  const author = firstMatch(html, [

    /<meta\s+name="author"\s+content="([^"]+)"/i

  ]) || DEFAULT_AUTHOR;

  const body = stripHTML(html);

  return {
    title,
    description,
    keywords,
    author,
    body
  };

}
/* ==========================================================
   Metadata Helpers
========================================================== */

function detectPublishedDate(html) {

  return firstMatch(html, [

    /<i[^>]*fa-calendar[^>]*<\/i>\s*([^<]+)/i,

    /(\d{1,2}\s+[A-Za-z]+\s+\d{4})/

  ]);

}

function detectReadingTime(html, body) {

  const pageTime = firstMatch(html, [

    /<i[^>]*fa-clock[^>]*<\/i>\s*([^<]+)/i,

    /(\d+\s*min\s*read)/i

  ]);

  return pageTime || readingTime(body);

}

function generateTags(category, keywords) {

  const tags = new Set();

  if (category)
    tags.add(category);

  if (keywords) {

    keywords
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean)
      .forEach(tag => tags.add(tag));

  }

  return [...tags];

}
/* ==========================================================
   Scan Articles
========================================================== */

const files = fs
  .readdirSync(ARTICLES_DIR)
  .filter(file => file.endsWith(".html"))
  .sort();

/* ==========================================================
   Process Every HTML File
========================================================== */

for (const file of files) {

  const filePath = path.join(ARTICLES_DIR, file);

  const html = safeRead(filePath);

  if (!html) continue;

  const meta = extractMeta(html, file);

  const category = detectCategory(html, file);

  const image = detectImage(html);

  const excerpt =
    meta.description ||
    meta.body.substring(0, 180) + "...";

  const article = {

  id: articles.length + 1,

  slug: file.replace(".html", ""),

  title: meta.title,

  description: meta.description || excerpt,

  excerpt,

  keywords: meta.keywords,

  author: meta.author,

  category,

  image,

  url: `articles/${file}`,

  canonical: SITE_URL + "articles/" + file,

  readingTime: detectReadingTime(html, meta.body),

  featured: false,

  published: detectPublishedDate(html),

  lastModified: "",

  tags: generateTags(category, meta.keywords)

};

  articles.push(article);

}

/* ==========================================================
   Sort Articles
========================================================== */

articles.sort((a, b) => {

  if (a.category !== b.category) {
    return a.category.localeCompare(b.category);
  }

  return a.title.localeCompare(b.title);

});

console.log("");

console.log(
  `✅ ${articles.length} Articles Processed`
);

console.log("");

/* ==========================================================
   Generate content.json
========================================================== */

const output = {
  generatedAt: new Date().toISOString(),
  site: "Study Circle Explorer",
  totalArticles: articles.length,
  articles
};

try {

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(output, null, 2),
    "utf8"
  );

  console.log("=========================================");
  console.log("🎉 SUCCESS");
  console.log("=========================================");
  console.log(`📄 Total Articles : ${articles.length}`);
  console.log(`💾 Output File    : ${OUTPUT_FILE}`);
  console.log("=========================================");

} catch (err) {

  console.error("❌ Unable to create content.json");
  console.error(err);

}