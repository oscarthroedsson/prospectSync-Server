// Legacy web scraper utilities
// Note: Consider migrating to WebScraperService in services/web-scrape/

export async function retrieveDOM(_url: string, _timeout?: number): Promise<string> {
  // Stub implementation - consider using WebScraperService instead
  throw new Error("retrieveDOM is deprecated. Use WebScraperService instead.");
}

export function extractText(_html: string): string {
  // Stub implementation - consider using WebScraperService instead
  throw new Error("extractText is deprecated. Use WebScraperService instead.");
}

export function getTagContent(_html: string, _tag: string): string[] {
  // Stub implementation
  throw new Error("getTagContent is deprecated. Use WebScraperService instead.");
}
