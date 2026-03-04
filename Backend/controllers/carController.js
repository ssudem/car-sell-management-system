const db = require("../config/db");
const getISTTimestamp = require("../utils/getISTTimestamp");

exports.getAllCars = async (req, res) => {
  try {
    let baseQuery = "SELECT * FROM cars WHERE 1=1";
    let countQuery = "SELECT COUNT(*) AS total FROM cars WHERE 1=1";
    const params = [];
    const countParams = [];

    if (req.query.brand) {
      const brands = Array.isArray(req.query.brand) ? req.query.brand : [req.query.brand];
      const placeholder = ` AND brand IN (${brands.map(() => "?").join(",")})`;
      baseQuery += placeholder;
      countQuery += placeholder;
      params.push(...brands);
      countParams.push(...brands);
    }

    if (req.query.fuelType) {
      const fuels = Array.isArray(req.query.fuelType) ? req.query.fuelType : [req.query.fuelType];
      const placeholder = ` AND fuel_type IN (${fuels.map(() => "?").join(",")})`;
      baseQuery += placeholder;
      countQuery += placeholder;
      params.push(...fuels);
      countParams.push(...fuels);
    }

    if (req.query.maxPrice) {
      baseQuery += " AND price <= ?";
      countQuery += " AND price <= ?";
      params.push(Number(req.query.maxPrice));
      countParams.push(Number(req.query.maxPrice));
    }

    if (req.query.search) {
      const words = req.query.search.trim().split(/\s+/);
      words.forEach(word => {
        const term = `%${word}%`;
        const clause = " AND (title LIKE ? OR brand LIKE ? OR description LIKE ? OR CAST(year AS CHAR) LIKE ? OR fuel_type LIKE ? OR transmission LIKE ?)";
        baseQuery += clause;
        countQuery += clause;
        params.push(term, term, term, term, term, term);
        countParams.push(term, term, term, term, term, term);
      });
    }

    if (req.query.status) {
      baseQuery += " AND status = ?";
      countQuery += " AND status = ?";
      params.push(req.query.status);
      countParams.push(req.query.status);
    }

    baseQuery += " ORDER BY created_at DESC";

    // Pagination mode: when "page" param is provided
    if (req.query.page) {
      const page = Math.max(1, Number(req.query.page));
      const limit = Number(req.query.limit) || 6;
      const offset = (page - 1) * limit;

      baseQuery += " LIMIT ? OFFSET ?";
      params.push(limit, offset);

      const [[countResult], [cars]] = await Promise.all([
        db.query(countQuery, countParams),
        db.query(baseQuery, params),
      ]);

      const total = countResult[0].total;
      return res.json({ cars, total, page, totalPages: Math.ceil(total / limit) });
    }

    // Non-paginated mode (backward compatible for admin, home page, etc.)
    if (req.query.limit) {
      baseQuery += " LIMIT ?";
      params.push(Number(req.query.limit));
      if (req.query.offset) {
        baseQuery += " OFFSET ?";
        params.push(Number(req.query.offset));
      }
    }

    const [cars] = await db.query(baseQuery, params);
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

exports.getCarById = async (req, res) => {
  try {
    const [cars] = await db.query("SELECT * FROM cars WHERE id = ?", [req.params.id]);
    if (cars.length === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    const car = cars[0];

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

exports.addCar = async (req, res) => {
  const { title, brand, price, year, mileage, fuelType, transmission, status, description, image, images } = req.body;

  try {
    const [result] = await db.query(
      "INSERT INTO cars (title, brand, price, year, mileage, fuel_type, transmission, status, description, image, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [title, brand, price, year, mileage, fuelType, transmission, status, description, image, getISTTimestamp()]
    );

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

exports.updateCar = async (req, res) => {
  const { title, brand, price, year, mileage, fuelType, transmission, status, description, image, images } = req.body;

  try {
    // Check if this is a restock (status changing to Available from Sold)
    const [oldCar] = await db.query("SELECT status, title FROM cars WHERE id = ?", [req.params.id]);
    
    await db.query(
      "UPDATE cars SET title=?, brand=?, price=?, year=?, mileage=?, fuel_type=?, transmission=?, status=?, description=?, image=? WHERE id=?",
      [title, brand, price, year, mileage, fuelType, transmission, status, description, image, req.params.id]
    );

    // Log restock activity
    if (oldCar.length > 0 && oldCar[0].status === 'Sold' && status === 'Available') {
      await db.query(
        "INSERT INTO activity_log (type, description, created_at) VALUES (?, ?, ?)",
        ['Restock', `${title || oldCar[0].title} restocked and available again`, getISTTimestamp()]
      );
    } else if (oldCar.length > 0) {
      await db.query(
        "INSERT INTO activity_log (type, description, created_at) VALUES (?, ?, ?)",
        ['Car Updated', `${title || oldCar[0].title} details updated`, getISTTimestamp()]
      );
    }

    // Update car_images if images array is provided
    if (images && images.length > 0) {
      await db.query("DELETE FROM car_images WHERE car_id = ?", [req.params.id]);
      const imageValues = images.map((url, i) => [req.params.id, url, i]);
      await db.query(
        "INSERT INTO car_images (car_id, image_url, sort_order) VALUES ?",
        [imageValues]
      );
    }

    res.json({ message: "Car updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const [car] = await db.query("SELECT title FROM cars WHERE id = ?", [req.params.id]);
    await db.query("DELETE FROM cars WHERE id = ?", [req.params.id]);
    
    // Log deletion
    if (car.length > 0) {
      await db.query(
        "INSERT INTO activity_log (type, description, created_at) VALUES (?, ?, ?)",
        ['Car Deleted', `${car[0].title} was removed from inventory`, getISTTimestamp()]
      );
    }

    res.json({ message: "Car deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
