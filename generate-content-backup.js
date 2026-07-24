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

  if (text.includes("nasa")) return "NASA";

  if (text.includes("isro")) return "ISRO";

  if (text.includes("black hole")) return "Black Holes";

  if (text.includes("planet")) return "Planets";

  if (text.includes("moon")) return "Moon";

  if (text.includes("mars")) return "Mars";

  if (text.includes("galaxy")) return "Galaxies";

  if (text.includes("star")) return "Stars";

  if (text.includes("astronomy")) return "Astronomy";

  if (text.includes("cosmology")) return "Cosmology";

  if (text.includes("universe")) return "Universe";

  return DEFAULT_CATEGORY;
}

/* ==========================================================
   Image Extraction
========================================================== */

function detectImage(html) {
  let img =
    match(html, /<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
    match(html, /<img[^>]*src="([^"]+)"/i);

  if (!img) return DEFAULT_IMAGE;

  img = img.replace(/^https?:\/\/[^/]+\//, "");

  return img;
}

/* ==========================================================
   Meta Extraction
========================================================== */

function extractMeta(html, filename) {
  const title =
    match(html, /<title>(.*?)<\/title>/i) ||
    filename.replace(".html", "");

  const description = match(
    html,
    /<meta\s+name="description"\s+content="([^"]+)"/i
  );

  const keywords = match(
    html,
    /<meta\s+name="keywords"\s+content="([^"]+)"/i
  );

  const author =
    match(
      html,
      /<meta\s+name="author"\s+content="([^"]+)"/i
    ) || DEFAULT_AUTHOR;

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

    description: meta.description,

    excerpt,

    keywords: meta.keywords,

    author: meta.author,

    category,

    image,

    url: `articles/${file}`,

    canonical:
      SITE_URL + "articles/" + file,

    readingTime: readingTime(meta.body),

    featured: false,

    published: "",

    lastModified: "",

    tags: meta.keywords
      ? meta.keywords
          .split(",")
          .map(tag => tag.trim())
          .filter(Boolean)
      : []

  };

  articles.push(article);

}

/* ==========================================================
   Sort Articles
========================================================== */

articles.sort((a, b) =>
  a.title.localeCompare(b.title)
);

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