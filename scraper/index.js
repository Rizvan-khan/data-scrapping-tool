const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());

app.post("/scrape", async (req, res) => {
  const { keyword, location } = req.body;
  const searchQuery = encodeURIComponent(`${keyword} in ${location}`);
  const url = `https://www.google.com/maps/search/${searchQuery}`;

  const browser = await puppeteer.launch({ 
    headless: "new", 
    args: ["--no-sandbox"] 
  });
  
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector("div[role='article']", { timeout: 10000 });

    // Quick Scroll for results
    await page.evaluate(async () => {
      const feed = document.querySelector("div[role='feed']");
      if (feed) {
        for (let i = 0; i < 4; i++) { 
          feed.scrollBy(0, 1000);
          await new Promise(r => setTimeout(r, 700));
        }
      }
    });

    const data = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll("div[role='article']"));
      
      return items.map(el => {
        const name = el.querySelector(".fontHeadlineSmall")?.innerText.trim() || "N/A";
        const ratingElement = el.querySelector(".MW4Y7e")?.ariaLabel;
        const allTextParts = el.innerText.split('\n').map(t => t.trim()).filter(t => t.length > 0);
        
        // Regex for Clean Phone Number
        const phoneMatch = el.innerText.match(/(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}/);

        return {
          business_info: {
            title: name,
            category: allTextParts[2] || "Business", // Usually category is 3rd line
            link: el.querySelector("a")?.href || "N/A"
          },
          metrics: {
            rating: ratingElement ? ratingElement.split(" ")[0] : "0",
            total_reviews: ratingElement ? ratingElement.split(" ")[2].replace(/,/g, '') : "0"
          },
          contact_details: {
            phone: phoneMatch ? phoneMatch[0].replace(/\s/g, '') : "Not Available",
            address: allTextParts.find(t => t.includes(",") || t.includes("Bareilly")) || "N/A"
          }
        };
      });
    });

    await browser.close();

    // Clean JSON Response
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({
      status: "success",
      total_found: data.length,
      search_query: `${keyword} in ${location}`,
      results: data
    }, null, 2)); // 'null, 2' se JSON readable format mein aayega

  } catch (error) {
    if (browser) await browser.close();
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(3000, () => console.log("JSON Scraper running on http://localhost:3000"));