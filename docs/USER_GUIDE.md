# 📖 AI Textile Waste Intelligence Platform — User Guide

> **Audience:** Recycling Facility Operators, Textile Manufacturers, Sustainability Managers, Administrators  
> **Version:** 1.0 · Milestone 4

---

## 🚀 Getting Started

### Step 1 — Register Your Account

1. Open the platform at **http://localhost:5173**
2. Click **"Register"** on the login page
3. Fill in your **Username**, **Email**, and **Password**
4. Select your **Role** from the dropdown:
   - **Recycling Facility Operator** — manages waste batches and recycling workflows
   - **Textile Manufacturer** — tracks production waste and circular economy insights
   - **Sustainability Manager** — monitors ESG metrics and circularity scoring
   - **Administrator** — full platform access including user management
5. Click **"Create Account"** — you will be redirected to login

### Step 2 — Login

1. Enter your registered **Email** and **Password**
2. Click **"Sign In"**
3. You will land on the **Facility Overview Dashboard**

---

## 🗺 Navigation Overview

The left sidebar gives you access to all platform sections:

| Menu Item | What It Does |
|-----------|--------------|
| **Dashboard** | Live KPI cards + material & condition charts |
| **AI Analysis** | Upload textile images for instant AI scan |
| **Inventory** | Browse, add, edit, and delete waste batch records |
| **Sustainability** | Per-batch circularity scores and circular economy cards |
| **ESG Reports** | CO₂, water, energy, and landfill impact metrics |
| **Recycling Opportunities** | Recommended recycling strategies |

---

## 🧠 Core Workflow: Scan → Analyze → Export

### 1️⃣ Upload a Textile Image (Single Scan)

1. Click **"AI Analysis"** in the sidebar
2. Ensure **"Single Image"** tab is selected
3. Drag and drop a textile image onto the upload zone, **or** click to browse
   - Supported formats: **JPG, PNG, WebP**
   - The image preview will appear immediately
4. Click **"Analyze Textile"**
5. The AI engine will process the image in 2–5 seconds and display:

| Result | Description |
|--------|-------------|
| **Detected Material** | Fabric type (Cotton, Polyester, Denim, etc.) |
| **Confidence Score** | AI model certainty (0–100%) shown as a circular gauge |
| **Physical Condition** | Good / Torn+Damaged / Stained+Flawed |
| **Detected Defect** | Specific defect type (Hole, Stain, Broken Stitch, etc.) |
| **Circularity Score** | Overall recyclability score (0–100) |
| **Recovery Category** | Excellent / High / Moderate / Limited / Disposal Recommended |
| **Recommended Strategy** | Direct Reuse, Mechanical Recycling, Chemical Recycling, etc. |
| **Score Breakdown** | 5-factor weighted model visualized as progress bars |
| **Environmental Impact** | CO₂ saved (kg), Water saved (L), Energy saved (kWh) |

6. Click **"📥 Download PDF Report"** to save a branded PDF of the scan result

---

### 2️⃣ Batch Image Analysis (Multiple Images)

1. Click **"AI Analysis"** → select the **"Batch Analysis"** tab
2. Drag and drop **up to 20 images** onto the batch upload zone
3. A file chip list will appear showing filenames and sizes
4. Click **"Analyze Batch (N images)"**
5. The AI processes each image **sequentially** — a live progress bar tracks completion
6. Results stream in as cards — each showing material, confidence badge, circularity mini-bar, and strategy
7. A **success toast** fires when all images are processed

> **Tip:** Batch mode is ideal for processing entire shipment lots. Each result is automatically saved to the Inventory database.

---

### 3️⃣ Inventory Management

1. Click **"Inventory"** in the sidebar
2. Browse all logged textile waste batches in a sortable table
3. To add a batch manually:
   - Fill in: Fabric Type, Source, Quantity (kg), Color, Condition
   - Click **"Add Item"**
4. To edit or delete an existing entry, use the action buttons in the table row
5. Each entry stores: Batch ID, Collection Date, Circularity Score, ESG metrics, AI Strategy

---

### 4️⃣ Sustainability & ESG Insights

#### Sustainability Manager Page
1. Click **"Sustainability"** in the sidebar
2. View the **Stats Bar**: Total Batches, Average Circularity Score, High Recovery count, Low Priority count
3. Use the **search bar** to filter by fabric type, category, or batch ID
4. Sort by: Score High→Low, Score Low→High, Batch ID, or Fabric Type A–Z
5. Each card shows: Fabric type, condition badge, source, quantity, circularity score bar, recovery category
6. Click **"Export PDF"** to download a landscape PDF report of all cards

#### ESG Reports Page
1. Click **"ESG Reports"** in the sidebar
2. View four KPI cards: **CO₂ Saved**, **Water Conserved**, **Energy Recovered**, **Landfill Diverted**
3. The **Overall Circularity Score** panel shows the weighted average across all inventory
4. A toast notification fires automatically on load showing the latest data status
5. Click **"Export ESG Report (PDF)"** to download a branded sustainability PDF

---

### 5️⃣ Dashboard Export (PDF & Excel)

1. Click **"Dashboard"** in the sidebar
2. Review live KPI cards and Chart.js visualizations:
   - **Material Distribution** — Pie chart of fabric types scanned
   - **Condition Trends** — Bar chart of physical condition counts
3. Click the **"Export Report"** dropdown (top-right):
   - **Export to PDF** — Captures the full dashboard as a high-res landscape PDF (`Facility_Dashboard_Report.pdf`)
   - **Export to Excel** — Downloads a 3-sheet workbook (`Facility_Dashboard_Data.xlsx`):
     - Sheet 1: Summary KPIs
     - Sheet 2: Material Distribution with % breakdown
     - Sheet 3: Condition Trends with % breakdown
4. A toast notification confirms the download

---

## 🔔 Notification System

The platform sends **real-time toast notifications** for key events:

| Toast Type | When It Appears |
|------------|----------------|
| ✅ **Success** (green) | Scan complete, export downloaded, batch processed |
| 🔵 **Info** (blue) | ESG data refreshed, platform announcements |
| ⚠️ **Warning** (yellow) | Inventory alerts, low-score warnings |
| ❌ **Error** (red) | Backend connection failed, export error |

Toasts auto-dismiss after 4–7 seconds. Click the **✕** to dismiss immediately.

---

## 📊 Understanding the Circularity Score

The **Circularity Score (0–100)** uses a weighted model aligned to circular economy standards:

| Factor | Weight | What It Measures |
|--------|--------|-----------------|
| Material Recyclability | **35%** | How recyclable the fabric type is (Cotton > Polyester > Blended) |
| Material Condition | **20%** | Physical state (Good scores highest, Torn scores lowest) |
| Reuse Potential | **20%** | Whether the item can be reused without processing |
| Environmental Benefit | **15%** | CO₂ and water savings potential |
| Processing Feasibility | **10%** | Ease of processing in existing facilities |

**Score Categories:**

| Score Range | Category |
|-------------|----------|
| 85 – 100 | 🟢 Excellent Recovery Potential |
| 70 – 84 | 🔵 High Recovery Potential |
| 55 – 69 | 🟡 Moderate Recovery Potential |
| 40 – 54 | 🟠 Limited Recovery Potential |
| 0 – 39 | 🔴 Disposal Recommended |

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| "Backend connection failed" toast on scan | Ensure FastAPI is running: `uvicorn main:app --reload` in `/backend` |
| Dashboard shows "No scan data available yet" | Scan at least one image via AI Analysis first |
| Login fails with correct credentials | Check that PostgreSQL is running and the `textile_waste_db` database exists |
| PDF export shows blank page | Wait for the page to fully load before clicking Export |
| Batch analysis stalls on one image | Check backend logs — image may be corrupt or unsupported format |

---

## 📞 Support

For technical issues, refer to the **[README.md](../README.md)** or raise an issue on the project repository.

---

*AI Textile Waste Intelligence Platform · User Guide v1.0 · © 2026*
