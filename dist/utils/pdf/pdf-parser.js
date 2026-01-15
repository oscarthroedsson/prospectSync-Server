"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromPDF = extractTextFromPDF;
const pdfParse = require("pdf-parse");
async function extractTextFromPDF(buffer) {
    try {
        const data = await pdfParse(buffer);
        // Combine all pages with page breaks
        let fullText = "";
        const numPages = data.numpages;
        // pdf-parse already extracts all text, but we can add page breaks for clarity
        for (let i = 1; i <= numPages; i++) {
            // Note: pdf-parse doesn't provide per-page extraction easily
            // So we'll just return the full text with page markers if needed
            if (i > 1) {
                fullText += "\n\n--- PAGE BREAK ---\n\n";
            }
        }
        fullText += data.text;
        return fullText;
    }
    catch (error) {
        throw new Error(`Failed to parse PDF: ${error}`);
    }
}
//# sourceMappingURL=pdf-parser.js.map