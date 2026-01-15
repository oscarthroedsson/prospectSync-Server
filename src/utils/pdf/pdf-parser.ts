const pdfParse = require("pdf-parse");

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
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
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error}`);
  }
}
