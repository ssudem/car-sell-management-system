# ===== BACKEND DEVELOPMENT GUIDE =====
# Car Sell Management System — Phase 2 & Phase 3
# Tech Stack: Node.js, Express.js, MySQL/PostgreSQL, Cloudinary, JWT
#
# PURPOSE: This guide maps every frontend file to the backend API it needs.
# Use this guide to build your Express.js backend step by step.
# Each section tells you: which frontend file calls which API, what data it sends/expects.

---

## TABLE OF CONTENTS

1. [Project Folder Structure](#1-project-folder-structure-backend)
2. [Environment Variables](#2-environment-variables-env)
3. [NPM Packages](#3-npm-packages-to-install)
4. [API Routes Reference](#4-api-routes-reference)
5. [Frontend → Backend File Mapping](#5-frontend--backend-file-mapping)
6. [SQL Database Schema](#6-sql-database-schema)
7. [Key Code Snippets](#7-key-code-snippets)
8. [Useful SQL Queries](#8-useful-sql-queries)
9. [Frontend-Backend Connection Checklist](#9-frontend-backend-connection-checklist)
10. [Cloudinary Setup](#10-cloudinary-setup-steps)
11. [Error Handling Guide](#11-error-handling-guide)
12. [CORS Configuration](#12-cors-configuration)
13. [Authentication Flow Diagram](#13-authentication-flow-diagram)

---

## 1. PROJECT FOLDER STRUCTURE (Backend)

```
backend/
├── server.js                # Entry point — starts Express server
├── .env                     # Environment variables (DB, JWT, Cloudinary)
├── package.json
├── uploads/                 # Temp folder for Multer (auto-created)
├── config/
│   ├── db.js                # Database connection pool (MySQL or PostgreSQL)
│   └── cloudinary.js        # Cloudinary SDK configuration
├── middleware/
│   ├── auth.js              # JWT verification middleware (auth + adminAuth)
│   └── upload.js            # Multer file upload middleware
├── routes/
│   ├── authRoutes.js        # POST /api/auth/register, /api/auth/login
│   ├── carRoutes.js         # CRUD for cars (GET, POST, PUT, DELETE)
│   ├── uploadRoutes.js      # POST /api/upload (images → Cloudinary)
│   ├── wishlistRoutes.js    # User wishlist (add, remove, check)
│   ├── inquiryRoutes.js     # User inquiries (send, list, reply)
│   ├── userRoutes.js        # User profile (GET /me, PUT /me)
│   ├── paymentRoutes.js     # Dummy payment simulation
│   └── adminRoutes.js       # Admin stats (GET /api/admin/stats)
├── controllers/
│   ├── authController.js    # register(), login()
│   ├── carController.js     # getAllCars(), getCarById(), addCar(), updateCar(), deleteCar()
│   ├── uploadController.js  # uploadImages() — Multer → Cloudinary
│   ├── wishlistController.js # getWishlist(), addToWishlist(), removeFromWishlist(), checkWishlist()
│   ├── inquiryController.js # sendInquiry(), getMyInquiries(), getAllInquiries(), replyInquiry()
│   ├── userController.js    # getProfile(), updateProfile()
│   ├── paymentController.js # createPayment(), getMyPayments(), getAllPayments()
│   └── adminController.js   # getStats(), getActivity()
└── utils/
    └── helpers.js           # Utility functions (formatDate, etc.)
```

---

## 2. ENVIRONMENT VARIABLES (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database (MySQL example)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=car_sell_db

# JWT Secret (use a strong random string in production)
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Cloudinary (get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

---

## 3. NPM PACKAGES TO INSTALL

```bash
# Initialize project
npm init -y

# Core dependencies
npm install express mysql2 dotenv cors bcryptjs jsonwebtoken multer cloudinary

# Development
npm install --save-dev nodemon

# Add to package.json scripts:
# "start": "node server.js",
# "dev": "nodemon server.js"
```

For PostgreSQL, replace `mysql2` with `pg`.

---

## 4. API ROUTES REFERENCE

### 4.1 Authentication Routes (`/api/auth`)

| Method | Endpoint            | Description              | Auth Required | Request Body |
|--------|---------------------|--------------------------|---------------|--------------|
| POST   | /api/auth/register  | Register new user        | No            | `{ name, email, password }` |
| POST   | /api/auth/login     | Login & get JWT token    | No            | `{ email, password }` |

**Register Request:**
```json
POST /api/auth/register
Content-Type: application/json

{ "name": "John Doe", "email": "john@example.com", "password": "123456" }
```

**Register Response (201):**
```json
{ "token": "eyJhbGciOiJI...", "user": { "id": 1, "name": "John Doe", "role": "user" } }
```

**Login Request:**
```json
POST /api/auth/login
Content-Type: application/json

{ "email": "john@example.com", "password": "123456" }
```

**Login Response (200):**
```json
{ "token": "eyJhbGciOiJI...", "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "user" } }
```

**Error Response (401):**
```json
{ "message": "Invalid email or password" }
```

### 4.2 Car Routes (`/api/cars`)

| Method | Endpoint        | Description                  | Auth Required |
|--------|-----------------|------------------------------|---------------|
| GET    | /api/cars       | Get all cars (with filters)  | No            |
| GET    | /api/cars/:id   | Get single car with images   | No            |
| POST   | /api/cars       | Add new car                  | Admin JWT     |
| PUT    | /api/cars/:id   | Update car                   | Admin JWT     |
| DELETE | /api/cars/:id   | Delete car                   | Admin JWT     |

**Query Parameters for GET /api/cars:**
```
?brand=Toyota          — filter by brand (can repeat: ?brand=Toyota&brand=Honda)
?fuelType=Diesel       — filter by fuel type (can repeat)
?maxPrice=50000        — filter by max price
?search=camry          — search by title or brand (LIKE %camry%)
?status=Available      — filter by status
?limit=10&offset=0     — pagination
```

**GET /api/cars Response:**
```json
[
  {
    "id": 1,
    "title": "2023 Toyota Camry XSE",
    "brand": "Toyota",
    "price": 28500,
    "year": 2023,
    "mileage": 12000,
    "fuelType": "Petrol",
    "transmission": "Automatic",
    "status": "Available",
    "image": "https://res.cloudinary.com/xxx/image/upload/v1/autovault_cars/primary.jpg",
    "description": "A reliable sedan...",
    "images": [
      "https://res.cloudinary.com/xxx/image/upload/v1/autovault_cars/img1.jpg",
      "https://res.cloudinary.com/xxx/image/upload/v1/autovault_cars/img2.jpg"
    ]
  }
]
```

**GET /api/cars/:id Response (includes gallery images from car_images table):**
```json
{
  "id": 1,
  "title": "2023 Toyota Camry XSE",
  "brand": "Toyota",
  "price": 28500,
  "year": 2023,
  "mileage": 12000,
  "fuelType": "Petrol",
  "transmission": "Automatic",
  "status": "Available",
  "image": "https://res.cloudinary.com/.../primary.jpg",
  "description": "A reliable sedan...",
  "images": [
    "https://res.cloudinary.com/.../img1.jpg",
    "https://res.cloudinary.com/.../img2.jpg",
    "https://res.cloudinary.com/.../img3.jpg",
    "https://res.cloudinary.com/.../img4.jpg"
  ]
}
```

### 4.3 Image Upload (`/api/upload`)

| Method | Endpoint     | Description                        | Auth Required |
|--------|--------------|------------------------------------|---------------|
| POST   | /api/upload  | Upload image(s) to Cloudinary      | Admin JWT     |

**Request:** `multipart/form-data` with field name `images` (array of files)
**Response:**
```json
{
  "urls": [
    "https://res.cloudinary.com/xxx/image/upload/v1/autovault_cars/abc123.jpg",
    "https://res.cloudinary.com/xxx/image/upload/v1/autovault_cars/def456.jpg"
  ]
}
```

### 4.4 Wishlist Routes (`/api/wishlist`)

| Method | Endpoint                    | Description                | Auth Required |
|--------|-----------------------------|----------------------------|---------------|
| GET    | /api/wishlist               | Get user's wishlist        | JWT           |
| POST   | /api/wishlist               | Add car to wishlist        | JWT           |
| DELETE | /api/wishlist/:carId        | Remove from wishlist       | JWT           |
| GET    | /api/wishlist/check/:carId  | Check if car is in wishlist| JWT           |

**POST /api/wishlist Request:** `{ "carId": 5 }`
**GET /api/wishlist/check/:carId Response:** `{ "inWishlist": true }`

### 4.5 Inquiry Routes (`/api/inquiries`)

| Method | Endpoint             | Description               | Auth Required |
|--------|----------------------|---------------------------|---------------|
| POST   | /api/inquiries       | Send new inquiry          | No (optional) |
| GET    | /api/inquiries/my    | Get user's inquiries      | JWT           |
| GET    | /api/inquiries       | Get ALL inquiries (admin) | Admin JWT     |
| PUT    | /api/inquiries/:id   | Update status (reply)     | Admin JWT     |

**POST /api/inquiries Request:**
```json
{ "carId": 1, "name": "John", "email": "john@example.com", "message": "Is this available?" }
```

### 4.6 User Profile (`/api/users`)

| Method | Endpoint               | Description          | Auth Required |
|--------|------------------------|----------------------|---------------|
| GET    | /api/users/me          | Get own profile      | JWT           |
| PUT    | /api/users/me          | Update own profile   | JWT           |
| PUT    | /api/users/me/password | Change password      | JWT           |

**PUT /api/users/me Request:** `{ "name": "New Name", "phone": "+91...", "address": "..." }`
**PUT /api/users/me/password Request:** `{ "oldPassword": "...", "newPassword": "..." }`

### 4.7 Payment / Transaction Routes (`/api/payments`)

| Method | Endpoint            | Description              | Auth Required |
|--------|---------------------|--------------------------|---------------|
| POST   | /api/payments       | Simulate a payment       | JWT           |
| GET    | /api/payments/my    | Get user's transactions  | JWT           |
| GET    | /api/payments       | Get all transactions     | Admin JWT     |

**POST /api/payments Request:** `{ "carId": 1, "amount": 28500 }`

### 4.8 Admin Stats (`/api/admin`)

| Method | Endpoint              | Description             | Auth Required |
|--------|-----------------------|-------------------------|---------------|
| GET    | /api/admin/stats      | Dashboard statistics    | Admin JWT     |
| GET    | /api/admin/activity   | Recent activity log     | Admin JWT     |

**GET /api/admin/stats Response:**
```json
{
  "totalCars": 25,
  "carsSold": 8,
  "carsAvailable": 15,
  "revenue": 245000,
  "totalInquiries": 42,
  "totalUsers": 120
}
```

---

## 5. FRONTEND → BACKEND FILE MAPPING

This is the most important section. It tells you which frontend file calls which API endpoint.

### PUBLIC PAGES (No Auth Required)

| Frontend File | What It Does | API Endpoint(s) | Notes |
|---|---|---|---|
| `src/pages/Index.tsx` | Shows featured cars on home page | `GET /api/cars?status=Available&limit=4` | Replace `mockCars` import |
| `src/pages/BrowseCars.tsx` | Browse + filter cars | `GET /api/cars?brand=X&fuelType=Y&maxPrice=Z&search=Q` | Send filters as query params on Search button click |
| `src/pages/CarDetails.tsx` | Show single car details + gallery | `GET /api/cars/:id` | Response includes `images[]` array from car_images table |
| `src/pages/CarDetails.tsx` | Send inquiry form | `POST /api/inquiries` | Body: `{ carId, name, email, message }` |
| `src/components/CarCard.tsx` | Display car card | None — uses data passed via props | Car data comes from parent page |
| `src/components/Navbar.tsx` | Show login state in navbar | None — reads `localStorage.getItem("token")` | Check token existence |

### AUTH PAGES

| Frontend File | What It Does | API Endpoint(s) | Notes |
|---|---|---|---|
| `src/pages/Login.tsx` | User login | `POST /api/auth/login` | Store token + user in localStorage on success |
| `src/pages/Register.tsx` | User registration | `POST /api/auth/register` | Store token + user in localStorage on success |
| `src/components/Navbar.tsx` | Logout button | None — removes `token` and `user` from localStorage | Then navigate to `/` |

### USER PAGES (JWT Required)

| Frontend File | What It Does | API Endpoint(s) | Notes |
|---|---|---|---|
| `src/pages/Profile.tsx` | View/edit profile | `GET /api/users/me`, `PUT /api/users/me` | Send JWT in Authorization header |
| `src/pages/Profile.tsx` | Upload avatar | `POST /api/upload` then `PUT /api/users/me { avatar: url }` | Multer → Cloudinary → save URL |
| `src/pages/UserDashboard.tsx` | Wishlist tab | `GET /api/wishlist` | JWT required |
| `src/pages/UserDashboard.tsx` | Remove from wishlist | `DELETE /api/wishlist/:carId` | JWT required |
| `src/pages/UserDashboard.tsx` | Inquiries tab | `GET /api/inquiries/my` | JWT required |
| `src/pages/UserDashboard.tsx` | Purchases tab | `GET /api/payments/my` | JWT required |
| `src/pages/CarDetails.tsx` | Save to wishlist | `POST /api/wishlist { carId }` | JWT required |
| `src/pages/CarDetails.tsx` | Remove from wishlist | `DELETE /api/wishlist/:carId` | JWT required |
| `src/pages/CarDetails.tsx` | Check if saved | `GET /api/wishlist/check/:carId` | JWT required |

### ADMIN PAGES (Admin JWT Required)

| Frontend File | What It Does | API Endpoint(s) | Notes |
|---|---|---|---|
| `src/pages/admin/AdminDashboard.tsx` | Show stats cards | `GET /api/admin/stats` | Admin JWT required |
| `src/pages/admin/AdminDashboard.tsx` | Show activity log | `GET /api/admin/activity` | Admin JWT required |
| `src/pages/admin/ManageInventory.tsx` | List all cars | `GET /api/cars` | Admin JWT (can see all statuses) |
| `src/pages/admin/ManageInventory.tsx` | Delete a car | `DELETE /api/cars/:id` | Admin JWT required |
| `src/pages/admin/AddCarForm.tsx` | Add new car | `POST /api/cars` then `POST /api/upload` for images | Admin JWT, send car data + image URLs |
| `src/pages/admin/AddCarForm.tsx` | Edit existing car | `GET /api/cars/:id` then `PUT /api/cars/:id` | Admin JWT, pre-fill form with car data |
| `src/pages/admin/AdminInquiries.tsx` | View all inquiries | `GET /api/inquiries` | Admin JWT required |
| `src/pages/admin/AdminInquiries.tsx` | Reply to inquiry | `PUT /api/inquiries/:id { status: "Replied" }` | Admin JWT required |
| `src/pages/admin/AdminTransactions.tsx` | View all payments | `GET /api/payments` | Admin JWT required |

### DATA FILES (Replace with API calls)

| Frontend File | Purpose | Replace With |
|---|---|---|
| `src/data/mockCars.ts` | Sample car data + Car interface | Keep the `Car` interface, remove mock data, fetch from API |
| `src/data/mockUser.ts` | Mock auth state + user data | Replace with localStorage + API calls |
| `src/data/mockDashboard.ts` | Mock dashboard data | Replace with API calls to wishlist/inquiries/payments |

### LAYOUT FILES (May need Auth Guards)

| Frontend File | What To Add | Notes |
|---|---|---|
| `src/App.tsx` | Add AuthGuard wrapper for protected routes | Check JWT in localStorage; redirect to /login if missing |
| `src/layouts/AdminLayout.tsx` | Add admin role check | Decode JWT, verify role=admin; redirect if not admin |
| `src/layouts/PublicLayout.tsx` | No changes needed | Public layout stays the same |

---

## 6. SQL DATABASE SCHEMA

```sql
-- ===== CREATE DATABASE =====
CREATE DATABASE car_sell_db;
USE car_sell_db;

-- ===== USERS TABLE =====
-- Stores all registered users (both regular users and admins)
-- Referenced by: wishlist, inquiries, transactions tables
CREATE TABLE users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,  -- bcrypt hashed (never store plain text!)
  phone       VARCHAR(20)   DEFAULT NULL,
  address     TEXT          DEFAULT NULL,
  avatar      VARCHAR(500)  DEFAULT NULL,  -- Cloudinary URL for profile picture
  role        ENUM('user', 'admin') DEFAULT 'user',
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ===== CARS TABLE =====
-- Stores all car listings. Primary image stored here, gallery images in car_images.
-- Referenced by: car_images, wishlist, inquiries, transactions tables
CREATE TABLE cars (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  title         VARCHAR(200)  NOT NULL,
  brand         VARCHAR(100)  NOT NULL,
  price         DECIMAL(12,2) NOT NULL,
  year          INT           NOT NULL,
  mileage       INT           DEFAULT 0,
  fuel_type     VARCHAR(50)   NOT NULL,    -- 'Petrol', 'Diesel', 'Electric', 'Hybrid'
  transmission  VARCHAR(50)   NOT NULL,    -- 'Automatic', 'Manual'
  status        ENUM('Available', 'Pending', 'Sold') DEFAULT 'Available',
  description   TEXT,
  image         VARCHAR(500),  -- Primary image (Cloudinary URL)
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ===== CAR IMAGES TABLE =====
-- Stores secondary/gallery images for each car (shown in CarDetails.tsx thumbnail strip)
-- Each car can have multiple images (1-to-many relationship)
CREATE TABLE car_images (
  id        INT PRIMARY KEY AUTO_INCREMENT,
  car_id    INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,  -- Cloudinary URL
  sort_order INT DEFAULT 0,          -- For ordering images in the gallery
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

-- ===== WISHLIST TABLE =====
-- Users can save cars to their wishlist (shown in UserDashboard.tsx "My Wishlist" tab)
CREATE TABLE wishlist (
  id        INT PRIMARY KEY AUTO_INCREMENT,
  user_id   INT NOT NULL,
  car_id    INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist (user_id, car_id)  -- Prevent duplicate saves
);

-- ===== INQUIRIES TABLE =====
-- Users/visitors can send messages about specific cars (CarDetails.tsx inquiry form)
-- Admin views these in AdminInquiries.tsx
CREATE TABLE inquiries (
  id        INT PRIMARY KEY AUTO_INCREMENT,
  car_id    INT NOT NULL,
  user_id   INT DEFAULT NULL,  -- NULL if visitor is not logged in
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(150) NOT NULL,
  message   TEXT NOT NULL,
  status    ENUM('Pending', 'Replied') DEFAULT 'Pending',
  admin_reply TEXT DEFAULT NULL,  -- Admin's response text
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ===== TRANSACTIONS / PAYMENTS TABLE =====
-- Simulated payment records (UserDashboard.tsx "My Purchases" tab)
-- Admin views these in AdminTransactions.tsx
CREATE TABLE transactions (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  user_id        INT NOT NULL,
  car_id         INT NOT NULL,
  amount         DECIMAL(12,2) NOT NULL,
  payment_status ENUM('Processing', 'Completed', 'Failed') DEFAULT 'Processing',
  payment_method VARCHAR(50) DEFAULT 'Card',  -- 'Card', 'UPI', 'Bank Transfer'
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

-- ===== INSERT DEFAULT ADMIN USER =====
-- Password: admin123 (bcrypt hash — generate with: bcrypt.hashSync("admin123", 10))
-- Replace the hash below with an actual bcrypt hash!
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@autovault.com', '$2a$10$GENERATE_YOUR_BCRYPT_HASH_HERE', 'admin');

-- ===== INSERT DEFAULT REGULAR USER =====
-- Password: user123
INSERT INTO users (name, email, password, phone, address, role) VALUES
('John Doe', 'user@autovault.com', '$2a$10$GENERATE_YOUR_BCRYPT_HASH_HERE', '+91 98765 43210', '42, MG Road, Bengaluru', 'user');

-- ===== INSERT SAMPLE CARS =====
INSERT INTO cars (title, brand, price, year, mileage, fuel_type, transmission, status, description, image) VALUES
('2023 Toyota Camry XSE', 'Toyota', 28500, 2023, 12000, 'Petrol', 'Automatic', 'Available', 'A reliable sedan with excellent fuel economy.', 'https://your-cloudinary-url/camry.jpg'),
('2022 Honda Civic Sport', 'Honda', 24200, 2022, 18500, 'Petrol', 'Manual', 'Available', 'Sporty compact sedan with turbo engine.', 'https://your-cloudinary-url/civic.jpg'),
('2024 Hyundai Creta SX', 'Hyundai', 18900, 2024, 5000, 'Diesel', 'Automatic', 'Available', 'Best-selling SUV with premium features.', 'https://your-cloudinary-url/creta.jpg');

-- ===== INSERT SAMPLE CAR IMAGES =====
INSERT INTO car_images (car_id, image_url, sort_order) VALUES
(1, 'https://your-cloudinary-url/camry-1.jpg', 1),
(1, 'https://your-cloudinary-url/camry-2.jpg', 2),
(1, 'https://your-cloudinary-url/camry-3.jpg', 3),
(2, 'https://your-cloudinary-url/civic-1.jpg', 1),
(2, 'https://your-cloudinary-url/civic-2.jpg', 2);
```

---

## 7. KEY CODE SNIPPETS

### 7.1 Database Connection (config/db.js)

```javascript
// config/db.js
// Creates a MySQL connection pool for efficient database queries
const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
  console.log("✅ Database connected successfully");
  connection.release();
});

module.exports = pool.promise();
```

### 7.2 Cloudinary Config (config/cloudinary.js)

```javascript
// config/cloudinary.js
// Configures Cloudinary SDK for image uploads
// Images are uploaded to the "autovault_cars" folder in your Cloudinary account
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

### 7.3 JWT Auth Middleware (middleware/auth.js)

```javascript
// middleware/auth.js
// Two middleware functions:
//   auth()      → Verifies JWT token (any logged-in user)
//   adminAuth() → Verifies JWT token AND checks role === "admin"
//
// Usage in routes:
//   router.get("/wishlist", auth, getWishlist);        // Any user
//   router.post("/cars", adminAuth, addCar);           // Admin only
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  // Token comes from: Authorization: Bearer <token>
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token, access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  });
};

module.exports = { auth, adminAuth };
```

### 7.4 Multer Upload Middleware (middleware/upload.js)

```javascript
// middleware/upload.js
// Handles multipart/form-data file uploads
// Files are temporarily saved to ./uploads/ then uploaded to Cloudinary
// Max file size: 5MB, allowed types: jpeg, jpg, png, webp
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const types = /jpeg|jpg|png|webp/;
    const extname = types.test(path.extname(file.originalname).toLowerCase());
    const mimetype = types.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
  },
});

module.exports = upload;
```

### 7.5 Upload Controller (controllers/uploadController.js)

```javascript
// controllers/uploadController.js
// Called by: AddCarForm.tsx (admin image upload)
// Called by: Profile.tsx (avatar upload)
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// Upload single or multiple images to Cloudinary
// Returns array of Cloudinary URLs
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const urls = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "autovault_cars",
        transformation: [{ width: 800, height: 600, crop: "fill" }],
      });
      urls.push(result.secure_url);
      fs.unlinkSync(file.path); // Delete temp file after upload
    }

    res.json({ urls });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};
```

### 7.6 Auth Controller (controllers/authController.js)

```javascript
// controllers/authController.js
// Called by: Login.tsx (login) and Register.tsx (register)
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    // Check if email exists
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password and insert user
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    // Generate JWT
    const token = jwt.sign(
      { id: result.insertId, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      token,
      user: { id: result.insertId, name, email, role: "user" }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find user by email
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT (payload contains user id and role)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
```

### 7.7 Car Controller (controllers/carController.js)

```javascript
// controllers/carController.js
// Called by: Index.tsx, BrowseCars.tsx, CarDetails.tsx, ManageInventory.tsx, AddCarForm.tsx
const db = require("../config/db");

// GET /api/cars — with optional filters
// Called by: BrowseCars.tsx (on Search button click), Index.tsx (featured cars)
exports.getAllCars = async (req, res) => {
  try {
    let query = "SELECT * FROM cars WHERE 1=1";
    const params = [];

    // Apply filters from query string
    if (req.query.brand) {
      const brands = Array.isArray(req.query.brand) ? req.query.brand : [req.query.brand];
      query += ` AND brand IN (${brands.map(() => "?").join(",")})`;
      params.push(...brands);
    }

    if (req.query.fuelType) {
      const fuels = Array.isArray(req.query.fuelType) ? req.query.fuelType : [req.query.fuelType];
      query += ` AND fuel_type IN (${fuels.map(() => "?").join(",")})`;
      params.push(...fuels);
    }

    if (req.query.maxPrice) {
      query += " AND price <= ?";
      params.push(Number(req.query.maxPrice));
    }

    if (req.query.search) {
      query += " AND (title LIKE ? OR brand LIKE ?)";
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (req.query.status) {
      query += " AND status = ?";
      params.push(req.query.status);
    }

    query += " ORDER BY created_at DESC";

    if (req.query.limit) {
      query += " LIMIT ?";
      params.push(Number(req.query.limit));
      if (req.query.offset) {
        query += " OFFSET ?";
        params.push(Number(req.query.offset));
      }
    }

    const [cars] = await db.query(query, params);
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/cars/:id — with gallery images
// Called by: CarDetails.tsx
exports.getCarById = async (req, res) => {
  try {
    const [cars] = await db.query("SELECT * FROM cars WHERE id = ?", [req.params.id]);
    if (cars.length === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    const car = cars[0];

    // Get gallery images from car_images table
    const [images] = await db.query(
      "SELECT image_url FROM car_images WHERE car_id = ? ORDER BY sort_order",
      [car.id]
    );
    car.images = images.map(img => img.image_url);

    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/cars — add new car (admin only)
// Called by: AddCarForm.tsx
exports.addCar = async (req, res) => {
  const { title, brand, price, year, mileage, fuelType, transmission, status, description, image, images } = req.body;

  try {
    const [result] = await db.query(
      "INSERT INTO cars (title, brand, price, year, mileage, fuel_type, transmission, status, description, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [title, brand, price, year, mileage, fuelType, transmission, status, description, image]
    );

    // Insert gallery images if provided
    if (images && images.length > 0) {
      const imageValues = images.map((url, i) => [result.insertId, url, i]);
      await db.query(
        "INSERT INTO car_images (car_id, image_url, sort_order) VALUES ?",
        [imageValues]
      );
    }

    res.status(201).json({ id: result.insertId, message: "Car added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/cars/:id — update car (admin only)
// Called by: AddCarForm.tsx (in edit mode)
exports.updateCar = async (req, res) => {
  const { title, brand, price, year, mileage, fuelType, transmission, status, description, image } = req.body;

  try {
    await db.query(
      "UPDATE cars SET title=?, brand=?, price=?, year=?, mileage=?, fuel_type=?, transmission=?, status=?, description=?, image=? WHERE id=?",
      [title, brand, price, year, mileage, fuelType, transmission, status, description, image, req.params.id]
    );
    res.json({ message: "Car updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/cars/:id — delete car (admin only)
// Called by: ManageInventory.tsx
exports.deleteCar = async (req, res) => {
  try {
    await db.query("DELETE FROM cars WHERE id = ?", [req.params.id]);
    res.json({ message: "Car deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
```

### 7.8 Server Entry Point (server.js)

```javascript
// server.js
// Main entry point for the Express backend
// Start with: node server.js (or: npx nodemon server.js)
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/cars", require("./routes/carRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/inquiries", require("./routes/inquiryRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "OK", timestamp: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API base URL: http://localhost:${PORT}/api`);
});
```

### 7.9 Example Route File (routes/carRoutes.js)

```javascript
// routes/carRoutes.js
const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const {
  getAllCars,
  getCarById,
  addCar,
  updateCar,
  deleteCar,
} = require("../controllers/carController");

// Public routes
router.get("/", getAllCars);
router.get("/:id", getCarById);

// Admin-only routes
router.post("/", adminAuth, addCar);
router.put("/:id", adminAuth, updateCar);
router.delete("/:id", adminAuth, deleteCar);

module.exports = router;
```

### 7.10 Example Route File (routes/authRoutes.js)

```javascript
// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

module.exports = router;
```

### 7.11 Example Route File (routes/uploadRoutes.js)

```javascript
// routes/uploadRoutes.js
const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadImages } = require("../controllers/uploadController");

// Upload up to 10 images at once
router.post("/", adminAuth, upload.array("images", 10), uploadImages);

module.exports = router;
```

---

## 8. USEFUL SQL QUERIES

```sql
-- Get all available cars (for Index.tsx featured section)
SELECT * FROM cars WHERE status = 'Available' ORDER BY created_at DESC LIMIT 4;

-- Get car with its gallery images (for CarDetails.tsx)
SELECT c.*, GROUP_CONCAT(ci.image_url ORDER BY ci.sort_order) AS gallery
FROM cars c
LEFT JOIN car_images ci ON c.id = ci.car_id
WHERE c.id = ?
GROUP BY c.id;

-- Get user's wishlist with car details (for UserDashboard.tsx)
SELECT w.id AS wishlist_id, w.created_at AS saved_at, c.*
FROM wishlist w
JOIN cars c ON w.car_id = c.id
WHERE w.user_id = ?
ORDER BY w.created_at DESC;

-- Check if car is in user's wishlist (for CarDetails.tsx heart icon)
SELECT COUNT(*) AS count FROM wishlist WHERE user_id = ? AND car_id = ?;

-- Get user's inquiries (for UserDashboard.tsx)
SELECT i.*, c.title AS car_title
FROM inquiries i
JOIN cars c ON i.car_id = c.id
WHERE i.user_id = ?
ORDER BY i.created_at DESC;

-- Get all inquiries for admin (for AdminInquiries.tsx)
SELECT i.*, c.title AS car_title, u.name AS user_name
FROM inquiries i
JOIN cars c ON i.car_id = c.id
LEFT JOIN users u ON i.user_id = u.id
ORDER BY i.created_at DESC;

-- Get admin dashboard stats (for AdminDashboard.tsx)
SELECT
  (SELECT COUNT(*) FROM cars) AS total_cars,
  (SELECT COUNT(*) FROM cars WHERE status = 'Sold') AS cars_sold,
  (SELECT COUNT(*) FROM cars WHERE status = 'Available') AS cars_available,
  (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE payment_status = 'Completed') AS revenue,
  (SELECT COUNT(*) FROM inquiries) AS total_inquiries,
  (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_users;

-- Get user's purchases (for UserDashboard.tsx)
SELECT t.*, c.title AS car_title
FROM transactions t
JOIN cars c ON t.car_id = c.id
WHERE t.user_id = ?
ORDER BY t.created_at DESC;

-- Get all transactions for admin (for AdminTransactions.tsx)
SELECT t.*, c.title AS car_title, u.name AS buyer_name
FROM transactions t
JOIN cars c ON t.car_id = c.id
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC;

-- Search cars with filters (for BrowseCars.tsx)
SELECT * FROM cars
WHERE (title LIKE '%search%' OR brand LIKE '%search%')
  AND brand IN ('Toyota', 'Honda')
  AND fuel_type IN ('Petrol', 'Diesel')
  AND price <= 50000
  AND status = 'Available'
ORDER BY created_at DESC;
```

---

## 9. FRONTEND-BACKEND CONNECTION CHECKLIST

When connecting the React frontend to your Express backend:

### Step 1: Create API config file
```javascript
// src/config/api.ts (create this in your frontend)
export const API_URL = "http://localhost:5000/api";

// Helper to get auth headers
export const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token")}`,
});
```

### Step 2: Update Login.tsx
Replace `mockLogin()` with:
```javascript
const response = await fetch(`${API_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const data = await response.json();
if (response.ok) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  if (data.user.role === "admin") navigate("/admin");
  else navigate("/dashboard");
} else {
  toast.error(data.message);
}
```

### Step 3: Update Navbar.tsx
Replace `isLoggedIn()` and `getMockUser()` with:
```javascript
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");
const loggedIn = !!token && !!user;
```

### Step 4: Update BrowseCars.tsx
Replace `mockCars` filtering with:
```javascript
const applyFilters = async () => {
  const params = new URLSearchParams();
  if (searchQuery) params.append("search", searchQuery);
  selectedBrands.forEach(b => params.append("brand", b));
  selectedFuels.forEach(f => params.append("fuelType", f));
  if (maxPrice < 100000) params.append("maxPrice", maxPrice.toString());

  const response = await fetch(`${API_URL}/cars?${params}`);
  const cars = await response.json();
  setFilteredCars(cars);
};
```

### Step 5: Add auth guard to App.tsx
```javascript
// Create a ProtectedRoute component:
const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;
  return <Outlet />;
};

// Wrap protected routes:
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<UserDashboard />} />
  <Route path="/profile" element={<Profile />} />
</Route>
```

### Step 6: Handle CORS
Make sure your backend has CORS configured to accept requests from `http://localhost:5173` (Vite dev server).

### Step 7: Handle errors globally
Show toast notifications for API errors in all pages.

---

## 10. CLOUDINARY SETUP STEPS

1. Create free account at https://cloudinary.com
2. Go to Dashboard → copy **Cloud Name**, **API Key**, **API Secret**
3. Add these 3 values to your `.env` file
4. Install packages: `npm install cloudinary multer`
5. Upload flow:
   ```
   Frontend (FormData)
     → Express route (Multer saves to ./uploads/)
       → Controller (uploads to Cloudinary)
         → Cloudinary returns secure_url
           → Save URL in database (cars.image or car_images.image_url)
             → Delete temp file from ./uploads/
               → Return URL to frontend
   ```
6. In AddCarForm.tsx: Upload images first via POST /api/upload, get URLs, then POST /api/cars with those URLs
7. In Profile.tsx: Upload avatar via POST /api/upload, get URL, then PUT /api/users/me with avatar URL

---

## 11. ERROR HANDLING GUIDE

### Backend Error Responses (use consistently):
```javascript
// 400 — Bad request (validation errors)
res.status(400).json({ message: "Email is required" });

// 401 — Unauthorized (no/invalid token)
res.status(401).json({ message: "Invalid or expired token" });

// 403 — Forbidden (not admin)
res.status(403).json({ message: "Admin access required" });

// 404 — Not found
res.status(404).json({ message: "Car not found" });

// 500 — Server error
res.status(500).json({ message: "Server error", error: err.message });
```

### Frontend Error Handling (in every API call):
```javascript
try {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    toast.error(data.message || "Something went wrong");
    return;
  }
  // Success handling...
} catch (err) {
  toast.error("Network error. Please try again.");
}
```

---

## 12. CORS CONFIGURATION

```javascript
// In server.js — IMPORTANT for frontend-backend communication
const cors = require("cors");

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
```

---

## 13. AUTHENTICATION FLOW DIAGRAM

```
REGISTRATION FLOW:
Register.tsx → POST /api/auth/register { name, email, password }
  → Backend hashes password (bcrypt)
  → Inserts into users table
  → Generates JWT { id, role }
  → Returns { token, user }
  → Frontend stores in localStorage
  → Navigates to /dashboard

LOGIN FLOW:
Login.tsx → POST /api/auth/login { email, password }
  → Backend finds user by email
  → Compares password (bcrypt)
  → Generates JWT { id, role }
  → Returns { token, user }
  → Frontend stores in localStorage
  → If role === "admin" → navigate to /admin
  → If role === "user"  → navigate to /dashboard

PROTECTED API CALL FLOW:
Any page → fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  → auth middleware extracts token
  → jwt.verify() decodes { id, role }
  → Sets req.user = { id, role }
  → Controller uses req.user.id for user-specific data

LOGOUT FLOW:
Navbar.tsx → localStorage.removeItem("token")
  → localStorage.removeItem("user")
  → navigate("/")
  → toast.success("Logged out!")
```

---

That's it! Follow this guide step by step to build your backend.
Every frontend file has comments showing exactly which API to call.
Use the Frontend → Backend File Mapping (Section 5) as your primary reference. 🚀
