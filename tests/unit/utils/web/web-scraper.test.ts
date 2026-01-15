import { retrieveDOM, extractText, getTagContent } from "../../../../src/utils/web/web-scraper";
import { sampleHTML } from "../../../helpers/fixtures";

// Mock puppeteer
jest.mock("puppeteer", () => ({
  launch: jest.fn(),
}));

// Mock cheerio
jest.mock("cheerio", () => {
  const cheerio = jest.requireActual("cheerio");
  return cheerio;
});

const puppeteer = require("puppeteer");

describe("Web Scraper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("retrieveDOM", () => {
    it("should retrieve HTML content from URL", async () => {
      const mockPage = {
        goto: jest.fn().mockResolvedValue(undefined),
        waitForSelector: jest.fn().mockResolvedValue(undefined),
        url: jest.fn().mockReturnValue("https://example.com/job"),
        content: jest.fn().mockResolvedValue(sampleHTML),
      };

      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue(mockPage),
        close: jest.fn().mockResolvedValue(undefined),
      };

      puppeteer.launch.mockResolvedValue(mockBrowser);

      const result = await retrieveDOM("https://example.com/job", 3);

      expect(puppeteer.launch).toHaveBeenCalledWith({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      expect(mockPage.goto).toHaveBeenCalledWith("https://example.com/job", {
        waitUntil: "networkidle2",
      });

      expect(mockPage.waitForSelector).toHaveBeenCalledWith("body", {
        timeout: 3000,
      });

      expect(result).toBe(sampleHTML);
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      const mockBrowser = {
        newPage: jest.fn().mockRejectedValue(new Error("Navigation failed")),
        close: jest.fn().mockResolvedValue(undefined),
      };

      puppeteer.launch.mockResolvedValue(mockBrowser);

      await expect(retrieveDOM("https://example.com/invalid", 3)).rejects.toThrow();
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });

  describe("extractText", () => {
    it("should extract and clean text from HTML", () => {
      const html = `
        <html>
          <head><title>Test</title></head>
          <body>
            <h1>Title</h1>
            <p>Paragraph text</p>
            <script>console.log('test');</script>
            <style>.test { color: red; }</style>
          </body>
        </html>
      `;

      const result = extractText(html);

      expect(result).toContain("Title");
      expect(result).toContain("Paragraph text");
      // Script and style should be removed
      expect(result).not.toContain("console.log");
      expect(result).not.toContain(".test");
    });

    it("should clean up whitespace", () => {
      const html = `
        <body>
          <p>Text   with    multiple    spaces</p>
          <p>More    text</p>
        </body>
      `;

      const result = extractText(html);

      // Should normalize whitespace
      expect(result).not.toContain("   ");
    });

    it("should handle empty HTML", () => {
      const result = extractText("<body></body>");
      expect(result.trim()).toBe("");
    });
  });

  describe("getTagContent", () => {
    it("should extract content from specific tags", () => {
      const html = `
        <body>
          <h1>Title 1</h1>
          <h1>Title 2</h1>
          <p>Paragraph</p>
        </body>
      `;

      const result = getTagContent(html, "h1");

      expect(result).toHaveLength(2);
      expect(result[0]).toBe("Title 1");
      expect(result[1]).toBe("Title 2");
    });

    it("should return empty array when no tags found", () => {
      const html = "<body><p>Text</p></body>";

      const result = getTagContent(html, "h1");

      expect(result).toEqual([]);
    });

    it("should filter out empty content", () => {
      const html = `
        <body>
          <p>Text</p>
          <p></p>
          <p>More text</p>
        </body>
      `;

      const result = getTagContent(html, "p");

      expect(result).toHaveLength(2);
      expect(result).not.toContain("");
    });
  });
});
