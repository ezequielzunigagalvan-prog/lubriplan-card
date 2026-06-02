const multer = require('multer')

// Multer con memory storage — el buffer va directo a Cloudinary, no toca el disco
module.exports = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Tipo de archivo no permitido'), false)
  },
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
})
