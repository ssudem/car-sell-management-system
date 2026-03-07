# VisionCars — Frontend ↔ Backend API Guide

This document maps every frontend page to its backend API calls, showing which routes are hit and what data flows between them.

---

## 🔐 Authentication

### `Login.tsx`
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/login` | ❌ | Login with email + password |

**Response:** `{ token, user: { id, name, email, role, avatar } }`
Stores `token` and `user` in `localStorage`.

---

### `Register.tsx`
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | ❌ | Create new account |

**Request Body:** `{ name, email, password }`
**Response:** `{ token, user: { id, name, role } }`

---

## 🏠 Public Pages

### `Index.tsx` (Home Page)
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/cars?status=Available&limit=4` | ❌ | Fetch 4 featured cars |

---

### `BrowseCars.tsx`
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/cars?search=X&brand=Y&fuelType=Z&maxPrice=N&status=Available&page=1&limit=6` | ❌ | Filtered car search (paginated) |

**Query Params:** `search`, `brand` (multiple), `fuelType` (multiple), `maxPrice`, `status`, `page`, `limit`
Search matches against: title, brand, description, year, fuel_type, transmission (multi-word AND logic).
**Paginated Response:** `{ cars: [...], total: number, page: number, totalPages: number }`
Default: 6 cars per page. Resets to page 1 on filter change.

---

### `CarDetails.tsx`
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/cars/:id` | ❌ | Fetch car details + gallery images |
| GET | `/api/wishlist/check/:id` | ✅ User | Check if car is in user's wishlist |
| POST | `/api/wishlist` | ✅ User | Add car to wishlist |
| DELETE | `/api/wishlist/:carId` | ✅ User | Remove from wishlist |
| POST | `/api/inquiries` | ✅ User | Send inquiry about this car |
| POST | `/api/payments` | ✅ User | Purchase car (simulated payment) |

**Inquiry Body:** `{ carId, name, email, message }`
**Payment Body:** `{ carId, amount }`
Payment also updates car status to `Sold`.

---

## 👤 User Pages (Auth Required)

### `UserDashboard.tsx`
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/wishlist` | ✅ User | Fetch user's wishlist |
| GET | `/api/inquiries/my` | ✅ User | Fetch user's inquiries |
| GET | `/api/payments/my` | ✅ User | Fetch user's purchases |
| DELETE | `/api/wishlist/:carId` | ✅ User | Remove from wishlist |

---

### `Profile.tsx`
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/users/me` | ✅ User | Fetch profile data |
| PUT | `/api/users/me` | ✅ User | Update name, phone, address |
| PUT | `/api/users/me/avatar` | ✅ User | Upload profile picture (multipart) |
| PUT | `/api/users/me/password` | ✅ User | Change password |

---

## 🛡️ Admin Pages (Admin Auth Required)

### `AdminDashboard.tsx`
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/admin/stats` | ✅ Admin | Dashboard stat cards |
| GET | `/api/admin/activity` | ✅ Admin | Recent activity feed (15 latest) |

**Stats returned:** `totalCars`, `carsSold`, `carsAvailable`, `revenue`, `totalInquiries`, `totalUsers`
**Activity sources:** transactions, inquiries, cars, users, activity_log (restock/update/delete/reply events)

---

### `ManageInventory.tsx`
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/cars` | ✅ Admin | Fetch all cars (no status filter) |
| DELETE | `/api/cars/:id` | ✅ Admin | Delete a car |

---

### `AddCarForm.tsx`
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/cars/:id` | ❌ | Fetch car data for edit mode |
| POST | `/api/upload` | ✅ Admin | Upload car images to Cloudinary |
| POST | `/api/cars` | ✅ Admin | Add new car |
| PUT | `/api/cars/:id` | ✅ Admin | Update existing car |

**Upload:** Multipart form with `images` field (up to 5 files, 1MB each).
**Car Body:** `{ title, brand, price, year, mileage, fuelType, transmission, status, description, image, images[] }`

---

### `AdminInquiries.tsx`
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/inquiries` | ✅ Admin | Fetch all inquiries |
| PUT | `/api/inquiries/:id` | ✅ Admin | Mark inquiry as replied |

Also has Gmail compose link: opens `mail.google.com` with pre-filled recipient, subject, and body.

---

### `AdminTransactions.tsx`
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/payments` | ✅ Admin | Fetch all transactions |

---

### `ManageUsers.tsx`
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/admin/users` | ✅ Admin | Fetch all users (excludes passwords) |
| DELETE | `/api/admin/users/:id` | ✅ Admin | Delete a user (non-admin only) |
| PATCH | `/api/admin/users/:id/promote` | ✅ Admin | Promote user to admin role |
| PATCH | `/api/admin/users/:id/password` | ✅ Admin | Update user password (verifies old password) |

**Business rules:**
- Cannot delete or demote admin users
- Promoting a user to admin is irreversible from this panel
- Password update requires the user's current password for verification
- All actions are logged to `activity_log` table (types: `User Deleted`, `Role Promoted`, `Password Updated`)

---

## 📁 Backend Route Files → Controllers

| Route File | Base Path | Controller |
|------------|-----------|------------|
| `authRoutes.js` | `/api/auth` | `authController.js` |
| `carRoutes.js` | `/api/cars` | `carController.js` |
| `inquiryRoutes.js` | `/api/inquiries` | `inquiryController.js` |
| `paymentRoutes.js` | `/api/payments` | `paymentController.js` |
| `wishlistRoutes.js` | `/api/wishlist` | `wishlistController.js` |
| `userRoutes.js` | `/api/users` | `userController.js` |
| `uploadRoutes.js` | `/api/upload` | `uploadController.js` |
| `adminRoutes.js` | `/api/admin` | `adminController.js` |

---

## 🔒 Middleware

| Middleware | File | Purpose |
|-----------|------|---------|
| `auth` | `middleware/auth.js` | Verifies JWT token, attaches `req.user` |
| `adminAuth` | `middleware/auth.js` | Verifies JWT + checks `role === 'admin'` |
| `upload` | `middleware/upload.js` | Multer config for file uploads (1MB limit, jpeg/jpg/png/webp) |

---

## 🗄️ Database Tables

| Table | Key Columns | Used By |
|-------|-------------|---------|
| `users` | id, name, email, password, role, avatar, phone, address | Auth, Profile |
| `cars` | id, title, brand, price, year, mileage, fuel_type, transmission, status, image, description | All car pages |
| `car_images` | id, car_id, image_url, sort_order | Car gallery |
| `inquiries` | id, car_id, user_id, name, email, message, status | Inquiry form |
| `transactions` | id, user_id, car_id, amount, payment_status, payment_method | Payments |
| `wishlist` | id, user_id, car_id | Wishlist |
| `activity_log` | id, type, description, created_at | Admin activity feed |
