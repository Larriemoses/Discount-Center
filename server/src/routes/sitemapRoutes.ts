// backend/src/routes/sitemapRoutes.ts (or add to an existing route file)
import express from "express";
import { SitemapStream, streamToPromise } from "sitemap";
import { createGzip } from "zlib";

// Assuming you have Product and Store models imported
import Product from "../models/Product";
import Store from "../models/Store";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  res.header("Content-Type", "application/xml");
  res.header("Content-Encoding", "gzip");

  // Base URL of your frontend
  const frontendBaseUrl = "https://discountcenterstores.com"; // IMPORTANT: Your actual domain

  try {
    const smStream = new SitemapStream({ hostname: frontendBaseUrl });
    const pipeline = smStream.pipe(createGzip());

    // Add static pages
    smStream.write({ url: "/", changefreq: "daily", priority: 1.0 });
    smStream.write({ url: "/about", changefreq: "monthly", priority: 0.8 });
    smStream.write({ url: "/contact", changefreq: "monthly", priority: 0.8 });
    smStream.write({ url: "/stores", changefreq: "daily", priority: 0.9 });
    smStream.write({ url: "/products", changefreq: "daily", priority: 0.9 });
    smStream.write({
      url: "/privacy-policy",
      changefreq: "monthly",
      priority: 0.7,
    });
    smStream.write({
      url: "/terms-of-service",
      changefreq: "monthly",
      priority: 0.7,
    });
    // Add any other static routes you have

    // Add dynamic product pages
    const products = await Product.find().select("slug lastDailyReset"); // Fetch only necessary fields
    products.forEach((product) => {
      smStream.write({
        url: `/products/${product.slug}`,
        changefreq: "daily",
        priority: 0.7,
        lastmod: product.lastDailyReset
          ? product.lastDailyReset.toISOString()
          : new Date().toISOString(),
      });
    });

    // Add dynamic store pages
    const stores = await Store.find().select("slug"); // Fetch only necessary fields
    stores.forEach((store) => {
      smStream.write({
        url: `/stores/${store.slug}`,
        changefreq: "daily",
        priority: 0.7,
        // You might add a lastmod based on store update time if available
      });
    });

    smStream.end();

    // Stream sitemap to response
    streamToPromise(pipeline).then((data) => {
      res.send(data);
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
