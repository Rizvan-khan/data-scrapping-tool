const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const axios = require("axios");

puppeteer.use(StealthPlugin());

const app = express();
app.use(express.json());

// --- ⚡ Smart Extractor (Email + Phone from Website) ---
async function fetchExtraData(url) {
    const data = { email: "Not Available", phone: "Not Available" };
    if (!url || url === "N/A" || url.includes("google.com")) return data;

    try {
        const res = await axios.get(url, { 
            timeout: 5000, 
            headers: { 'User-Agent': 'Mozilla/5.0' },
            validateStatus: false 
        });
        const html = res.data;

        // Email Match
        const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) data.email = emailMatch[0].toLowerCase();

        // Phone Match (Agar website par mile)
        const phoneMatch = html.match(/(?:\+?\d{1,3}[- ]?)?\(?\d{3,5}\)?[- ]?\d{3,5}[- ]?\d{4}/);
        if (phoneMatch) data.phone = phoneMatch[0].trim();

        return data;
    } catch { return data; }
}

app.post("/scrape", async (req, res) => {
    const { keyword, location, limit = 10 } = req.body;
    const searchQuery = encodeURIComponent(`${keyword} in ${location}`);
    const url = `https://www.google.com/maps/search/${searchQuery}`;

    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    });

    try {
        const page = await browser.newPage();
        // Speed Hack: Block CSS and Images
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) req.abort();
            else req.continue();
        });

        await page.goto(url, { waitUntil: "domcontentloaded" });

        // Wait for results
        await page.waitForSelector('div[role="article"]', { timeout: 15000 });

        // Auto-Scroll to get items
        await page.evaluate(async () => {
            const wrapper = document.querySelector('div[role="feed"]');
            if (wrapper) {
                wrapper.scrollBy(0, 1000);
                await new Promise(r => setTimeout(r, 1000));
            }
        });

        const leads = await page.evaluate((limit) => {
            const items = Array.from(document.querySelectorAll('div[role="article"]')).slice(0, limit);
            return items.map(el => {
                const name = el.querySelector(".fontHeadlineSmall")?.innerText || "N/A";
                const website = el.querySelector('a[data-value="Website"]')?.href || "N/A";
                
                // Rating & Reviews (Correct Selectors)
                const ratingText = el.querySelector(".MW4Y7e")?.ariaLabel || "";
                const rating = ratingText.split(" ")[0] || "0";
                const reviews = ratingText.match(/\d+/g)?.[1] || "0";

                // Phone from Map text
                const allText = el.innerText;
                const phoneMatch = allText.match(/(\+?\d{1,4}[\s-])?\d{10,12}/);

                return {
                    name,
                    website,
                    rating,
                    reviews,
                    mapPhone: phoneMatch ? phoneMatch[0] : null,
                    address: allText.split('\n').find(t => t.includes(',')) || "N/A"
                };
            });
        }, limit);

        console.log(`📩 Processing ${leads.length} leads...`);

        // Final Data Merge (Parallel processing)
        const finalResults = await Promise.all(leads.map(async (item) => {
            let extra = { email: "Not Available", phone: "Not Available" };
            
            if (item.website !== "N/A") {
                extra = await fetchExtraData(item.website);
            }

            return {
                name: item.name,
                phone: item.mapPhone || extra.phone, // Map pe nahi mila toh website wala use karo
                email: extra.email,
                rating: item.rating,
                reviews: item.reviews,
                website: item.website,
                address: item.address
            };
        }));

        await browser.close();
        res.json({ status: "success", results: finalResults });

    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ status: "error", message: error.message });
    }
});

app.listen(3000, () => console.log("🚀 Ultra-Fast Hybrid Scraper Ready"));