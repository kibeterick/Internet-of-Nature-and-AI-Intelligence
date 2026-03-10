import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const identifier = this.getIdentifier(req);
      const now = Date.now();

      if (!this.store[identifier]) {
        this.store[identifier] = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        return next();
      }

      const record = this.store[identifier];

      if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + this.windowMs;
        return next();
      }

      if (record.count >= this.maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        res.setHeader("Retry-After", retryAfter.toString());
        res.setHeader("X-RateLimit-Limit", this.maxRequests.toString());
        res.setHeader("X-RateLimit-Remaining", "0");
        res.setHeader("X-RateLimit-Reset", record.resetTime.toString());

        return res.status(429).json({
          error: "Too many requests",
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          retryAfter,
        });
      }

      record.count++;
      res.setHeader("X-RateLimit-Limit", this.maxRequests.toString());
      res.setHeader(
        "X-RateLimit-Remaining",
        (this.maxRequests - record.count).toString(),
      );
      res.setHeader("X-RateLimit-Reset", record.resetTime.toString());

      next();
    };
  }

  private getIdentifier(req: Request): string {
    // Use IP address or user ID if authenticated
    return req.ip || req.socket.remoteAddress || "unknown";
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }
}

// Different rate limits for different endpoints
export const apiLimiter = new RateLimiter(100, 60000); // 100 requests per minute
export const authLimiter = new RateLimiter(5, 60000); // 5 auth attempts per minute
export const aiLimiter = new RateLimiter(20, 60000); // 20 AI requests per minute
export const uploadLimiter = new RateLimiter(10, 60000); // 10 uploads per minute
