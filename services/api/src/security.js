// Per-process limits bound local resource use; hosting may add distributed limits.
export function publicReadLimit({ limit = 120, windowMs = 60000 } = {}) {
  const clients = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [ip, entry] of clients) if (entry.until <= now) clients.delete(ip);
    const ip = req.ip || 'local';
    let entry = clients.get(ip);
    if (!entry) {
      if (clients.size >= 10000) {
        res.set('Retry-After', '60');
        return res.status(429).json({
          error: {
            code: 'RATE_LIMITED',
            message: 'Server is busy. Try again shortly.',
            details: [],
          },
        });
      }
      entry = { count: 0, until: now + windowMs };
      clients.set(ip, entry);
    }
    if (++entry.count > limit) {
      res.set('Retry-After', String(Math.ceil((entry.until - now) / 1000)));
      return res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Try again shortly.',
          details: [],
        },
      });
    }
    next();
  };
}
