import { Browser, Page } from "puppeteer-core";
import { getBrowserPool } from "../../utils/web/browser-pool";
export interface ScrapeOptions {
  waitSeconds?: number; // extra render delay
  waitForSelector?: string; // default "body"
  format?: "html" | "text";
  timeoutMs?: number; // navigation timeout
}

export class WebScraperService {
  private pool = getBrowserPool();

  async scrape(url: string, options: ScrapeOptions): Promise<string> {
    let page: Page | null = null;
    let browser: Browser | null = null;
    try {
      browser = await this.pool.waitForBrowser();
      const { waitSeconds = 2, waitForSelector = "body", format = "html", timeoutMs = 20000 } = options;
      page = await browser.newPage();
      //                                                         20 sec
      await page.goto(url, { waitUntil: "networkidle2", timeout: timeoutMs });

      /**
       * waitForSelector waits for the selector not the content inside of it
       * that is why we set a promise with timeout after to give the content a little time.
       */
      await page.waitForSelector(waitForSelector);
      await new Promise((res) => setTimeout(res, waitSeconds * 1000));

      const result: string =
        format === "text" ? ((await page.evaluate("document.body.innerText")) as string) : await page.content();

      await page.close();
      return result;
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "options" in err &&
        (err as any).options?.cause === "NO_BROWSER_AVAILABLE"
      ) {
        throw new Error("To many are importing data, try again in a few min");
      }
      throw err;
    } finally {
      if (page && browser) await this.pool.releaseBrowser(browser, page);
    }
  }
}
