require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const path    = require('path')

const migrate  = require('./db/migrate')
const cardRouter = require('./routes/card')

const app  = express()
const PORT = process.env.PORT || 3001

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      cb(null, true)
    } else {
      cb(null, false)
    }
  },
  credentials: true,
}))

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Archivos estáticos (imágenes subidas) ─────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ ok: true, service: 'lubriplan-card-api', ts: new Date().toISOString() })
)

// ── Rutas del módulo Card ─────────────────────────────────────────────────────
app.use('/api/card', cardRouter)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }))

// ── Error handler global ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err.message)
  res.status(500).json({ error: err.message || 'Error interno del servidor' })
})

// ── Arranque ──────────────────────────────────────────────────────────────────
async function start() {
  try {
    await migrate()
    app.listen(PORT, () =>
      console.log(`[Server] LubriPlan Card API corriendo en puerto ${PORT}`)
    )
  } catch (err) {
    console.error('[Server] No se pudo iniciar:', err)
    process.exit(1)
  }
}

start()
