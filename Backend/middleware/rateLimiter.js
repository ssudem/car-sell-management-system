const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

// General API limiter — applies to all /api routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    message: "Too many requests, please try again later.",
  },
});

// Stricter limiter for auth endpoints (login / register)
const authLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5, // 5 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts, please try again after 2 minutes.",
  },
});

// Stricter limiter for upload endpoints
const uploadLimiter = rateLimit({
  windowMs: 2* 60 * 1000, // 2 minutes
  max: 8, // 8 uploads per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many upload requests, please try again later.",
  },
});

// Purchase limiter — 2 purchases per 2 minutes per user
const purchaseLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 2, // 2 purchases per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id?.toString() || ipKeyGenerator(req), // rate-limit per user, fallback to normalized IP
  message: {
    message: "Purchase limit reached. You can only make 2 purchases every 2 minutes.",
  },
});

module.exports = { apiLimiter, authLimiter, uploadLimiter, purchaseLimiter };
