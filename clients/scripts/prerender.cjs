// client/scripts/prerender.cjs

const { chromium } = require("playwright-chromium");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// --- Configuration ---
// IMPORTANT: Ensure these URLs are correct for your deployed services
const BACKEND_API_URL = "https://discount-center.onrender.com/api"; // Your deployed backend API base URL
const FRONTEND_BASE_URL = "https://discountcenterstores.com"; // Your deployed frontend domain
// The directory where your built React app and pre-rendered HTML will go
const BUILD_DIR = path.resolve(__dirname, "../dist"); // Assumes script is in client/scripts/ and build is in client/dist/

// Define the static routes you want to prerender.
// Dynamic routes will be added after fetching data from the backend.
const routesToPrerender = [
  "/",
  "/about",
  "/contact-us",
  "/stores", // Main store listing page
  "/products", // Main product listing page (if applicable)
  "/privacy-policy",
  "/affiliate-disclosure",
  "/terms-of-use",
  "/submit-store",
  "/today-deals",
  // Add any other static routes your app has
];

// --- Main Prerendering Function ---
async function prerender() {
  let browser;
  try {
    // 1. Fetch dynamic routes (product and store slugs) from your backend
    console.log("Fetching dynamic product and store slugs from backend...");

    // Fetch ALL products from the public endpoint
    const productsResponse = await axios.get(
      `${BACKEND_API_URL}/public/products`
    );
    const products = productsResponse.data.data; // Adjust based on your API response structure

    // Fetch ALL stores from the public endpoint
    const storesResponse = await axios.get(`${BACKEND_API_URL}/stores/public`);
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

    // 2. Launch headless browser with HTTPS error ignoring
    browser = await chromium.launch({
      headless: true, // Run in headless mode (no browser UI)
      // IMPORTANT: Ignore HTTPS errors. Use this if Playwright struggles with your SSL certificate.
      // Only use this in trusted environments (like your build process) for your own site.
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    // Set default timeouts for page navigation and content loading
    page.setDefaultNavigationTimeout(90000); // 90 seconds (increased for robustness)
    page.setDefaultTimeout(45000); // 45 seconds for other operations (increased for robustness)

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
      // Construct output file path: e.g., dist/products/some-slug/index.html
      const outputFilePath = path.join(BUILD_DIR, routePath, "index.html");

      console.log(`Prerendering ${fullUrl} to ${outputFilePath}`);

      try {
        // Navigate to the full URL, waiting until network is idle (all resources loaded)
        await page.goto(fullUrl, { waitUntil: "networkidle" });

        // Optional: Add a small delay to ensure all dynamic content/images load
        // This can be adjusted based on your app's loading behavior.
        // If content appears after JS execution, this can help.
        await page.waitForTimeout(1000); // Wait for 1 second

        // Get the full HTML content of the rendered page
        const htmlContent = await page.content();

        // Ensure the directory structure for the output file exists
        fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
        // Write the rendered HTML content to the file
        fs.writeFileSync(outputFilePath, htmlContent);
        console.log(`Successfully saved: ${outputFilePath}`);
      } catch (error) {
        console.error(`Failed to prerender ${fullUrl}:`, error);
        // Log the error but continue to try other pages,
        // unless you want the build to fail entirely on first error.
      }
    }
  } catch (error) {
    console.error(
      "An unhandled error occurred during the overall prerendering process:",
      error
    );
    process.exit(1); // Exit with an error code to signal build failure
  } finally {
    // Ensure the browser is closed even if errors occur
    if (browser) {
      await browser.close();
    }
  }
}

// Execute the prerendering function
prerender();
