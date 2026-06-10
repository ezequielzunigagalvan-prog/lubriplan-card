const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'lubriplan_dev_secret'

function requireAuth(req, res, next) {
  const header = req.headers.authorization
  console.log('[requireAuth] origin:', req.headers.origin)
  console.log('[requireAuth] authorization header:', header ? `PRESENTE (${header.slice(0, 20)}...)` : 'AUSENTE')
  console.log('[requireAuth] all headers:', JSON.stringify(Object.keys(req.headers)))
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado — token requerido' })
  }
  try {
    req.admin = jwt.verify(header.slice(7), SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

module.exports = { requireAuth, signToken }
