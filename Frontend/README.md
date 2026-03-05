# 🚗 VisionCars — Car Sell Management System

A full-stack car selling platform where admins manage car inventory and users browse, inquire, and purchase cars — with a simulated payment flow, profile management, and real-time admin dashboard.

---

## ✨ Features

### 👤 User Features
- **Browse Cars** — Filter by brand, fuel type, price range; full-text search across title, brand, year, description. Paginated (6 per page)
- **Car Details** — Image gallery with thumbnails, specs table, inquiry form
- **Buy Now** — Simulated payment flow with processing animation and success confirmation
- **Wishlist** — Save/remove cars to a personal wishlist
- **My Dashboard** — View inquiries, purchases (with link to car detail), and wishlist
- **Profile** — Edit name, phone, address; upload profile picture (Cloudinary)
- **Auth** — Register/Login with JWT, password visibility toggle

### 🛡️ Admin Features
- **Dashboard** — Stats cards (total cars, sold, available, revenue, inquiries, users) with refresh button
- **Recent Activity Feed** — Tracks sales, inquiries, new listings, restocks, car updates, deletions, inquiry replies, and new user registrations
- **Manage Inventory** — Add/Edit/Delete cars with image upload, brand dropdown, status management
- **Inquiries** — View all inquiries, reply via Gmail (opens compose in new tab), mark as replied
- **Transactions** — View all completed purchases with buyer details

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide Icons, Axios, Sonner |
| **Backend** | Node.js, Express.js, MySQL (mysql2), JWT, bcryptjs |
| **Storage** | Cloudinary (car images + user avatars), Multer (temp file handling) |
| **Database** | MySQL |

---

## 📁 Project Structure

```
CarSellSystem/
├── Backend/
│   ├── config/          # DB connection, Cloudinary config
│   ├── controllers/     # Route handlers (auth, cars, inquiries, payments, admin, users, upload)
│   ├── middleware/       # JWT auth, Multer upload
│   ├── routes/           # Express route definitions
│   ├── utils/            # Helper utilities (IST timestamp)
│   ├── database_schema.sql
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/   # Navbar, CarCard, UI components
│   │   ├── pages/        # All page components (Browse, CarDetails, Login, Register, Profile, Dashboard)
│   │   │   └── admin/    # Admin pages (Dashboard, ManageInventory, AddCarForm, Inquiries, Transactions)
│   │   ├── config/       # API URL and auth header helpers
│   │   └── types/        # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+) and **npm**
- **MySQL** database (local or remote)
- **Cloudinary** account (free tier works)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/CarSellSystem.git
cd CarSellSystem
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

Create a `.env` file (use `.env.example` as template):
```bash
cp .env.example .env
# Edit .env with your actual database, JWT, and Cloudinary credentials
```

Run the database schema:
```sql
-- Execute database_schema.sql in your MySQL client
source database_schema.sql;
```

Start the backend:
```bash
npm run dev
```
> Backend runs on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd Frontend
npm install
```

Create a `.env` file (use `.env.example` as template):
```bash
cp .env.example .env
# Edit .env with your API URL
```

Frontend `.env` variables:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```
> Frontend runs on `http://localhost:8080`

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 5000) |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port (default: 3306) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | MySQL database name |
| `JWT_SECRET` | Secret key for JWT token signing |
| `JWT_EXPIRES_IN` | Token expiry duration (e.g., `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FRONTEND_URL` | Frontend URL for CORS (e.g., `http://localhost:8080`) |
| **Frontend** | |
| `VITE_API_URL` | Backend API URL (e.g., `http://localhost:5000/api`) |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login user |
| GET | `/api/cars` | — | Get all cars (with filters, pagination) |
| GET | `/api/cars/:id` | — | Get car details |
| POST | `/api/cars` | Admin | Add new car |
| PUT | `/api/cars/:id` | Admin | Update car |
| DELETE | `/api/cars/:id` | Admin | Delete car |
| POST | `/api/upload` | Admin | Upload car images |
| GET | `/api/users/me` | User | Get profile |
| PUT | `/api/users/me` | User | Update profile |
| PUT | `/api/users/me/avatar` | User | Upload avatar |
| PUT | `/api/users/me/password` | User | Change password |
| POST | `/api/inquiries` | User | Send inquiry |
| GET | `/api/inquiries/my` | User | Get my inquiries |
| GET | `/api/inquiries` | Admin | Get all inquiries |
| PUT | `/api/inquiries/:id` | Admin | Reply to inquiry |
| POST | `/api/payments` | User | Create payment |
| GET | `/api/payments/my` | User | Get my purchases |
| GET | `/api/payments` | Admin | Get all transactions |
| GET | `/api/wishlist` | User | Get wishlist |
| POST | `/api/wishlist` | User | Add to wishlist |
| DELETE | `/api/wishlist/:carId` | User | Remove from wishlist |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/activity` | Admin | Recent activity feed |

---

## 📸 Screenshots

> Add screenshots of your application here

---

## 📄 License

This project is for educational/prototype purposes.
