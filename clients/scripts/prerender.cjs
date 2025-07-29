// client/scripts/prerender.js

const { chromium } = require("playwright-chromium");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// --- Configuration ---
// IMPORTANT: Replace with your actual backend API URL
const BACKEND_API_URL = "https://discount-center.onrender.com/api";
// IMPORTANT: Replace with your actual frontend domain
const FRONTEND_BASE_URL = "https://discountcenterstores.com";
// The directory where your built React app and pre-rendered HTML will go
const BUILD_DIR = path.resolve(__dirname, "../dist"); // Assumes script is in client/scripts/ and build is in client/dist/

// Define the routes you want to prerender.
// Start with static routes, then add dynamic ones.
const routesToPrerender = [
  "/",
  "/about",
  "/contact",
  "/stores",
  "/products",
  "/privacy-policy",
  "/terms-of-service",
  // Add any other static routes your app has
];

// --- Main Prerendering Function ---
async function prerender() {
  let browser;
  try {
    // 1. Fetch dynamic routes from your backend
    console.log("Fetching dynamic product and store slugs from backend...");
    const productsResponse = await axios.get(`${BACKEND_API_URL}/products`);
    const products = productsResponse.data.data; // Adjust based on your API response structure
    const storesResponse = await axios.get(`${BACKEND_API_URL}/stores`);
    const stores = storesResponse.data.data; // Adjust based on your API response structure

    // Add dynamic product paths
    products.forEach((product) => {
      if (product.slug) {
        routesToPrerender.push(`/products/${product.slug}`);
      }
    });

    // Add dynamic store paths
    stores.forEach((store) => {
      if (store.slug) {
        routesToPrerender.push(`/stores/${store.slug}`);
      }
    });

    console.log(`Found ${routesToPrerender.length} routes to prerender.`);

    // 2. Launch headless browser
    browser = await chromium.launch();
    const page = await browser.newPage();

    // Set a default timeout for page navigation and content loading
    page.setDefaultNavigationTimeout(60000); // 60 seconds
    page.setDefaultTimeout(30000); // 30 seconds for other operations

    // Create a set to keep track of already processed paths to avoid duplicates
    const processedPaths = new Set();

    // 3. Iterate through each route and prerender
    for (const routePath of routesToPrerender) {
      // Ensure we only process each unique path once
      if (processedPaths.has(routePath)) {
        console.log(`Skipping duplicate route: ${routePath}`);
        continue;
      }
      processedPaths.add(routePath);

      const fullUrl = `${FRONTEND_BASE_URL}${routePath}`;
      const outputFilePath = path.join(BUILD_DIR, routePath, "index.html");

      console.log(`Prerendering ${fullUrl} to ${outputFilePath}`);

      try {
        await page.goto(fullUrl, { waitUntil: "networkidle" });

        // Optional: Add a small delay to ensure all dynamic content/images load
        // This can be adjusted based on your app's loading behavior
        await page.waitForTimeout(1000); // Wait for 1 second

        const htmlContent = await page.content();

        // Ensure directory exists
        fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
        fs.writeFileSync(outputFilePath, htmlContent);
        console.log(`Successfully saved: ${outputFilePath}`);
      } catch (error) {
        console.error(`Failed to prerender ${fullUrl}:`, error);
        // You might want to log this error and continue, or exit if critical
      }
    }
  } catch (error) {
    console.error("An error occurred during prerendering process:", error);
    process.exit(1); // Exit with an error code
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Execute the prerendering function
prerender();
