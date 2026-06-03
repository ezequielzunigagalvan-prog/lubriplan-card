const express    = require('express')
const { v4: uuid } = require('uuid')
const pool       = require('../db/pool')
const { requireAuth, signToken } = require('../middleware/auth')
const upload     = require('../middleware/uploadCard')
const { uploadBuffer, deleteImage } = require('../lib/cloudinary')

const router = express.Router()

// ── Helper: construye el objeto equipo completo desde la BD ──────────────────
async function buildEquipo(id) {
  const eq = await pool.query('SELECT * FROM equipos_card WHERE id = $1', [id])
  if (!eq.rows.length) return null

  const imgs = await pool.query(
    'SELECT * FROM imagenes_equipo_card WHERE equipo_id=$1 ORDER BY orden, created_at',
    [id]
  )
  const pts = await pool.query(
    'SELECT * FROM puntos_lubricacion_card WHERE equipo_id=$1',
    [id]
  )

  const e = eq.rows[0]
  const imagenes = imgs.rows.map(i => ({
    id: i.id,
    url: i.url,
    flechas: i.flechas || [],
  }))

  return {
    id:          e.id,
    codigo:      e.codigo,
    nombre:      e.nombre,
    area:        e.area,
    imagen:      e.imagen,
    descripcion: e.descripcion,
    activo:      e.activo,
    imagenes,
    imagenUrl:   imagenes[0]?.url || null,
    puntos: pts.rows.map(p => ({
      id:        p.id,
      nombre:    p.nombre,
      frecuencia:p.frecuencia,
      lubricante:p.lubricante,
      cantidad:  parseFloat(p.cantidad) || 0,
      unidad:    p.unidad,
      metodo:    p.metodo,
      x:         parseFloat(p.x) || 0,
      y:         parseFloat(p.y) || 0,
      notas:     p.notas,
      imagenId:  p.imagen_id,
    })),
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

// Login admin → devuelve JWT
router.post('/auth/admin', async (req, res) => {
  const { email, password } = req.body || {}
  if (
    email    !== (process.env.ADMIN_EMAIL    || 'admin@lubriplan.com') ||
    password !== (process.env.ADMIN_PASSWORD || 'Admin1234')
  ) {
    return res.status(401).json({ error: 'Credenciales incorrectas' })
  }
  const token = signToken({ role: 'admin', email })
  res.json({ token })
})

// Validar PIN técnico — PÚBLICO
router.post('/auth/pin', async (req, res) => {
  const { pin } = req.body || {}
  if (!pin || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'PIN debe ser 4 dígitos' })
  }
  try {
    const result = await pool.query(
      'SELECT * FROM tecnicos_card WHERE pin=$1 AND activo=true', [pin]
    )
    if (!result.rows.length) return res.status(401).json({ error: 'PIN incorrecto' })

    const t = result.rows[0]
    await pool.query(
      'UPDATE tecnicos_card SET ultima_consulta=CURRENT_DATE WHERE id=$1', [t.id]
    )
    res.json({ id: t.id, nombre: t.nombre, activo: t.activo })
  } catch (err) {
    console.error('[PIN]', err)
    res.status(500).json({ error: 'Error interno' })
  }
})

// ── Equipos ───────────────────────────────────────────────────────────────────

// Listar todos — requiere auth
router.get('/equipos', requireAuth, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id FROM equipos_card ORDER BY created_at DESC'
    )
    const equipos = await Promise.all(rows.map(r => buildEquipo(r.id)))
    res.json(equipos.filter(Boolean))
  } catch (err) {
    console.error('[GET equipos]', err)
    res.status(500).json({ error: 'Error obteniendo equipos' })
  }
})

// Obtener uno — PÚBLICO (lo usa el QR del técnico)
router.get('/equipos/:id', async (req, res) => {
  try {
    const equipo = await buildEquipo(req.params.id)
    if (!equipo) return res.status(404).json({ error: 'Equipo no encontrado' })
    res.json(equipo)
  } catch (err) {
    console.error('[GET equipo]', err)
    res.status(500).json({ error: 'Error obteniendo equipo' })
  }
})

// Crear — requiere auth
router.post('/equipos', requireAuth, async (req, res) => {
  const { codigo, nombre, area, imagen, descripcion } = req.body || {}
  if (!nombre?.trim() || !area?.trim()) {
    return res.status(400).json({ error: 'nombre y area son requeridos' })
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO equipos_card (codigo, nombre, area, imagen, descripcion)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [codigo || null, nombre.trim(), area.trim(), imagen || 'motor', descripcion || null]
    )
    res.status(201).json(await buildEquipo(rows[0].id))
  } catch (err) {
    console.error('[POST equipo]', err)
    res.status(500).json({ error: 'Error creando equipo' })
  }
})

// Actualizar — requiere auth
router.put('/equipos/:id', requireAuth, async (req, res) => {
  const { codigo, nombre, area, imagen, descripcion, activo } = req.body || {}
  try {
    const { rowCount } = await pool.query(
      `UPDATE equipos_card
       SET codigo=$1, nombre=$2, area=$3, imagen=$4, descripcion=$5, activo=$6, updated_at=NOW()
       WHERE id=$7`,
      [codigo||null, nombre, area, imagen||'motor', descripcion||null, activo!==false, req.params.id]
    )
    if (!rowCount) return res.status(404).json({ error: 'Equipo no encontrado' })
    res.json(await buildEquipo(req.params.id))
  } catch (err) {
    console.error('[PUT equipo]', err)
    res.status(500).json({ error: 'Error actualizando equipo' })
  }
})

// Eliminar — requiere auth
router.delete('/equipos/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT filename FROM imagenes_equipo_card WHERE equipo_id=$1', [req.params.id]
    )
    await Promise.allSettled(rows.map(({ filename }) => filename && deleteImage(filename)))
    await pool.query('DELETE FROM equipos_card WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    console.error('[DELETE equipo]', err)
    res.status(500).json({ error: 'Error eliminando equipo' })
  }
})

// ── Puntos ────────────────────────────────────────────────────────────────────

// Reemplaza todos los puntos del equipo — requiere auth
router.put('/equipos/:id/puntos', requireAuth, async (req, res) => {
  const { puntos } = req.body || {}
  try {
    await pool.query('DELETE FROM puntos_lubricacion_card WHERE equipo_id=$1', [req.params.id])
    if (Array.isArray(puntos) && puntos.length) {
      for (const p of puntos) {
        await pool.query(
          `INSERT INTO puntos_lubricacion_card
           (id, equipo_id, imagen_id, nombre, frecuencia, lubricante, cantidad, unidad, metodo, x, y, notas)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [
            p.id || uuid(),
            req.params.id,
            p.imagenId || null,
            p.nombre,
            p.frecuencia || null,
            p.lubricante || null,
            p.cantidad   || 0,
            p.unidad     || null,
            p.metodo     || null,
            p.x || 0,
            p.y || 0,
            p.notas || null,
          ]
        )
      }
    }
    res.json(await buildEquipo(req.params.id))
  } catch (err) {
    console.error('[PUT puntos]', err)
    res.status(500).json({ error: 'Error actualizando puntos' })
  }
})

// ── Imágenes ──────────────────────────────────────────────────────────────────

// Subir imagen — requiere auth
router.post('/equipos/:id/imagenes', requireAuth, upload.single('imagen'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió archivo de imagen' })
  try {
    const { url, publicId } = await uploadBuffer(req.file.buffer)

    const { rows: maxRows } = await pool.query(
      'SELECT COALESCE(MAX(orden),-1) AS m FROM imagenes_equipo_card WHERE equipo_id=$1',
      [req.params.id]
    )
    const orden = (maxRows[0].m ?? -1) + 1

    const { rows } = await pool.query(
      `INSERT INTO imagenes_equipo_card (equipo_id, filename, url, flechas, orden)
       VALUES ($1,$2,$3,'[]',$4) RETURNING id`,
      [req.params.id, publicId, url, orden]
    )
    res.status(201).json({ id: rows[0].id, url, flechas: [] })
  } catch (err) {
    console.error('[POST imagen]', err)
    res.status(500).json({ error: 'Error guardando imagen' })
  }
})

// Actualizar flechas de todas las imágenes del equipo — requiere auth
router.put('/equipos/:id/imagenes', requireAuth, async (req, res) => {
  const { imagenes } = req.body || {}
  if (!Array.isArray(imagenes)) return res.status(400).json({ error: 'imagenes debe ser array' })
  try {
    for (const img of imagenes) {
      if (!img.id) continue
      await pool.query(
        'UPDATE imagenes_equipo_card SET flechas=$1, orden=$2 WHERE id=$3 AND equipo_id=$4',
        [JSON.stringify(img.flechas || []), img.orden ?? 0, img.id, req.params.id]
      )
    }
    res.json(await buildEquipo(req.params.id))
  } catch (err) {
    console.error('[PUT imagenes]', err)
    res.status(500).json({ error: 'Error actualizando imágenes' })
  }
})

// Eliminar imagen — requiere auth
router.delete('/equipos/:id/imagenes/:imgId', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT filename FROM imagenes_equipo_card WHERE id=$1 AND equipo_id=$2',
      [req.params.imgId, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Imagen no encontrada' })

    if (rows[0].filename) await deleteImage(rows[0].filename).catch(() => {})

    await pool.query('DELETE FROM imagenes_equipo_card WHERE id=$1', [req.params.imgId])
    await pool.query(
      'UPDATE puntos_lubricacion_card SET imagen_id=NULL WHERE imagen_id=$1',
      [req.params.imgId]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error('[DELETE imagen]', err)
    res.status(500).json({ error: 'Error eliminando imagen' })
  }
})

// ── Técnicos ───────────────────────────────────────────────────────────────────

router.get('/tecnicos', requireAuth, async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tecnicos_card ORDER BY created_at')
    res.json(rows.map(t => ({
      id: t.id, nombre: t.nombre, pin: t.pin,
      activo: t.activo, ultimaConsulta: t.ultima_consulta,
    })))
  } catch (err) {
    console.error('[GET tecnicos]', err)
    res.status(500).json({ error: 'Error obteniendo técnicos' })
  }
})

router.post('/tecnicos', requireAuth, async (req, res) => {
  const { nombre, pin } = req.body || {}
  if (!nombre?.trim() || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'nombre y PIN de 4 dígitos son requeridos' })
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO tecnicos_card (nombre, pin) VALUES ($1,$2) RETURNING *',
      [nombre.trim(), pin]
    )
    const t = rows[0]
    res.status(201).json({ id: t.id, nombre: t.nombre, pin: t.pin, activo: t.activo, ultimaConsulta: t.ultima_consulta })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ese PIN ya está en uso' })
    console.error('[POST tecnico]', err)
    res.status(500).json({ error: 'Error creando técnico' })
  }
})

router.put('/tecnicos/:id', requireAuth, async (req, res) => {
  const { nombre, pin, activo } = req.body || {}
  try {
    const { rows, rowCount } = await pool.query(
      'UPDATE tecnicos_card SET nombre=$1, pin=$2, activo=$3 WHERE id=$4 RETURNING *',
      [nombre, pin, activo !== false, req.params.id]
    )
    if (!rowCount) return res.status(404).json({ error: 'Técnico no encontrado' })
    const t = rows[0]
    res.json({ id: t.id, nombre: t.nombre, pin: t.pin, activo: t.activo, ultimaConsulta: t.ultima_consulta })
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ese PIN ya está en uso' })
    console.error('[PUT tecnico]', err)
    res.status(500).json({ error: 'Error actualizando técnico' })
  }
})

router.delete('/tecnicos/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM tecnicos_card WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    console.error('[DELETE tecnico]', err)
    res.status(500).json({ error: 'Error eliminando técnico' })
  }
})

router.patch('/tecnicos/:id/toggle', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE tecnicos_card SET activo=NOT activo WHERE id=$1 RETURNING activo',
      [req.params.id]
    )
    res.json({ activo: rows[0]?.activo })
  } catch (err) {
    console.error('[PATCH tecnico toggle]', err)
    res.status(500).json({ error: 'Error actualizando técnico' })
  }
})

module.exports = router
