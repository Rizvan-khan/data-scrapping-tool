const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());

app.post("/scrape", async (req, res) => {
  const { keyword, location, limit = 50 } = req.body;

  const maxLimit = Math.min(limit, 100);

  if (!keyword || !location) {
    return res.status(400).json({ status: "error", message: "Missing params" });
  }

  const searchQuery = encodeURIComponent(`${keyword} in ${location}`);
  const url = `https://www.google.com/maps/search/${searchQuery}`;

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded" });

    await page.waitForSelector("div[role='article']", { timeout: 15000 });

    // 🔥 Smart scroll
    await page.evaluate(async (maxLimit) => {
      const feed = document.querySelector("div[role='feed']");
      if (!feed) return;

      let lastCount = 0;

      while (true) {
        feed.scrollBy(0, 1500);
        await new Promise(r => setTimeout(r, 700));

        const currentCount = feed.querySelectorAll("div[role='article']").length;

        if (currentCount >= maxLimit) break;
        if (currentCount === lastCount) break;

        lastCount = currentCount;
      }
    }, maxLimit);

    const data = await page.evaluate((maxLimit) => {
      const items = Array.from(document.querySelectorAll("div[role='article']"));

      return items.slice(0, maxLimit).map(el => {
        const name = el.querySelector(".fontHeadlineSmall")?.innerText.trim() || "N/A";
        const ratingElement = el.querySelector(".MW4Y7e")?.ariaLabel;
        const allTextParts = el.innerText.split('\n').map(t => t.trim()).filter(t => t);

        const phoneMatch = el.innerText.match(/(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}/);

        return {
          business_info: {
            title: name,
            category: allTextParts[2] || "Business",
            link: el.querySelector("a")?.href || "N/A"
          },
          metrics: {
            rating: ratingElement ? ratingElement.split(" ")[0] : "0",
            total_reviews: ratingElement ? ratingElement.split(" ")[2]?.replace(/,/g, '') : "0"
          },
          contact_details: {
            phone: phoneMatch ? phoneMatch[0].replace(/\s/g, '') : "Not Available",
            address: allTextParts.find(t => t.includes(",")) || "N/A"
          }
        };
      });
    }, maxLimit);

    await browser.close();

    return res.json({
      status: "success",
      total_found: data.length,
      results: data
    });

  } catch (error) {
    if (browser) await browser.close();

    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://127.0.0.1:3000");
});