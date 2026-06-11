const rateLimit = require('express-rate-limit')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos máximo
  message: 'Demasiados intentos de autenticación. Intenta nuevamente en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // No limitar si es un token válido
    return req.headers.authorization?.startsWith('Bearer ')
  },
})

const pinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Más permisivo para PIN (es más corto)
  message: 'Demasiados intentos de validación PIN. Intenta nuevamente en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = { authLimiter, pinLimiter }
