# 🚀 Data Scraping Tool (Apify-lite Clone)

A full-stack web application designed to scrape business data (e.g., gyms, salons, restaurants) based on user-defined keywords and locations. The tool collects structured data from Google Maps and presents it in a user-friendly dashboard with export capabilities.

---

# 📌 Overview

This project allows users to:

* Search for businesses using a keyword (e.g., "Gym")
* Specify a location (e.g., "Bareilly")
* Define the number of results to extract
* View scraped data in real-time
* Export results to Excel
* Store data in a database for future use

---

# 🧠 Key Features

## 🔍 Smart Search

* Keyword-based scraping (Gym, Salon, Restaurant, etc.)
* Location-based filtering (city, custom input)
* Result limit control

## 📊 Data Extraction

* Business Name
* Phone Number
* Address
* Website URL
* Rating
* Social Media Links (if available)

> ⚠️ Note: Email extraction requires additional scraping from business websites.

---

## 📥 Data Management

* Store scraped data in MySQL database
* View previous results in dashboard
* Export data to Excel (.xlsx)

---

## ⚙️ Background Processing

* Queue-based scraping (non-blocking)
* Job status handling (Pending, Running, Completed)
* Retry mechanism for failed jobs

---

## 🔐 Authentication & User System

* User Registration & Login
* Secure API access
* User-specific data tracking

---

## ⏰ Automation (Optional)

* Scheduled scraping via cron jobs
* Daily/weekly automated data collection

---

# 🏗️ Tech Stack

## 🎨 Frontend

* React.js
* Axios (API calls)

## 🧠 Backend

* Laravel (API, Authentication, Queue, Cron Jobs)

## 🤖 Scraping Engine

* Node.js
* Puppeteer (Headless browser automation)

## 🗄️ Database

* MySQL

## ⚡ Queue System

* Laravel Queue (Database / Redis)

---

# 🧩 System Architecture

```
React (Frontend)
     ↓
Laravel API (Auth + Queue + DB)
     ↓
Queue Job
     ↓
Node.js Scraper (Puppeteer)
     ↓
Laravel DB Storage
     ↓
React Dashboard & Excel Export
```

---

# 🔄 Workflow

1. User submits search form (keyword, location, result limit)
2. Laravel API receives request
3. Scraping job is dispatched to queue
4. Node.js scraper processes the request
5. Data is extracted from Google Maps
6. Laravel stores data in MySQL
7. User views results in dashboard or downloads Excel

---

# 📁 Project Structure

```
data-scraper-tool/
│
├── frontend/   (React App)
├── backend/    (Laravel API)
├── scraper/    (Node.js Scraper)
```

---

# ⚠️ Limitations

* Some websites may block scraping requests
* CAPTCHA challenges may occur
* Email data is not directly available from Google Maps
* Frequent selector changes may require maintenance

---

# 🔐 Best Practices

* Use proxy rotation to avoid IP blocking
* Implement delays to mimic human behavior
* Handle errors and retries gracefully
* Log scraping activities for debugging

---

# 💰 Use Cases

* Lead generation for businesses
* Market research and competitor analysis
* Local business directory creation
* Data collection for marketing campaigns

---

# 🚀 Future Enhancements

* Multi-platform scraping (LinkedIn, Instagram, Facebook)
* Credit-based user system (SaaS monetization)
* Advanced filtering and search
* Real-time scraping status updates
* API access for external integrations

---

# 🤝 Contribution

Feel free to fork, improve, and contribute to this project. Suggestions and improvements are always welcome!

---

# 📄 License

This project is for educational and development purposes. Ensure compliance with website terms before scraping data.

---

