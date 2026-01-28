# 📊 Hybrid AI News Dashboard - Project Analysis Report

**Date:** 2026-01-28
**Status:** Prototype Phase

## 1. Project Overview
This project, `hgdaniel`, is a **Hybrid AI Market Intelligence Platform**. It is designed to autonomously collect, analyze, and visualize market news and financial data using a distributed architecture.
- **Goal**: Provide real-time insights into specific sectors (e.g., Bio/Healthcare) using local AI models for privacy and cost-efficiency.
- **Core Concept**: "Hybrid" - Combining edge devices (Android tablets via Termux) for data collection/processing with a modern cloud-based web dashboard.

## 2. Technology Stack

### 🖥️ Frontend (Web Dashboard)
Located in `/web`
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Tremor (Charts/UI), Radix UI
- **Visualization**: D3.js, Recharts, ApexCharts
- **State Management**: SWR, Context API
- **Deployment**: Vercel (inferred from `vercel.json`)

### ⚙️ Backend & Data Collection
Located in `/collector` and `/backend`
- **Runtime**: Python 3.x
- **Environment**:
  - **Edge**: Android Termux (`_termux/`, `start_tablet_solo.sh`)
  - **Container**: Docker (`Dockerfile`, `docker-compose.yml`)
- **Key Libraries**:
  - `aiohttp`: Asynchronous web requests
  - `pandas`: Data manipulation
  - `beautifulsoup4`: Web scraping
  - `google-generativeai`: Gemini API integration (backup/hybrid)
  - `gspread`: Google Sheets integration

### 🗄️ Database & Storage
- **Primary DB**: Supabase (PostgreSQL)
- **Secondary/Cache**: Google Sheets (for easy manual access/audit)
- **Real-time**: Firebase (likely for real-time triggers/notifications)

### 🤖 AI Processing
- **Local LLM**: Ollama (referenced in `start_ollama.sh`)
- **Cloud LLM**: OpenAI/Gemini (fallback or specialized tasks)

## 3. Architecture & Data Flow

1.  **Collection Layer (`/collector`)**
    -   `async_collector.py`: Runs 24/7 loops to fetch news from RSS/APIs.
    -   `processor.py`: Cleans and normalizes raw data.
    -   `inference_engine.py`: Uses Local AI (or API) to summarize and tag news.

2.  **Storage Layer**
    -   Processed data is pushed to **Supabase**.
    -   Critical alerts/status updates are synced to **Google Sheets**.

3.  **Presentation Layer (`/web`)**
    -   Next.js fetches data via Supabase Client.
    -   Rehydrates state into interactive dashboards (`/company`, `/analysis`).
    -   **Recent Update**: "Contact Us" section removed; Mock stock prices replaced with placeholders (`-`) pending real-time data feed connection.

## 4. Directory Structure Analysis

```
hgdaniel/
├── web/                 # Next.js Frontend Application
│   ├── src/app/         # App Router Pages (About, Company, Analysis)
│   ├── public/          # Static assets
│   └── package.json     # Frontend dependencies
├── collector/           # Python Data Collection Engine
│   ├── async_collector.py # Main entry point for collection
│   ├── processor.py     # Data processing logic
│   └── ...
├── backend/             # Server-side API (FastAPI/Express implied)
├── _docs/               # Project Documentation
├── _termux/             # Android Termux specific scripts
└── scripts/             # Utility scripts (Auto-sync, Watchdog)
```

## 5. Recent Changes (Prototype Branch)
-   **UI Cleanup**: Removed deprecrated contact information from the About page.
-   **Feature Flagging**: Disabled mock stock price displays on the Analysis page to prevent misleading information.
-   **Git Workflow**: Merged `prototype` stability fixes into `main`.

## 6. Future Roadmap (Inferred)
-   **Real-time Stock API**: replacing the `-` placeholders with actual KRX market data.
-   **Server Migration**: Moving from pure Termux edge nodes to a more stable cloud backend (AWS/Oracle) for the core API, while keeping collectors distributed.
