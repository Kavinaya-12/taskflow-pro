const WINDOW_MS = 15 * 60 * 1000
const MAX_REQUESTS = 20
const MAX_CLIENTS = 10000
const clients = new Map()

const authRateLimit = (req, res, next) => {
  const now = Date.now()
  const key = req.ip || req.socket.remoteAddress || 'unknown'
  let bucket = clients.get(key)
  if (!bucket || bucket.resetAt <= now) bucket = { count: 0, resetAt: now + WINDOW_MS }

  bucket.count += 1
  clients.delete(key)
  clients.set(key, bucket)
  if (clients.size > MAX_CLIENTS) clients.delete(clients.keys().next().value)

  res.set('RateLimit-Limit', String(MAX_REQUESTS))
  res.set('RateLimit-Remaining', String(Math.max(0, MAX_REQUESTS - bucket.count)))
  res.set('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)))
  if (bucket.count > MAX_REQUESTS) {
    res.set('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)))
    return res.status(429).json({ message: 'Too many authentication attempts. Try again later.' })
  }
  return next()
}

module.exports = authRateLimit
