const cloudinary = require('cloudinary').v2

// Soporte para CLOUDINARY_URL (formato largo) o variables separadas
if (process.env.CLOUDINARY_URL) {
  // cloudinary.config() lo parsea automáticamente desde la env var
  cloudinary.config({ secure: true })
} else {
  cloudinary.config({
    cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
    api_key:     process.env.CLOUDINARY_API_KEY,
    api_secret:  process.env.CLOUDINARY_API_SECRET,
    secure:      true,
  })
}

// Sube un buffer de imagen y devuelve { url, public_id }
function uploadBuffer(buffer, folder = 'lubriplan-card') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // Transformaciones opcionales para optimizar al subir:
        transformation: [{ width: 1400, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
      },
      (err, result) => {
        if (err) return reject(err)
        resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )
    stream.end(buffer)
  })
}

// Elimina una imagen por su public_id
function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
}

module.exports = { uploadBuffer, deleteImage }
