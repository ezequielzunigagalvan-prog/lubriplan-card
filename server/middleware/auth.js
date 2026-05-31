const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'lubriplan_dev_secret'

function requireAuth(req, res, next) {
  const header = req.headers.authorization
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
