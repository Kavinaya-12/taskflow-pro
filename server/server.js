const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const authRoutes = require('./routes/authRoutes')
const taskRoutes = require('./routes/taskRoutes')
const connectDB = require('./config/db')

dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const getAllowedOrigins = ({ configuredOrigins = process.env.CORS_ORIGIN, nodeEnv = process.env.NODE_ENV } = {}) => {
  const origins = (configuredOrigins || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  if (nodeEnv !== 'production') origins.push('http://localhost:5173')
  return [...new Set(origins)]
}
const allowedOrigins = getAllowedOrigins()

const proxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS || '0', 10)
app.set('trust proxy', Number.isInteger(proxyHops) && proxyHops >= 0 ? proxyHops : 0)
app.disable('x-powered-by')
app.use((_req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff')
  res.set('X-Frame-Options', 'DENY')
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  if (process.env.NODE_ENV === 'production') res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  next()
})
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
  const error = new Error('Origin is not allowed by CORS')
  error.status = 403
  return callback(error)
} }))
app.use(express.json({ limit: '32kb' }))
app.use((req, _res, next) => {
  if (req.body === undefined) req.body = {}
  next()
})
app.use(cookieParser())

app.get('/health', (_req, res) => {
  const ready = mongoose.connection.readyState === 1
  return res.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'unavailable' })
})
app.get('/', (_req, res) => res.send('TaskFlow Pro API Running...'))
app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }))
app.use((error, _req, res, _next) => {
  const status = error.status || (error.type === 'entity.too.large' ? 413 : error.name === 'ValidationError' || error.name === 'CastError' ? 400 : error.code === 11000 ? 409 : res.statusCode >= 400 ? res.statusCode : 500)
  res.status(status).json({ message: status === 500 ? 'Server error' : error.message })
})

const validateEnvironment = (env = process.env) => {
  if (!env.MONGO_URI) throw new Error('MONGO_URI is required')
  let mongoUrl
  try {
    mongoUrl = new URL(env.MONGO_URI)
  } catch {
    throw new Error('MONGO_URI must be a valid mongodb:// or mongodb+srv:// URI')
  }
  if (!['mongodb:', 'mongodb+srv:'].includes(mongoUrl.protocol) || !mongoUrl.hostname) {
    throw new Error('MONGO_URI must be a valid mongodb:// or mongodb+srv:// URI')
  }
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters')
  }
}

const getStartupDiagnostics = (error) => {
  const originalMessage = String(error?.message || '')
  const details = `${error?.name || ''} ${error?.code || ''} ${originalMessage}`.toLowerCase()
  let message = 'Startup failed; see error name and code for details.'
  if (/authentication failed|bad auth|auth failed/.test(details)) message = 'MongoDB authentication failed.'
  else if (/querysrv/.test(details) && /etimeout|timed out|timeout/.test(details)) message = 'MongoDB DNS SRV lookup timed out; check DNS resolution and outbound network access.'
  else if (/enotfound|eai_again|querysrv|dns/.test(details)) message = 'MongoDB hostname could not be resolved.'
  else if (/tls|ssl|certificate/.test(details)) message = 'MongoDB TLS connection failed.'
  else if (/timed out|timeout|server selection/.test(details)) message = 'MongoDB connection timed out or no server was selectable.'
  else if (/mongo_uri/.test(details)) message = 'MongoDB configuration is missing or invalid.'
  else if (/econnrefused|connection refused/.test(details)) message = 'MongoDB refused the connection.'
  const name = /^[A-Za-z][A-Za-z0-9_]{0,79}$/.test(error?.name || '') ? error.name : 'Error'
  const code = typeof error?.code === 'number' ? error.code : (typeof error?.code === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(error.code) ? error.code : undefined)
  return { name, ...(code === undefined ? {} : { code }), message }
}

const start = async ({ connect = connectDB } = {}) => {
  validateEnvironment()
  await connect()
  const port = Number(process.env.PORT) || 5000
  const server = app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`))
  const shutdown = async () => {
    server.close(async () => {
      await mongoose.disconnect()
      process.exit(0)
    })
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Startup failed:', JSON.stringify(getStartupDiagnostics(error)))
    process.exit(1)
  })
}

module.exports = app
module.exports.validateEnvironment = validateEnvironment
module.exports.getStartupDiagnostics = getStartupDiagnostics
module.exports.start = start
module.exports.getAllowedOrigins = getAllowedOrigins
