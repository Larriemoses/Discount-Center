# 🛍️ Discount Center

**Live Site**: [https://discount-center-p2vm.vercel.app](https://discount-center-p2vm.vercel.app)

A fast, responsive affiliate-based deals and coupon web app built with **Next.js**, designed to help users discover discounts on popular brands like Oraimo, Shopinverse, FundedNext, Maven Trading, and more across Nigeria and other African regions.

---

## ✨ Features

- 🔍 **Search & Filter** deals by brand, category, or keywords
- 🎁 **Dynamic Coupon Listings** with real-time copy-to-clipboard actions
- 🌐 **SEO-optimized pages** using dynamic `<head>` generation
- 📱 **Fully responsive UI** for mobile, tablet, and desktop
- 📊 **Affiliate-ready architecture** with tracking-friendly outbound links
- ⚡ **Fast-loading** using Next.js static generation and incremental builds

---

## 🚀 Tech Stack

| Technology      | Purpose                          |
|-----------------|----------------------------------|
| Next.js         | React framework for web app      |
| TypeScript      | Static typing                    |
| Tailwind CSS    | Utility-first styling            |
| Vercel          | Deployment and hosting           |
| Lucide Icons    | Icon system for UI enhancement   |
| Headless SEO    | SEO tags via `next/head`         |

---

## 📂 Folder Structure

/components → Reusable UI components (Navbar, CouponCard, etc.)
/pages → Next.js routing pages
/public → Static assets like logos
/styles → Global styles and Tailwind config
/utils → Utility functions (slugify, formatPrice)
/lib → External logic or helpers (affiliate logic, etc.)



---

## 📸 Screenshots

| [Home]<img width="1900" height="505" alt="image" src="https://github.com/user-attachments/assets/da34f5ff-0ac6-4f6d-9775-a82e432d8210" /> | [Brand]<img width="1892" height="955" alt="image" src="https://github.com/user-attachments/assets/14df4b51-166a-4264-b899-6baf36db1755" /> |


> _Add actual screenshots to `/public/screens/` and update the image paths above._

---

## 🧠 How It Works

- Clicking a **"Get Coupon"** button copies the coupon code and opens the affiliate link in a new tab.
- Each brand page is statically generated with its own SEO meta tags and slug-based routing.
- Uses `usePageHead()` hook to dynamically update metadata.

---

## 🛠️ Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/discount-center.git

# Navigate into the directory
cd discount-center

# Install dependencies
npm install

# Run the development server
npm run dev

# Open http://localhost:3000 in your browser




