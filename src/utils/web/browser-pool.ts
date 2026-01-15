import puppeteer, { Browser, Page } from "puppeteer";

interface QueueItem {
  url: string;
  options: ScrapeOptions;
  resolve: (value: string) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

export interface ScrapeOptions {
  waitSeconds?: number; // extra render delay
  waitForSelector?: string; // default "body"
  format?: "html" | "text";
  timeoutMs?: number; // navigation timeout
}
/*
👀 If you wan´t to see browser in the local-development

      headless: false,
      slowMo: 80,
      devtools: true,

*/

/**
 * Provide 10 browsers and 5 pages per browsers
 * Which mean 50 active pages in total.
 * ⚠️ Obs always wait little more then you have to in local enviroment more pages = slower
 */
export class BrowserPool {
  private browsers: Browser[] = [];
  private activePages: Map<Browser, Page[]> = new Map();
  private queue: QueueItem[] = [];
  private maxBrowsers: number;
  private browserTimeout: number;
  private idleTimeout: number;
  private maxQueueSize: number;
  private idleTimers: Map<Browser, NodeJS.Timeout> = new Map();

  constructor() {
    this.maxBrowsers = 10;
    this.browserTimeout = 20000;
    this.idleTimeout = 300000;
    this.maxQueueSize = 50;
  }

  private async createBrowser(): Promise<Browser> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    this.activePages.set(browser, []);
    return browser;
  }

  private resetIdleTimer(browser: Browser): void {
    // Clear existing timer
    const existingTimer = this.idleTimers.get(browser);
    if (existingTimer) clearTimeout(existingTimer);

    // Set new timer to close browser after idle timeout
    const timer = setTimeout(async () => {
      await this.closeBrowser(browser);
    }, this.idleTimeout);

    this.idleTimers.set(browser, timer);
  }

  private async closeBrowser(browser: Browser): Promise<void> {
    try {
      const index = this.browsers.indexOf(browser);
      if (index > -1) {
        this.browsers.splice(index, 1);
      }
      this.activePages.delete(browser);
      const timer = this.idleTimers.get(browser);
      if (timer) {
        clearTimeout(timer);
        this.idleTimers.delete(browser);
      }
      await browser.close();
      console.log(`🧹 [BrowserPool] Closed idle browser. Remaining: ${this.browsers.length}`);
    } catch (error) {
      console.error(`❌ [BrowserPool] Error closing browser:`, error);
    }
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) return;

    const browser = await this.acquireBrowser();
    if (!browser) return;

    const item = this.queue.shift();
    if (!item) return;

    clearTimeout(item.timeout);
  }

  // Create or provide a browser
  async acquireBrowser(): Promise<Browser | null> {
    // Find available browser (not at max pages)
    for (const browser of this.browsers) {
      const pages = this.activePages.get(browser) || [];
      // Each browser can handle up to 5 pages
      if (pages.length < 5) return browser;
    }

    // Create new browser if under limit
    if (this.browsers.length < this.maxBrowsers) {
      const browser = await this.createBrowser();
      this.browsers.push(browser);
      this.resetIdleTimer(browser);
      return browser;
    }

    return null;
  }
  async acquirePage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    this.activePages.get(browser)!.push(page);

    this.resetIdleTimer(browser);

    return page;
  }
  /**
   * Will wait def 40 sec for a browser
   * If no browser is provided it will throw an error
   */
  async waitForBrowser(waitInMs: number = this.browserTimeout): Promise<Browser> {
    return new Promise<Browser>(async (resolve, reject) => {
      const start = Date.now();

      const tryAcquire = async () => {
        const browser = await this.acquireBrowser();
        if (browser) return resolve(browser);

        if (Date.now() - start >= waitInMs)
          return reject(
            new Error("Timeout: No browser available", {
              cause: "NO_BROWSER_AVAILABLE",
            })
          );

        // Pröva igen efter lite delay
        setTimeout(tryAcquire, 100);
      };

      tryAcquire();
    });
  }

  async releaseBrowser(browser: Browser, page: Page): Promise<void> {
    const pages = this.activePages.get(browser) || [];
    const index = pages.indexOf(page);
    if (index > -1) {
      pages.splice(index, 1);
      this.activePages.set(browser, pages);
    }

    // Reset idle timer
    this.resetIdleTimer(browser);

    // Process queue if there are pending requests
    this.processQueue();
  }

  async closeAll(): Promise<void> {
    // Clear all idle timers
    for (const timer of this.idleTimers.values()) {
      clearTimeout(timer);
    }
    this.idleTimers.clear();

    // Close all browsers
    const closePromises = this.browsers.map((browser) => this.closeBrowser(browser));
    await Promise.all(closePromises);
    this.browsers = [];
    this.activePages.clear();

    // Reject all queued requests
    for (const item of this.queue) {
      clearTimeout(item.timeout);
      item.reject(new Error("Browser pool closed"));
    }
    this.queue = [];
  }

  getStats() {
    return {
      activeBrowsers: this.browsers.length,
      totalPages: Array.from(this.activePages.values()).reduce((sum, pages) => sum + pages.length, 0),
      queueLength: this.queue.length,
      maxBrowsers: this.maxBrowsers,
      maxQueueSize: this.maxQueueSize,
    };
  }
}

let instance: BrowserPool | null = null;

export function getBrowserPool(): BrowserPool {
  if (!instance) instance = new BrowserPool();
  return instance;
}
