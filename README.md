# AI Textile Waste Intelligence Platform

An enterprise-grade, full-stack artificial intelligence and sustainability intelligence platform designed for closed-loop textile waste sorting, circular economy benchmarking, and environmental ESG impact reporting.

**Developed for:** Infosys Springboard Internship Project  
**Current Progress:** Milestone 1, Milestone 2 & Milestone 3 (Weeks 1 to 6 Completed)

---

## 1. Project Overview

The **AI Textile Waste Intelligence Platform** automates the classification, scoring, and recycling routing of post-consumer and industrial textile waste. Using dual Convolutional Neural Network (CNN) models and a strict mathematical sustainability engine, the platform quantifies material recovery potential and calculates real-time ESG metrics including CO₂ emissions saved, water conservation, energy recovery, and landfill waste diversion.

---

## 2. Milestone & Module Implementation Breakdown

### Milestone 1: Weeks 1 & 2 — Project Initialization & Core Setup

- **Module 1: Authentication & Role-Based Access Control (RBAC)**
  - Secure JWT-based authentication supporting four distinct industry roles:
    1. `Recycling Facility Operator`
    2. `Sustainability Manager`
    3. `Textile Manufacturer`
    4. `Administrator`
- **Module 2: Textile Inventory & Waste Management Workflow**
  - PostgreSQL/SQLAlchemy schema (`WasteInventory`) for logging waste batches, fabric composition, source origin, condition, and quantity (kg).
  - Full CRUD REST API endpoints (`/api/inventory`).

---

### Milestone 2: Weeks 3 & 4 — AI Material Recognition & Waste Classification

- **Module 3: Image Analysis Engine**
  - Automated image preprocessing, tensor normalization (`224x224`), and batch ingestion pipeline.
- **Module 4: Material Classification Engine (`material_classifier.h5`)**
  - Deep learning model classifying 25 distinct fabric classes (Cotton, Denim, Wool, Silk, Polyester, Nylon, Corduroy, Velvet, etc.).
- **Module 5: Condition & Defect Categorization Engine (`condition_classifier.h5`)**
  - Identifies structural integrity and physical defects (`Defect-Free`, `Hole`, `Broken Stitch`, `Stain`, `Vertical/Horizontal Flaws`).
- **Module 6: Recycling Recommendation Engine**
  - Automated mapping to seven sustainable processing pathways (e.g., Direct Reuse/Resale, Mechanical Recycling, Chemical Recycling, Industrial Wash).

---

### Milestone 3: Weeks 5 & 6 — Sustainability Intelligence & Enterprise ESG Integration

- **Module 7: Sustainability Intelligence Engine**
  - Fabric-specific impact analytics calculating resource savings per kg of diverted textile waste:
    - **CO₂ Emissions Saved (kg)**
    - **Water Conserved (Liters)**
    - **Energy Recovered (kWh)**
- **Module 8: Environmental Impact Assessment Engine**
  - Quantifies total landfill waste diversion rate and tracks global ESG performance benchmarks across facility operations.
- **Module 9: Waste Scoring Engine (Weighted Circularity Model)**
  - Strict mathematical scoring formula evaluating recovery viability out of 100:
    - `Circularity Score = Material Recyclability (35%) + Material Condition (20%) + Reuse Potential (20%) + Environmental Benefit (15%) + Processing Feasibility (10%)`
  - Categorizes waste into document-defined recovery tiers:
    - `Excellent Recovery Potential` (Score >= 85)
    - `High Recovery Potential` (Score >= 70)
    - `Moderate Recovery Potential` (Score >= 55)
    - `Limited Recovery Potential` (Score >= 40)
    - `Disposal Recommended` (Score < 40)
- **Module 10: Full-Stack ESG Dashboard & Reporting UI**
  - Real-time analytical KPI cards displaying aggregated sustainability metrics via FastAPI endpoint (`GET /api/inventory/sustainability-stats`).
  - Visual progress breakdowns for weighted score parameters and instant **PDF ESG Report Export** capability.
- **Module 11: Notification & Alert System (Upcoming)**
  - Automated UI toast notifications and alert popups for threshold limits (e.g., inventory overload, high defect rates).
- **Module 12: Comprehensive Reports & Export System (Upcoming)**
  - Extends native export functionality to include **Excel/CSV Data Export** using `SheetJS`, enabling tabular data analysis for operational managers.

---

## 3. Tech Stack

### Backend Engine

- **Framework:** FastAPI (Python 3.10+)
- **Database & ORM:** PostgreSQL / SQLite with SQLAlchemy
- **AI / ML:** TensorFlow / Keras, NumPy, Pillow, OpenCV
- **Authentication:** OAuth2 with JWT (JSON Web Tokens)

### Frontend Application

- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Reporting:** Print/PDF/Excel Report Generation

---

## 4. Architecture & API Endpoints

### Key REST API Routes

| HTTP Method | Endpoint                              | Description                                             |
| :---------- | :------------------------------------ | :------------------------------------------------------ |
| `POST`      | `/api/auth/register`                  | Register user with designated RBAC role                 |
| `POST`      | `/api/auth/login`                     | Authenticate user and return JWT access token           |
| `GET`       | `/api/inventory`                      | Retrieve all logged textile waste inventory batches     |
| `GET`       | `/api/inventory/sustainability-stats` | Fetch aggregated ESG savings and circularity metrics    |
| `POST`      | `/api/inventory/upload`               | Process image through Dual AI & Sustainability Engines  |
| `GET`       | `/api/analytics`                      | Retrieve material and condition distribution statistics |

---

## 5. Getting Started & Setup Instructions

### Prerequisites

- Python 3.10 or higher
- Node.js (v18+) & npm

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
