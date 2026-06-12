# Venu Saree Boutique — Storefront & Inventory Application

Venu is an elegant, full-stack boutique storefront and inventory management application designed for a luxury handloom saree business. 

The application comprises two main interfaces:
1. **Customer Storefront (`/shop`)**: A warm, contemporary Indian-themed catalog showing handcrafted collections, color swatches, inventory availability, and checkout forms.
2. **Staff Administration Console (`/admin`)**: A portal for managing saree collections, viewing performance metrics, editing saree color variant sheets, adjusting pricing, uploading image urls, and managing orders.

---

## Technical Stack

* **Backend:** Python 3.14+, FastAPI, SQLModel (SQLite), Uvicorn, and pytest.
* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS (v4), Lucide Icons, Framer Motion, and TanStack React Query.

---

## Quick Start Guide

You will need two terminal windows open: one for the Backend, and one for the Frontend.

### 1. Run the Backend (FastAPI)

1. Open your terminal in the project root:
   ```bash
   cd c:\source\venu-collections
   ```
2. Activate the Python virtual environment:
   * **Windows (PowerShell):**
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux:**
     ```bash
     source .venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   .venv\Scripts\python -m app.main
   ```
   *The backend will boot up on **`http://localhost:8000`**.*
5. *(Optional)* Run backend unit tests to verify database integrity and business logic:
   ```bash
   .venv\Scripts\pytest
   ```

### 2. Run the Frontend (Next.js)

1. Open a new terminal in the frontend directory:
   ```bash
   cd c:\source\venu-collections\frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will boot up on **`http://localhost:3000`**.*

---

## Application URL Cheat Sheet

| Endpoint | Description | Authentication |
| :--- | :--- | :--- |
| **`http://localhost:3000/shop`** | Editorial Storefront Catalog & Product Detail pages | None (Public) |
| **`http://localhost:3000/shop/checkout`** | Customer Bag & Order Checkout Form | None (Public) |
| **`http://localhost:3000/admin/login`** | Staff Portal Authentication Screen | None (Has API Key generator button) |
| **`http://localhost:3000/admin/dashboard`** | Staff Sales Metrics & KPI Panel | Secret API Key (Stored in LocalStorage) |
| **`http://localhost:3000/admin/sets`** | Saree Collections (Sets) CRUD | Secret API Key |
| **`http://localhost:3000/admin/orders`** | Order Ledger & Status Manager | Secret API Key |
| **`http://localhost:8000/docs`** | Interactive FastAPI Swagger documentation | None |

---

## Admin Portal Authentication Setup

To access the `/admin` portal, you require an API key:
1. Navigate to the login page: **`http://localhost:3000/admin/login`**.
2. Click the **"Generate New API Key"** button under **"First Time Setup?"**.
3. A key will be requested from the backend, generated, and displayed for you (e.g. `sk_live_...`). 
4. The key is automatically pre-filled in the login box. Click **"Authenticate Session"** to login.
5. The API key is stored in your browser's `localStorage` and will automatically authenticate subsequent visits.




---

# Inventory API for Small Saree Business

**Purpose:** A lightweight, open-source, zero-cost backend API to manage dynamic inventory of saree **sets** and **colors**. Designed for local testing and later free hosting. Provides API-key authentication, full CRUD, marking items sold, and an OpenAPI spec for frontend or agentic workflows (Cursor, Windsurf, Codex, Devin).

**Tech stack (recommended, zero cost, open source):**
- Python 3.11+
- FastAPI
- SQLite (via SQLModel/SQLAlchemy)
- Uvicorn
- API key middleware

**Contents:**
- API specification
- Data model
- Authentication
- Setup instructions
- Examples
- Tests
- Deployment notes
- Agent integration
- Security practices