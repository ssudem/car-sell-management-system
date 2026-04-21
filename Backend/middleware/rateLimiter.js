const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const { Redis } = require("@upstash/redis");

// Create Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Custom express-rate-limit store backed by Upstash Redis.
 *
 * Uses atomic INCR + PEXPIRE (no Lua SCRIPT LOAD needed), which is
 * fully compatible with Upstash's serverless REST API.
 */
class UpstashRedisStore {
  constructor(prefix = "rl:") {
    this.prefix = prefix;
  }

  /** Called by express-rate-limit after construction. */
  init(options) {
    this.windowMs = options.windowMs;
  }

  /** Prepend the prefix to a key. */
  prefixKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * Increment a client's hit counter.
   * INCR is atomic and creates the key if it doesn't exist.
   * On the first hit (totalHits === 1) we set the expiry window.
   */
  async increment(_key) {
    const key = this.prefixKey(_key);

    const totalHits = await redis.incr(key);

    if (totalHits === 1) {
      // First request in this window — set the expiry
      await redis.pexpire(key, this.windowMs);
    }

    const ttl = await redis.pttl(key);

    return {
      totalHits,
      resetTime: new Date(Date.now() + Math.max(ttl, 0)),
    };
  }

  /** Decrement a client's hit counter. */
  async decrement(_key) {
    const key = this.prefixKey(_key);
    await redis.decr(key);
  }

  /** Reset (delete) a client's hit counter. */
  async resetKey(_key) {
    const key = this.prefixKey(_key);
    await redis.del(key);
  }

  /**
   * Fetch a client's current hit count and reset time.
   * Returns `undefined` when no record exists.
   */
  async get(_key) {
    const key = this.prefixKey(_key);
    const [totalHits, ttl] = await Promise.all([
      redis.get(key),
      redis.pttl(key),
    ]);

    if (totalHits === null || ttl <= 0) {
      return undefined;
    }

    return {
      totalHits: Number(totalHits),
      resetTime: new Date(Date.now() + ttl),
    };
  }
}

// ─── Limiter instances ───────────────────────────────────────────────

// General API limiter — applies to all /api routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  store: new UpstashRedisStore("rl:api:"),
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
  store: new UpstashRedisStore("rl:auth:"),
  message: {
    message: "Too many authentication attempts, please try again after 2 minutes.",
  },
});

// Stricter limiter for upload endpoints
const uploadLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 8, // 8 uploads per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  store: new UpstashRedisStore("rl:upload:"),
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
  store: new UpstashRedisStore("rl:purchase:"),
  keyGenerator: (req) => req.user?.id?.toString() || ipKeyGenerator(req), // rate-limit per user, fallback to normalized IP
  message: {
    message: "Purchase limit reached. You can only make 2 purchases every 2 minutes.",
  },
});

module.exports = { apiLimiter, authLimiter, uploadLimiter, purchaseLimiter };
