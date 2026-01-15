"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveDOM = retrieveDOM;
exports.extractText = extractText;
exports.getTagContent = getTagContent;
const puppeteer_1 = __importDefault(require("puppeteer"));
const cheerio = __importStar(require("cheerio"));
async function retrieveDOM(url, waitSeconds = 3) {
    const browser = await puppeteer_1.default.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
        const page = await browser.newPage();
        // Navigate to URL
        await page.goto(url, { waitUntil: "networkidle2" });
        // Wait for body to be visible
        await page.waitForSelector("body", { timeout: waitSeconds * 1000 });
        // Wait additional time for JS to load
        await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
        // Get final URL after potential redirects
        const finalURL = page.url();
        console.log(`🔗 Final URL: ${finalURL}`);
        // Get HTML content
        const htmlContent = await page.content();
        return htmlContent;
    }
    finally {
        await browser.close();
    }
}
function extractText(htmlContent) {
    const $ = cheerio.load(htmlContent);
    // Remove script, style, noscript, iframe, svg
    $("script, style, noscript, iframe, svg").remove();
    // Extract text
    const text = $("body").text();
    // Clean up text
    const cleanedText = cleanUpText(text);
    console.log(`📝 Text length AFTER cleanup: ${cleanedText.length}`);
    console.log(`📝 First 500 chars AFTER cleanup: ${cleanedText.substring(0, 500)}`);
    return cleanedText;
}
function cleanUpText(text) {
    // Remove extra whitespace
    text = text.replace(/\s+/g, " ");
    // Remove empty lines
    text = text.replace(/^\s*$/gm, "");
    // Trim and return
    return text.trim();
}
function getTagContent(html, tag) {
    const $ = cheerio.load(html);
    const contents = [];
    $(tag).each((_, element) => {
        const text = $(element).text().trim();
        if (text) {
            contents.push(text);
        }
    });
    return contents;
}
//# sourceMappingURL=web-scraper.js.map