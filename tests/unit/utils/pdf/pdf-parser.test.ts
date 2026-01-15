import { extractTextFromPDF } from "../../../../src/utils/pdf/pdf-parser";

jest.mock("pdf-parse", () => {
  return jest.fn();
});

const pdfParse = require("pdf-parse");

describe("PDF Parser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("extractTextFromPDF", () => {
    it("should extract text from PDF buffer", async () => {
      const mockBuffer = Buffer.from("test pdf content");
      const mockData = {
        text: "Extracted text from PDF",
        numpages: 1,
      };

      pdfParse.mockResolvedValue(mockData);

      const result = await extractTextFromPDF(mockBuffer);

      expect(pdfParse).toHaveBeenCalledWith(mockBuffer);
      expect(result).toBe("Extracted text from PDF");
    });

    it("should handle multi-page documents", async () => {
      const mockBuffer = Buffer.from("test pdf");
      const mockData = {
        text: "Page 1 content\n\nPage 2 content",
        numpages: 2,
      };

      pdfParse.mockResolvedValue(mockData);

      const result = await extractTextFromPDF(mockBuffer);

      expect(result).toContain("Page 1 content");
      expect(result).toContain("Page 2 content");
      // Should include page break markers for pages > 1
      expect(result).toContain("--- PAGE BREAK ---");
    });

    it("should throw error for invalid PDF", async () => {
      const mockBuffer = Buffer.from("invalid pdf");
      const error = new Error("Invalid PDF format");

      pdfParse.mockRejectedValue(error);

      await expect(extractTextFromPDF(mockBuffer)).rejects.toThrow(
        "Failed to parse PDF:"
      );
    });

    it("should handle empty PDF", async () => {
      const mockBuffer = Buffer.from("");
      const mockData = {
        text: "",
        numpages: 0,
      };

      pdfParse.mockResolvedValue(mockData);

      const result = await extractTextFromPDF(mockBuffer);

      expect(result).toBe("");
    });
  });
});
