import type { Request, Response, NextFunction } from "express";

const buckets = new Map<string, number>();

export function createRateLimit(
  windowMs = 3000,
  message = "Bạn thao tác quá nhanh, vui lòng thử lại."
) {
  return function rateLimit(req: any, res: any, next: NextFunction) {
    // Key ưu tiên userId → fallback IP
    const key = req.user?.userId
      ? `user:${req.user.userId}`
      : `ip:${req.ip}`;

    const now = Date.now();
    const last = buckets.get(key) || 0;

    if (now - last < windowMs) {
      return res.status(429).json({ error: message });
    }

    buckets.set(key, now);
    next();
  };
}