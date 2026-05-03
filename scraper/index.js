require("dotenv").config();
const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const axios = require("axios");

puppeteer.use(StealthPlugin());

const app = express();
app.use(express.json());

// ============================================================
// 🔄 PROXY MANAGER
// ============================================================
class ProxyManager {
  constructor() {
    // .env: PROXY_LIST=http://u:p@host:port,http://u:p@host2:port
    // Empty ya missing = direct connection (no proxy)
    this.proxies = (process.env.PROXY_LIST || "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    this.currentIndex = 0;
    this.failedProxies = new Set();

    if (this.proxies.length === 0) {
      console.log("📡 Proxy: DISABLED — direct connection chalegi");
    } else {
      console.log(`📡 Proxy: ENABLED — ${this.proxies.length} proxies loaded`);
      this.proxies.forEach((p, i) => console.log(`   ${i + 1}. ${p}`));
    }
  }

  hasProxies() {
    return this.proxies.length > 0;
  }

  // null return = direct, string return = proxy URL
  getNext() {
    if (!this.hasProxies()) return null;

    const available = this.proxies.filter((p) => !this.failedProxies.has(p));
    if (available.length === 0) {
      console.warn("Sab proxies fail — blacklist reset");
      this.failedProxies.clear();
      return this.proxies[0];
    }

    const proxy = available[this.currentIndex % available.length];
    this.currentIndex++;
    return proxy;
  }

  markFailed(proxy) {
    if (proxy) {
      this.failedProxies.add(proxy);
      console.warn(`Proxy blacklisted: ${proxy}`);
    }
  }

  // [] if no proxy → puppeteer direct connect
  toArgs(proxyUrl) {
    if (!proxyUrl) return [];
    return [`--proxy-server=${proxyUrl}`];
  }

  // {} if no proxy → axios direct connect
  toAxiosConfig(proxyUrl) {
    if (!proxyUrl) return {};
    try {
      const u = new URL(proxyUrl);
      const config = {
        proxy: {
          protocol: u.protocol.replace(":", ""),
          host: u.hostname,
          port: parseInt(u.port),
        },
      };
      if (u.username) {
        config.proxy.auth = { username: u.username, password: u.password };
      }
      return config;
    } catch {
      return {};
    }
  }
}

const proxyManager = new ProxyManager();

// ============================================================
// HUMAN BEHAVIOR ENGINE
// ============================================================
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const chance = (pct) => Math.random() * 100 < pct;

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/110.0.0.0",
];
const randomUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

// Bezier curve mouse move — natural arc, not straight line
async function humanMouseMove(page, fromX, fromY, toX, toY) {
  const steps = rand(20, 40);
  const cp1x = fromX + rand(-100, 100);
  const cp1y = fromY + rand(-100, 100);
  const cp2x = toX + rand(-100, 100);
  const cp2y = toY + rand(-100, 100);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x =
      Math.pow(1 - t, 3) * fromX +
      3 * Math.pow(1 - t, 2) * t * cp1x +
      3 * (1 - t) * Math.pow(t, 2) * cp2x +
      Math.pow(t, 3) * toX;
    const y =
      Math.pow(1 - t, 3) * fromY +
      3 * Math.pow(1 - t, 2) * t * cp1y +
      3 * (1 - t) * Math.pow(t, 2) * cp2y +
      Math.pow(t, 3) * toY;

    await page.mouse.move(Math.round(x), Math.round(y));
    // Slow at edges, fast in middle (natural human movement)
    const speed = i < 5 || i > steps - 5 ? rand(8, 15) : rand(2, 6);
    await sleep(speed);
  }
}

// Random mouse movement anywhere on page
async function randomMouseActivity(page) {
  const vp = page.viewport();
  const w = vp ? vp.width : 1280;
  const h = vp ? vp.height : 800;

  let curX = rand(100, w - 100);
  let curY = rand(100, h - 100);
  const moves = rand(1, 3);

  for (let i = 0; i < moves; i++) {
    const toX = rand(100, w - 100);
    const toY = rand(100, h - 100);
    await humanMouseMove(page, curX, curY, toX, toY);
    await sleep(rand(200, 700));
    curX = toX;
    curY = toY;
  }
}

// Human reading scroll — jaise koi result by result padh raha ho
async function humanReadScroll(page, targetCount) {
  const FEED = 'div[role="feed"]';
  const ITEM = 'div[role="article"]';

  let lastCount = 0;
  let stuckCounter = 0;
  let totalScrolled = 0;

  console.log(`   Scrolling for ${targetCount} items...`);

  while (true) {
    const currentCount = await page.evaluate(
      (sel) => document.querySelectorAll(sel).length,
      ITEM
    );

    console.log(`   Items: ${currentCount}/${targetCount}`);
    if (currentCount >= targetCount) break;

    if (currentCount === lastCount) {
      stuckCounter++;
      if (stuckCounter >= 4) {
        console.log("   No new items — stopping scroll");
        break;
      }
      await sleep(rand(2000, 4000));
    } else {
      stuckCounter = 0;
    }

    lastCount = currentCount;
    const scrollAmt = rand(200, 550);
    totalScrolled += scrollAmt;

    await page.evaluate(
      (amount, feedSel) => {
        const feed = document.querySelector(feedSel);
        if (feed) feed.scrollBy({ top: amount, behavior: "smooth" });
      },
      scrollAmt,
      FEED
    );

    // After every ~5-6 items: longer reading pause
    if (currentCount > 0 && currentCount % 5 === 0) {
      const pause = rand(2500, 5500);
      console.log(`   Reading pause: ${(pause / 1000).toFixed(1)}s`);
      await sleep(pause);
      if (chance(65)) await randomMouseActivity(page);
    } else {
      await sleep(rand(700, 2000));
    }

    // 15% chance: scroll back up a little (re-reading behavior)
    if (chance(15) && totalScrolled > 1000) {
      const upAmt = rand(80, 250);
      await page.evaluate(
        (amount, feedSel) => {
          const feed = document.querySelector(feedSel);
          if (feed) feed.scrollBy({ top: -amount, behavior: "smooth" });
        },
        upAmt,
        FEED
      );
      await sleep(rand(700, 1400));
      // Come back down
      await page.evaluate(
        (amount, feedSel) => {
          const feed = document.querySelector(feedSel);
          if (feed) feed.scrollBy({ top: amount + 150, behavior: "smooth" });
        },
        upAmt,
        FEED
      );
      await sleep(rand(500, 1000));
    }

    // 40% chance: random mouse movement while scrolling
    if (chance(40)) await randomMouseActivity(page);
  }
}

// ============================================================
// WEBSITE DATA EXTRACTOR — matches model fields
// ============================================================
// async function fetchWebsiteData(url, proxyUrl = null) {
//   const data = {
//     email: "Not Available",
//     phone: "Not Available",
//     instagram: null,
//     facebook: null,
//   };

//   if (!url || url === "N/A" || url.includes("google.com")) return data;

//   try {
//     const res = await axios.get(url, {
//       timeout: 8000,
//       headers: {
//         "User-Agent": randomUA(),
//         Accept:
//           "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
//         "Accept-Language": "en-US,en;q=0.5",
//         "Cache-Control": "no-cache",
//         Referer: "https://www.google.com/",
//       },
//       validateStatus: false,
//       maxRedirects: 3,
//       ...proxyManager.toAxiosConfig(proxyUrl),
//     });

//     const html = res.data;

//     // Email — mailto: first, then raw pattern
//     const emailPatterns = [
//       /mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i,
//       /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/,
//     ];
//     const skipWords = [".png", ".jpg", ".gif", ".svg", "example", "domain", "yourname", "sentry", "wix", "schema"];
//     for (const pattern of emailPatterns) {
//       const match = html.match(pattern);
//       if (match) {
//         const email = (match[1] || match[0]).toLowerCase();
//         if (!skipWords.some((s) => email.includes(s))) {
//           data.email = email;
//           break;
//         }
//       }
//     }

//     // Phone — tel: first, then pattern
//     const telMatch = html.match(/tel:([+\d\s\-().]{7,20})/i);
//     if (telMatch) {
//       data.phone = telMatch[1].replace(/\s+/g, " ").trim();
//     } else {
//       const phoneMatch = html.match(
//         /(?:\+?[\d]{1,4}[\s\-.]?)?\(?[\d]{3,5}\)?[\s\-.]?[\d]{3,5}[\s\-.]?[\d]{3,5}/
//       );
//       if (phoneMatch) data.phone = phoneMatch[0].replace(/\s+/g, " ").trim();
//     }

//     // Instagram
//     const igMatch = html.match(
//       /https?:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9._]{2,30}/
//     );
//     if (igMatch) data.instagram = igMatch[0];

//     // Facebook
//     const fbMatch = html.match(
//       /https?:\/\/(?:www\.)?facebook\.com\/[a-zA-Z0-9._\-]{2,60}/
//     );
//     if (fbMatch) data.facebook = fbMatch[0];

//     return data;
//   } catch {
//     return data; // Quietly fail — don't crash the whole scrape
//   }
// }


// new method adedd
async function fetchWebsiteData(url, proxyUrl = null) {
  const data = {
    email: "Not Available",
    phone: "Not Available",
    instagram: null,
    facebook: null,
  };

  if (!url || url === "N/A" || url.includes("google.com")) return data;

  // Multiple pages try karo
  const pagesToTry = [
    url,
    url.replace(/\/$/, "") + "/contact",
    url.replace(/\/$/, "") + "/contact-us",
    url.replace(/\/$/, "") + "/about",
    url.replace(/\/$/, "") + "/about-us",
  ];

  for (const pageUrl of pagesToTry) {
    try {
      const res = await axios.get(pageUrl, {
        timeout: 8000,
        headers: {
          "User-Agent": randomUA(),
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          Referer: "https://www.google.com/",
        },
        validateStatus: false,
        maxRedirects: 3,
        ...proxyManager.toAxiosConfig(proxyUrl),
      });

      const html = res.data;

      // ── EMAIL PATTERNS ──────────────────────────────

      // 1. mailto: link (most reliable)
      const mailtoMatch = html.match(
        /mailto:([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i
      );

      // 2. HTML entity decode → &#64; = @
      const decodedHtml = html
        .replace(/&#64;/g, "@")
        .replace(/&#x40;/g, "@")
        .replace(/\[at\]/gi, "@")
        .replace(/\(at\)/gi, "@")
        .replace(/\s+at\s+/gi, "@")
        .replace(/\[dot\]/gi, ".")
        .replace(/\(dot\)/gi, ".");

      // 3. Raw email pattern
      const rawMatch = decodedHtml.match(
        /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/
      );

      const skipWords = [
        ".png", ".jpg", ".gif", ".svg", ".webp",
        "example", "domain", "yourname", "sentry",
        "wix", "schema", "jquery", "bootstrap",
        "noreply", "no-reply", "donotreply",
      ];

      const emailCandidate = mailtoMatch
        ? mailtoMatch[1].toLowerCase()
        : rawMatch
        ? rawMatch[0].toLowerCase()
        : null;

      if (emailCandidate && !skipWords.some((s) => emailCandidate.includes(s))) {
        data.email = emailCandidate;
      }

      // ── PHONE PATTERNS ───────────────────────────────
      if (data.phone === "Not Available") {
        const telMatch = html.match(/tel:([+\d\s\-(). ]{7,20})/i);
        if (telMatch) {
          data.phone = telMatch[1].replace(/\s+/g, " ").trim();
        } else {
          const phoneMatch = html.match(
            /(?:\+?[\d]{1,4}[\s\-.]?)?\(?[\d]{3,5}\)?[\s\-.]?[\d]{3,5}[\s\-.]?[\d]{3,5}/
          );
          if (phoneMatch) data.phone = phoneMatch[0].replace(/\s+/g, " ").trim();
        }
      }

      // ── SOCIAL LINKS ─────────────────────────────────
      if (!data.instagram) {
        const igMatch = html.match(
          /https?:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9._]{2,30}/
        );
        if (igMatch) data.instagram = igMatch[0];
      }

      if (!data.facebook) {
        const fbMatch = html.match(
          /https?:\/\/(?:www\.)?facebook\.com\/[a-zA-Z0-9._\-]{2,60}/
        );
        if (fbMatch) data.facebook = fbMatch[0];
      }

      // Email mil gayi — baaki pages try karne ki zaroorat nahi
      if (data.email !== "Not Available") break;

    } catch {
      continue; // Page load nahi hua — next try karo
    }

    // Pages ke beech thodi delay
    await sleep(rand(300, 700));
  }

  return data;
}
// new method ends here




// ============================================================
// GOOGLE MAPS SCRAPER CORE
// ============================================================
async function scrapeGoogleMaps(keyword, location, limit) {
  const query = encodeURIComponent(`${keyword} in ${location}`);
  const mapsUrl = `https://www.google.com/maps/search/${query}`;

  const proxy = proxyManager.getNext();
  const ua = randomUA();

  console.log(
    proxy
      ? `Connection: PROXY → ${proxy}`
      : `Connection: DIRECT (no proxy)`
  );

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--disable-features=IsolateOrigins,site-per-process",
      "--lang=en-US,en",
      "--window-size=1366,768",
      ...proxyManager.toArgs(proxy), // Empty array if no proxy = direct
    ],
    ignoreHTTPSErrors: true,
    defaultViewport: null,
  });

  try {
    const page = await browser.newPage();

    // Slightly off-standard viewport (less bot-like)
    await page.setViewport({
      width: rand(1280, 1600),
      height: rand(700, 900),
      deviceScaleFactor: 1,
    });

    await page.setUserAgent(ua);

    // Stealth patches
    await page.evaluateOnNewDocument(() => {
      // Hide webdriver flag
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });

      // Realistic plugin list
      const fakePlugins = [
        { name: "Chrome PDF Plugin", filename: "internal-pdf-viewer", description: "Portable Document Format" },
        { name: "Chrome PDF Viewer", filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai", description: "" },
        { name: "Native Client", filename: "internal-nacl-plugin", description: "" },
      ];
      Object.defineProperty(navigator, "plugins", {
        get: () => Object.assign(fakePlugins, {
          item: (i) => fakePlugins[i],
          namedItem: (n) => fakePlugins.find((p) => p.name === n) || null,
          refresh: () => {},
          length: fakePlugins.length,
        }),
      });

      // Languages
      Object.defineProperty(navigator, "languages", {
        get: () => ["en-US", "en"],
      });

      // Chrome runtime mock
      window.chrome = {
        runtime: { id: undefined },
        loadTimes: () => ({}),
        csi: () => ({}),
        app: {},
      };

      // Hide headless in permissions
      const origQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (params) =>
        params.name === "notifications"
          ? Promise.resolve({ state: Notification.permission })
          : origQuery(params);

      // Canvas noise (fingerprint randomization)
      const origGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        const ctx = origGetContext.call(this, type, ...args);
        if (type === "2d" && ctx) {
          const origFillText = ctx.fillText.bind(ctx);
          ctx.fillText = (text, x, y, ...rest) =>
            origFillText(text, x + Math.random() * 0.05, y + Math.random() * 0.05, ...rest);
        }
        return ctx;
      };
    });

    // Block heavy/tracking resources
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const t = req.resourceType();
      const u = req.url();
      const blockTypes = ["image", "font", "media"];
      const blockDomains = ["doubleclick.net", "googlesyndication", "adservice.google", "google-analytics"];

      if (blockTypes.includes(t) || blockDomains.some((d) => u.includes(d))) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Pre-navigation human delay
    await sleep(rand(1200, 3500));

    console.log("   Opening Google Maps...");
    await page.goto(mapsUrl, { waitUntil: "domcontentloaded", timeout: 35000 });

    // Cookie consent (if any)
    try {
      await page.waitForSelector('button[aria-label*="Accept"]', { timeout: 3000 });
      await sleep(rand(400, 900));
      await page.click('button[aria-label*="Accept"]');
      console.log("   Cookie consent accepted");
      await sleep(rand(500, 1000));
    } catch {}

    // Wait for results
    try {
      await page.waitForSelector('div[role="article"]', { timeout: 22000 });
    } catch {
      throw new Error("Results load nahi hue — CAPTCHA ya ban possible");
    }

    await sleep(rand(1500, 3000));
    console.log("   Page loaded — starting scroll");

    // Initial mouse wander (user dekh raha hai page)
    await randomMouseActivity(page);

    // Human scroll to load all items
    await humanReadScroll(page, limit);

    // DOM extraction
    const rawLeads = await page.evaluate((limit) => {
      const items = Array.from(
        document.querySelectorAll('div[role="article"]')
      ).slice(0, limit);

      return items.map((el) => {
        const name =
          el.querySelector(".fontHeadlineSmall")?.innerText?.trim() ||
          el.querySelector('[class*="qBF1Pd"]')?.innerText?.trim() ||
          "N/A";

        const website =
          el.querySelector('a[data-value="Website"]')?.href || "N/A";

        const ratingLabel =
          el.querySelector(".MW4Y7e")?.getAttribute("aria-label") || "";
        const ratingNums = ratingLabel.match(/[\d.]+/g);
        const rating = ratingNums?.[0] || "0";
        const review_count = ratingNums?.[1] || "0";

        const category =
          el.querySelector(".W4Efsd span")?.innerText?.trim() || "Business";

        const fullText = el.innerText || "";
        const lines = fullText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        const phoneMatch = fullText.match(/(\+?[\d][\d\s\-(). ]{7,18}\d)/);
        const mapPhone = phoneMatch ? phoneMatch[0].trim() : null;

        const address =
          lines.find(
            (l) =>
              l.includes(",") &&
              l.length > 8 &&
              !l.includes("★") &&
              !/^\d+\.\d+$/.test(l)
          ) || "N/A";

        // Google Maps direct link
        const linkEl = el.querySelector('a[href*="maps.google"]') ||
          el.querySelector('a[data-value]');
        const link = linkEl?.href || null;

        return { name, website, rating, review_count, category, mapPhone, address, link };
      });
    }, limit);

    console.log(`   Extracted ${rawLeads.length} listings from DOM`);
    await browser.close();

    return { leads: rawLeads, proxy };
  } catch (error) {
    proxyManager.markFailed(proxy);
    await browser.close();
    throw error;
  }
}

// ============================================================
// EXPRESS API
// ============================================================
app.post("/scrape", async (req, res) => {
  const { keyword, location, limit = 10 } = req.body;

  if (!keyword || !location) {
    return res.status(400).json({
      status: "error",
      message: "keyword aur location required hain",
    });
  }

  const safeLimit = Math.min(parseInt(limit) || 10, 500);

  console.log(`\n${"=".repeat(55)}`);
  console.log(`SCRAPE: "${keyword}" in "${location}" | limit: ${safeLimit}`);
  console.log(`${"=".repeat(55)}`);

  try {
    // Step 1 — Maps scrape
    const { leads, proxy } = await scrapeGoogleMaps(keyword, location, safeLimit);

    console.log(`\nFetching website data for ${leads.length} listings...`);

    // Step 2 — Website data with controlled concurrency
    const CONCURRENCY = 3;
    const finalResults = [];

    for (let i = 0; i < leads.length; i += CONCURRENCY) {
      const batch = leads.slice(i, i + CONCURRENCY);

      const batchResults = await Promise.all(
        batch.map(async (item, bIdx) => {
          // Staggered requests within batch — not all at once
          await sleep(bIdx * rand(200, 600));

          let webData = {
            email: "Not Available",
            phone: "Not Available",
            instagram: null,
            facebook: null,
          };

          if (item.website !== "N/A") {
            webData = await fetchWebsiteData(item.website, proxy);
          }

          // Return object matching ScrapeResult $fillable exactly
          return {
            name          : item.name,
            category      : item.category,
            email         : webData.email,
            phone         : item.mapPhone || webData.phone,
            address       : item.address,
            city          : "",        // ScrapeJob fills from location
            country       : "",        // ScrapeJob fills from location
            website       : item.website,
            rating        : parseFloat(item.rating) || 0,
            review_count  : parseInt(item.review_count) || 0,
            working_hours : null,
            instagram     : webData.instagram,
            facebook      : webData.facebook,
            link          : item.link || item.website || "N/A",
          };
        })
      );

      finalResults.push(...batchResults);
      console.log(`   Batch ${Math.floor(i / CONCURRENCY) + 1}: ${finalResults.length}/${leads.length} done`);

      // Gap between batches
      if (i + CONCURRENCY < leads.length) {
        await sleep(rand(400, 1200));
      }
    }

    console.log(`\nDONE: ${finalResults.length} results`);
    console.log(`${"=".repeat(55)}\n`);

    res.json({
      status : "success",
      count  : finalResults.length,
      results: finalResults,
    });
  } catch (error) {
    console.error(`FAILED: ${error.message}`);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status        : "ok",
    proxy_mode    : proxyManager.hasProxies() ? "enabled" : "disabled",
    total_proxies : proxyManager.proxies.length,
    failed_proxies: proxyManager.failedProxies.size,
    uptime_seconds: Math.floor(process.uptime()),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n${"=".repeat(55)}`);
  console.log(`Google Maps Scraper running on port ${PORT}`);
  console.log(`${"=".repeat(55)}\n`);
});