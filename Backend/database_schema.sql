-- ===== SELECT DATABASE =====
-- Note: Free SQL hosts generally do not allow creating a database.
-- We will just select the pre-created database provided to us.
USE sql12818604;

-- ===== USERS TABLE =====
CREATE TABLE IF NOT EXISTS users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  phone       VARCHAR(20)   DEFAULT NULL,
  address     TEXT          DEFAULT NULL,
  avatar      VARCHAR(500)  DEFAULT NULL,
  role        ENUM('user', 'admin') DEFAULT 'user',
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ===== CARS TABLE =====
CREATE TABLE IF NOT EXISTS cars (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  title         VARCHAR(200)  NOT NULL,
  brand         VARCHAR(100)  NOT NULL,
  price         DECIMAL(12,2) NOT NULL,
  year          INT           NOT NULL,
  mileage       INT           DEFAULT 0,
  fuel_type     VARCHAR(50)   NOT NULL,
  transmission  VARCHAR(50)   NOT NULL,
  status        ENUM('Available', 'Pending', 'Sold') DEFAULT 'Available',
  description   TEXT,
  image         VARCHAR(500),
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ===== CAR IMAGES TABLE =====
CREATE TABLE IF NOT EXISTS car_images (
  id        INT PRIMARY KEY AUTO_INCREMENT,
  car_id    INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

-- ===== WISHLIST TABLE =====
CREATE TABLE IF NOT EXISTS wishlist (
  id        INT PRIMARY KEY AUTO_INCREMENT,
  user_id   INT NOT NULL,
  car_id    INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist (user_id, car_id)
);

-- ===== INQUIRIES TABLE =====
CREATE TABLE IF NOT EXISTS inquiries (
  id        INT PRIMARY KEY AUTO_INCREMENT,
  car_id    INT NOT NULL,
  user_id   INT DEFAULT NULL,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(150) NOT NULL,
  message   TEXT NOT NULL,
  status    ENUM('Pending', 'Replied') DEFAULT 'Pending',
  admin_reply TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ===== TRANSACTIONS / PAYMENTS TABLE =====
CREATE TABLE IF NOT EXISTS transactions (
  id             INT PRIMARY KEY AUTO_INCREMENT,
  user_id        INT NOT NULL,
  car_id         INT NOT NULL,
  amount         DECIMAL(12,2) NOT NULL,
  payment_status ENUM('Processing', 'Completed', 'Failed') DEFAULT 'Processing',
  payment_method VARCHAR(50) DEFAULT 'Card',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

-- ===== ACTIVITY LOG TABLE =====
CREATE TABLE IF NOT EXISTS activity_log (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  type        VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
