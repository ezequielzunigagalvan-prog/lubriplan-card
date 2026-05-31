// Compress and convert an image File to a base64 JPEG data URL.
// Max dimension: 1400px, quality: 0.82 — keeps detail while staying ~100-300KB.
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file?.type.startsWith('image/')) {
      reject(new Error('El archivo no es una imagen válida'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Error al leer la imagen'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Error al procesar la imagen'))
      img.onload = () => {
        const MAX = 1400
        const scale = Math.min(1, MAX / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}
